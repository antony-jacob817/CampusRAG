import { API_BASE_URL } from './api';

/**
 * Stream query response via SSE Fetch
 */
export const streamChatMessage = async ({
  threadId,
  text,
  department = 'all',
  signal,
  onStart,
  onToken,
  onComplete,
  onError,
}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campusrag_token') : '';

  try {
    const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        text,
        department,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `Server responded with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser or empty response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete trailing chunk in buffer

      for (const block of lines) {
        const line = block.trim();
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.replace(/^data:\s*/, '');

        if (dataStr === '[DONE]') {
          continue;
        }

        try {
          const payload = JSON.parse(dataStr);
          if (payload.type === 'start' && onStart) {
            onStart(payload.userMessage);
          } else if (payload.type === 'token' && onToken) {
            onToken(payload.token);
          } else if (payload.type === 'complete' && onComplete) {
            onComplete(payload);
          } else if (payload.type === 'error' && onError) {
            onError(new Error(payload.error || 'Stream error'));
          }
        } catch (parseErr) {
          console.warn('[SSE] JSON parse error on chunk:', parseErr, dataStr);
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('[SSE] Stream aborted by user.');
      return;
    }
    if (onError) {
      onError(err);
    } else {
      console.error('[SSE Streaming Error]', err);
    }
  }
};
