const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { routeQuery } = require('../agents/routerAgent');
const { retrieveRelevantChunks } = require('../agents/retrievalAgent');
const { validateGrounding, FALLBACK_UNGROUNDED_MESSAGE } = require('../agents/validationAgent');
const { generateCitations } = require('../agents/citationAgent');
const ChatMessage = require('../models/ChatMessage');
const ChatThread = require('../models/ChatThread');
const QueryAnalytics = require('../models/QueryAnalytics');
const { isInMemoryFallback } = require('../config/db');

// In-Memory message/thread caches
const inMemoryThreads = global.__inMemoryThreads || new Map();
const inMemoryMessages = global.__inMemoryMessages || new Map();
const inMemoryAnalytics = global.__inMemoryAnalytics || [];
global.__inMemoryThreads = inMemoryThreads;
global.__inMemoryMessages = inMemoryMessages;
global.__inMemoryAnalytics = inMemoryAnalytics;

let googleGenAI = null;
if (env.GEMINI_API_KEY) {
  googleGenAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

const SYSTEM_INSTRUCTION = `You are CampusRAG, an authoritative, helpful, and strictly verified Academic Registrar Assistant for the college.
Your mission is to provide accurate, grounded answers to students and faculty regarding college regulations, admissions, fees, exam policies, academic calendars, hostel rules, and placement records.

STRICT GROUNDING RULES:
1. Base your answer EXCLUSIVELY on the provided Document Context snippets below.
2. If the answer cannot be determined from the provided context, state that clearly and do not speculate or fabricate policies.
3. When referencing rules, dates, fees, or requirements, cite the document name and page number directly.
4. Format your response cleanly using Markdown, bullet points, and tables where appropriate.
5. If mathematical calculations, grading formulas, or fee totals are involved, you can format them clearly with Markdown or KaTeX.`;

/**
 * Fallback synthesizer if no external LLM API key is provided
 */
const synthesizeOfflineResponse = (query, chunks, citations) => {
  const primaryChunk = chunks[0];
  const lines = [];
  lines.push(`Based on verified college documentation (**${primaryChunk.title}**, Page ${primaryChunk.pageNumber}):\n`);
  
  // Extract key sentences
  const sentences = chunks
    .map((c) => c.text)
    .join(' ')
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.length > 25)
    .slice(0, 4);

  for (const s of sentences) {
    lines.push(`- ${s}`);
  }

  lines.push(`\n**Official Source References:**`);
  citations.forEach((c, idx) => {
    lines.push(`${idx + 1}. *${c.title}* (Page ${c.pageNumber}) — Relevance: ${(c.similarityScore * 100).toFixed(0)}%`);
  });

  return lines.join('\n');
};

/**
 * Execute Complete RAG Pipeline with optional token streaming
 */
const executeRagPipeline = async ({
  threadId,
  userQuery,
  preferredDepartment = 'all',
  user,
  onToken = null, // callback for streaming tokens
}) => {
  const startTime = Date.now();

  // 1. Router Agent
  const routing = await routeQuery({
    query: userQuery,
    preferredDepartment,
  });

  const effectiveDept = routing.searchNamespace;

  // 2. Retrieval Agent
  const retrieval = await retrieveRelevantChunks({
    query: userQuery,
    department: effectiveDept,
    topK: 4,
    minThreshold: 0.65,
  });

  // 3. Validation & Grounding Agent
  const validation = validateGrounding({
    retrievedChunks: retrieval.chunks,
    topScore: retrieval.topScore,
    minThreshold: 0.65,
  });

  let responseText = '';
  let citations = [];
  const wasGrounded = validation.isGrounded;
  const confidenceScore = validation.confidenceScore;

  if (!wasGrounded) {
    // Ungrounded query -> standard fallback, no creative hallucination
    responseText = validation.fallbackMessage || FALLBACK_UNGROUNDED_MESSAGE;
    if (onToken) {
      onToken(responseText);
    }
  } else {
    // 4. Citation Agent
    citations = generateCitations(retrieval.chunks);

    // 5. Context Assembly
    const contextText = retrieval.chunks
      .map((c, i) => `--- CONTEXT CHUNK ${i + 1} [Document: "${c.title}", Page: ${c.pageNumber}, Dept: ${c.department}] ---\n${c.text}`)
      .join('\n\n');

    const promptWithContext = `${SYSTEM_INSTRUCTION}

DOCUMENT CONTEXT:
${contextText}

STUDENT QUERY:
${userQuery}

Please provide a direct, verified answer backed strictly by the context above:`;

    // 6. Generation (Gemini 2.5 Flash / 1.5 Flash -> OpenRouter -> Offline Synthesizer)
    let generated = false;

    if (env.GEMINI_API_KEY) {
      if (!googleGenAI) googleGenAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      
      const candidateModels = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
      ];

      for (const modelName of candidateModels) {
        try {
          const model = googleGenAI.getGenerativeModel({ model: modelName });
          let modelResponseText = '';

          if (onToken) {
            try {
              const streamResult = await model.generateContentStream(promptWithContext);
              // Suppress unhandled background stream promise error
              streamResult.response.catch(() => {});

              for await (const chunk of streamResult.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                  modelResponseText += chunkText;
                  onToken(chunkText);
                }
              }
            } catch (streamErr) {
              console.warn(`[RAGService] Streaming failed on model '${modelName}': ${streamErr.message}. Generating full content fallback...`);
              const result = await model.generateContent(promptWithContext);
              modelResponseText = result.response.text();
              if (modelResponseText) {
                const words = modelResponseText.split(' ');
                for (const w of words) {
                  onToken(w + ' ');
                  await new Promise((r) => setTimeout(r, 10));
                }
              }
            }
          } else {
            const result = await model.generateContent(promptWithContext);
            modelResponseText = result.response.text();
          }

          if (modelResponseText && modelResponseText.trim().length > 0) {
            responseText = modelResponseText;
            generated = true;
            console.log(`[RAGService] Successfully generated grounded response with model '${modelName}'.`);
            break;
          }
        } catch (geminiErr) {
          console.warn(`[RAGService] Gemini model '${modelName}' failed/rate-limited: ${geminiErr.message}. Cascading to next candidate model...`);
        }
      }
    }

    if (!generated && env.OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.CLIENT_URL,
            'X-Title': 'CampusRAG',
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
            messages: [
              { role: 'system', content: SYSTEM_INSTRUCTION },
              { role: 'user', content: `CONTEXT:\n${contextText}\n\nQUERY:\n${userQuery}` },
            ],
            stream: !!onToken,
          }),
        });

        if (response.ok) {
          if (onToken && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunkStr = decoder.decode(value, { stream: true });
              const lines = chunkStr.split('\n').filter((l) => l.startsWith('data: '));
              for (const line of lines) {
                const jsonStr = line.replace('data: ', '').trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const token = parsed.choices?.[0]?.delta?.content || '';
                  responseText += token;
                  onToken(token);
                } catch (e) {}
              }
            }
          } else {
            const data = await response.json();
            responseText = data.choices?.[0]?.message?.content || '';
          }
          generated = true;
        }
      } catch (orErr) {
        console.warn(`[RAGService] OpenRouter failed: ${orErr.message}. Using offline synthesizer.`);
      }
    }

    if (!generated) {
      // Offline Grounded Synthesizer
      responseText = synthesizeOfflineResponse(userQuery, retrieval.chunks, citations);
      if (onToken) {
        // Stream out in simulated chunks for pleasant UI experience
        const words = responseText.split(' ');
        for (const w of words) {
          onToken(w + ' ');
          await new Promise((r) => setTimeout(r, 15));
        }
      }
    }
  }

  const responseTimeMs = Date.now() - startTime;

  // 7. Persist AI Message
  let aiMessage = null;
  const messageId = uuidv4();

  if (!isInMemoryFallback()) {
    aiMessage = await ChatMessage.create({
      threadId,
      sender: 'ai',
      text: responseText,
      confidenceScore,
      wasGrounded,
      department: effectiveDept,
      citations,
    });

    await ChatThread.findByIdAndUpdate(threadId, {
      lastMessage: responseText.substring(0, 100),
      updatedAt: new Date(),
    });

    await QueryAnalytics.create({
      queryText: userQuery,
      department: effectiveDept,
      wasGrounded,
      confidenceScore,
      retrievedChunksCount: retrieval.chunks.length,
      userId: user?._id || user?.id,
      userRole: user?.role || 'student',
      responseTimeMs,
    });
  } else {
    aiMessage = {
      _id: messageId,
      id: messageId,
      threadId,
      sender: 'ai',
      text: responseText,
      confidenceScore,
      wasGrounded,
      department: effectiveDept,
      citations,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const msgs = inMemoryMessages.get(threadId) || [];
    msgs.push(aiMessage);
    inMemoryMessages.set(threadId, msgs);

    const thread = inMemoryThreads.get(threadId);
    if (thread) {
      thread.lastMessage = responseText.substring(0, 100);
      thread.updatedAt = new Date();
    }

    inMemoryAnalytics.push({
      queryText: userQuery,
      department: effectiveDept,
      wasGrounded,
      confidenceScore,
      retrievedChunksCount: retrieval.chunks.length,
      userId: user?.id,
      userRole: user?.role || 'student',
      responseTimeMs,
      createdAt: new Date(),
    });
  }

  return {
    message: aiMessage,
    wasGrounded,
    confidenceScore,
    department: effectiveDept,
    citations,
    responseTimeMs,
  };
};

module.exports = {
  executeRagPipeline,
  inMemoryThreads,
  inMemoryMessages,
  inMemoryAnalytics,
};
