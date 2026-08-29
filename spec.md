## Complete Specification

---

### Project Overview & Tech Stack

#### Project Overview

Build a production-ready, full-stack AI platform called **CampusRAG: Multi-Department Academic Assistant & Knowledge Engine**. The platform provides students and faculty with verifiable, hallucination-resistant answers to campus queries (admissions, fee schedules, exam policies, academic calendars, hostel rules, and placement records) using a multi-collection Retrieval-Augmented Generation (RAG) architecture. The platform supports role-based access control (Student vs. Department Admin), document ingestion with semantic chunking and vector indexing, hybrid vector retrieval with citation extraction, confidence scoring, conversation history, and real-time token streaming.

#### Tech Stack

* **Frontend:** Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, Lucide React, KaTeX (for mathematical/policy notation), and React Markdown.
* **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JSON Web Tokens (JWT), `@pinecone-database/pinecone` (or Qdrant vector client), LangChain / LangGraph, Multer, `pdf-parse`, helmet, morgan, compression, express-validator, and bcryptjs.
* **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`, `gemini-3.7-flash`, `gemini-embedding-001`, `text-embedding-004`) as primary, OpenRouter API as fallback.
* **Document & Vector Pipeline:** LangChain text splitters (RecursiveCharacterTextSplitter), Pinecone Serverless vector database, and MongoDB collection storage for file metadata and conversation states.

---

### Authentication, Workflows, and Agentic Orchestration

#### Authentication & RBAC

The authentication system must enforce strict role-based access control with two primary roles:

* **Student:** Can access the conversational interface, select document domains/departments, query documents, view citations, rate answers (thumbs up/down), and manage personal conversation history.
* **Department Admin:** Can upload administrative PDFs/notices, trigger document re-indexing, manage document collections, delete stale knowledge bases, and view query analytics.

Password hashing must use bcrypt at cost factor 12. Authentication state must persist on the client via Zustand with HTTP-bearer JWT tokens validated against `/api/auth/me`.

#### Ingestion & RAG Workflow Management

1. **Document Ingestion Workflow:** Admins upload campus PDFs $\rightarrow$ Multer buffers file $\rightarrow$ `pdf-parse` extracts raw text $\rightarrow$ RecursiveCharacterTextSplitter divides content into overlapping chunks (1,000 characters, 200 overlap) $\rightarrow$ Google `gemini-embedding-001` / `text-embedding-004` generates dense vector representations $\rightarrow$ Vectors stored in Pinecone with metadata payload (`documentId`, `department`, `pageNumber`, `chunkText`).
2. **Retrieval & Query Workflow:** Student asks a question $\rightarrow$ Input sanitized $\rightarrow$ Embed question $\rightarrow$ Cosine similarity search against selected department namespace in Pinecone (top-$k=4$) $\rightarrow$ Context assembly with strict citation boundaries $\rightarrow$ LLM generation with fallback handling $\rightarrow$ Response delivered with confidence score and document references.

#### Agentic Orchestration

The query pipeline executes via a deterministic multi-agent chain:

* **Router Agent:** Analyzes the prompt intent, detects target department/category (e.g., Accounts, Hostel, Academics), and selects the vector namespace.
* **Retrieval Agent:** Fetches the top-k document chunks and filters out chunks below a similarity score threshold (0.65).
* **Grounding & Validation Agent:** Cross-checks the generated answer against the retrieved chunk context. If context is missing or irrelevant, it halts hallucination and emits the standard `NO_GROUNDED_DATA` fallback response.
* **Citation Agent:** Extracts exact document names, pages, and chunk IDs to generate interactive source badges.

---

### Integrations, Executions, AI Generation, and Real-Time Layer

#### Vector & Storage Integrations

* **Pinecone Serverless / Qdrant:** Stores embedding vectors organized by department namespaces (`admissions`, `academics`, `examinations`, `hostel`, `placements`).
* **MongoDB Atlas:** Persists users, structured document metadata, chat threads, messages, citations, and evaluation logs.

#### Execution & Grounding Engine

Every user query creates an `ExecutionMessage` record. The retrieval engine computes a aggregate **Grounding Confidence Score** ($0.0 - 1.0$) based on similarity metrics. If no retrieved chunks exceed the minimum relevance threshold ($0.65$), the system does not invoke the LLM for creative generation, but directly returns:

> *"The requested information is not available in the verified college knowledge base. Please contact the relevant department office directly."*

#### AI Generation & Streaming

* Generates responses using `gemini-2.5-flash` / `gemini-3.7-flash` with system prompts strictly instructing the model to act as a verified campus registrar assistant.
* Streams response tokens directly to the client via Server-Sent Events (SSE) or chunked HTTP transfer for responsive interaction.
* When `GEMINI_API_KEY` is unavailable, gracefully falls back to `OPENROUTER_API_KEY` with an identical output schema.

#### Real-Time Layer & Analytics

* Real-time SSE token stream for live answer generation.
* Admin dashboard live telemetry updating active document indexing statuses (`UPLOADING`, `CHUNKING`, `EMBEDDING`, `INDEXED`, `FAILED`).

---

### Frontend Pages

The application utilizes Next.js Pages Router with a responsive, light/dark accessible layout:

* **`/`** – Landing page introducing the campus AI assistant, supported departments, verifiable citation feature highlights, and portal login CTA.
* **`/login`** – Student and Admin authentication portal with JWT handling and Zustand session persistence.
* **`/register`** – Student registration page with department selection and validation.
* **`/chat`** – Main conversational interface featuring department selector, chat thread sidebar, message stream, interactive citation drawer, and source highlighting.
* **`/chat/[threadId]`** – Persistent conversation route loading previous chat history and grounded sources.
* **`/admin/dashboard`** – Admin analytics console showing popular search topics, unresolved queries, department-wise question volume, and knowledge base coverage stats.
* **`/admin/documents`** – Document management portal to upload PDFs, trigger ingestion pipelines, view chunk counts, and delete outdated notices.
* **`/settings`** – Profile settings, theme toggle, and API connection status indicators.

---

### Backend Architecture & Database Collections

#### Backend Architecture

* **Routes:** Express routers declaring strict input schemas with `express-validator`.
* **Controllers:** Lean request parsers and response handlers (zero direct DB queries).
* **Services:** Business logic containment (`authService.js`, `ragService.js`, `documentService.js`, `embeddingService.js`, `vectorService.js`).
* **Agents Layer:** Implements `routerAgent.js`, `retrievalAgent.js`, `validationAgent.js`, and `citationAgent.js`.
* **Config Layer:** Environment variable enforcement, MongoDB Mongoose connection, and Pinecone vector client setup.

#### Database Collections

* **Users:** Stores authentication credentials (`name`, `email`, `password` with `select: false`, `role: student | admin`, `department`, `createdAt`).
* **Documents:** Stores file ingestion metadata (`title`, `department`, `fileUrl`, `fileSize`, `totalChunks`, `status: pending | indexing | completed | failed`, `uploadedBy`).
* **DocumentChunks:** Stores extracted chunks for Mongo fallback search (`documentId`, `chunkIndex`, `text`, `pageNumber`, `vectorId`).
* **ChatThreads:** Stores user conversation sessions (`userId`, `title`, `department`, `createdAt`, `updatedAt`).
* **ChatMessages:** Stores individual conversation items (`threadId`, `sender: user | ai`, `text`, `confidenceScore`, `citations: [{ documentId, title, pageNumber, snippet }]`, `feedback: like | dislike | null`).
* **QueryAnalytics:** Aggregates telemetry for admins (`queryText`, `department`, `wasGrounded`, `confidenceScore`, `createdAt`).

---

### API Endpoints

#### Auth & User Management

* `GET /api/health` – System heartbeat and vector store connection check.
* `POST /api/auth/register` – Register a new student account.
* `POST /api/auth/login` – Authenticate user and issue JWT token.
* `GET /api/auth/me` – Fetch current session profile and role.

#### Chat & RAG Engine

* `GET /api/chat/threads` – List all chat conversations for the current user.
* `POST /api/chat/threads` – Create a new conversation thread.
* `GET /api/chat/threads/:threadId` – Get full message history for a thread.
* `POST /api/chat/threads/:threadId/message` – Send query, execute RAG pipeline, and stream AI response with citations.
* `POST /api/chat/messages/:messageId/feedback` – Submit student feedback (thumbs up/down).
* `DELETE /api/chat/threads/:threadId` – Delete conversation thread.

#### Admin Document & Ingestion Management

* `GET /api/admin/documents` – List all indexed campus documents and status.
* `POST /api/admin/documents/upload` – Multipart upload PDF, extract text, chunk, and index in Pinecone.
* `DELETE /api/admin/documents/:id` – Remove document vectors from Pinecone and metadata from MongoDB.
* `GET /api/admin/analytics` – Aggregated statistics on queries, accuracy, and department distributions.

---

### Folder Structure & Development Phases

#### Frontend Structure

```text
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── Chat/
    │   │   ├── ChatInput.jsx
    │   │   ├── ChatMessage.jsx
    │   │   ├── CitationBadge.jsx
    │   │   └── DepartmentSelector.jsx
    │   ├── DocumentManager/
    │   │   ├── DocumentUploadModal.jsx
    │   │   └── DocumentListTable.jsx
    │   ├── Analytics/
    │   │   └── StatCards.jsx
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── chat/
    │   │   ├── index.js
    │   │   └── [threadId].js
    │   ├── admin/
    │   │   ├── dashboard.js
    │   │   └── documents.js
    │   └── settings.js
    ├── store/
    │   ├── authStore.js
    │   └── chatStore.js
    └── services/
        ├── api.js
        └── sse.js

```

#### Backend Structure

```text
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── vectorDb.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   └── adminRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── chatController.js
    │   └── adminController.js
    ├── services/
    │   ├── authService.js
    │   ├── ragService.js
    │   ├── documentService.js
    │   ├── embeddingService.js
    │   └── vectorService.js
    ├── agents/
    │   ├── routerAgent.js
    │   ├── retrievalAgent.js
    │   ├── validationAgent.js
    │   └── citationAgent.js
    ├── models/
    │   ├── User.js
    │   ├── Document.js
    │   ├── DocumentChunk.js
    │   ├── ChatThread.js
    │   ├── ChatMessage.js
    │   └── QueryAnalytics.js
    └── middlewares/
        ├── authMiddleware.js
        ├── roleMiddleware.js
        ├── uploadMiddleware.js
        └── errorHandler.js

```

#### Development Phases

* **Phase 1 (Foundation):** Set up Next.js client, Express server, MongoDB Atlas connection, JWT authentication, and the responsive AppShell layout.
* **Phase 2 (Document Ingestion Engine):** Implement Multer PDF uploads, text parsing, semantic chunking with LangChain, embedding generation with Gemini, and Pinecone vector upserts.
* **Phase 3 (RAG Retrieval Pipeline):** Build the semantic retrieval engine, cosine threshold validation, context assembly, and grounded prompt synthesis with Google Gemini.
* **Phase 4 (Chat UI & Streaming):** Implement chat thread state management, real-time message streaming (SSE), Markdown/table rendering, and interactive citation popovers.
* **Phase 5 (Admin Portal & Telemetry):** Build administrative dashboard for document lifecycle management, indexing status indicators, and query analytics.
* **Phase 6 (Hardening & Deployment):** Add rate limiting, CORS configuration, input validation, error boundaries, and deploy frontend to Vercel and backend to Render.

---

### UI, Security, Outcome, and Codex Instructions

#### UI and UX Requirements

The interface must provide an intuitive academic portal experience built with Tailwind CSS. It must support fast department switching, smooth streaming token typography, inline source citation chips that open document context drawers, explicit visual tags for confidence ratings, responsive layout for mobile and desktop screens, and clean status indicators for document processing operations.

#### Security Requirements

* Passwords must be hashed using bcrypt at cost factor 12.
* Authentication tokens must use signed JWTs with expiration timestamps.
* Role-based endpoints (`/api/admin/*`) must enforce admin role verification middleware.
* PDF upload endpoints must validate MIME types and restrict file sizes to $\le 15\text{MB}$.
* CORS must be strictly bounded to the authorized `CLIENT_URL`.
* API keys (`GEMINI_API_KEY`, `PINECONE_API_KEY`, `JWT_SECRET`) must be loaded strictly from `process.env` and never leaked to the client or version control.
* RAG system prompts must include guardrails forbidding the model from answering out-of-context queries or assuming false policies.

#### Final Expected Outcome

A fully operational, deployed RAG-based Academic Assistant where students ask natural questions about college regulations, fees, or events and receive direct, accurate answers backed by clickable citations from official campus PDFs. Department admins can upload new notices, immediately index them into vector memory, and verify retrieval efficiency from an administrative analytics dashboard.

#### Codex & AI Agent Implementation Instructions

* Build the application systematically following the six development phases.
* Keep Express controllers thin by delegating business logic and database interactions to the `services/` layer.
* Keep agent modules pure and independent of HTTP transport logic.
* Ensure document chunking handles edge cases (e.g., empty pages, non-standard characters) without crashing the ingestion worker.
* Provide an in-memory vector similarity fallback for local development if Pinecone credentials are not configured.
* Validate all request payloads using `express-validator` middleware.
* Report all created or modified files at the conclusion of each development phase.