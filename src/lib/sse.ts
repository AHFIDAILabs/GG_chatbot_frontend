import { SSETokenEvent, SSEDoneEvent, SSEErrorEvent, SSEHandlers } from '../types';

// ─────────────────────────────────────────────
// SSE client
//
// The backend streams chat responses as:
//   event: token  data: { token }
//   event: done   data: { conversationId, latencyMs, tokensUsed, pillarSource, intent }
//   event: error  data: { message }
//
// We use fetch() instead of EventSource because
// EventSource does not support POST requests or
// custom headers. fetch() gives us full control.
// ─────────────────────────────────────────────

export async function streamMessage(
  conversationId: string,
  question:       string,
  handlers:       SSEHandlers
): Promise<void> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const url     = `${baseURL}/chat/conversations/${conversationId}/messages`;

  let response: Response;

  try {
    response = await fetch(url, {
      method:      'POST',
      credentials: 'include',   // send httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'text/event-stream',
      },
      body: JSON.stringify({ question }),
    });
  } catch {
    handlers.onError('Could not connect to Amara. Please check your connection.');
    return;
  }

  if (!response.ok || !response.body) {
    handlers.onError('Amara is having trouble responding. Please try again.');
    return;
  }

  // ── Parse SSE stream ─────────────────────────
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by double newlines
    const parts = buffer.split('\n\n');
    buffer      = parts.pop() ?? '';   // keep incomplete last chunk

    for (const part of parts) {
      if (!part.trim()) continue;

      let eventName = 'message';
      let dataLine  = '';

      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLine  = line.slice(5).trim();
        }
      }

      if (!dataLine) continue;

      try {
        const parsed = JSON.parse(dataLine);

        switch (eventName) {
          case 'token':
            handlers.onToken((parsed as SSETokenEvent).token);
            break;
          case 'done':
            handlers.onDone(parsed as SSEDoneEvent);
            break;
          case 'error':
            handlers.onError((parsed as SSEErrorEvent).message);
            break;
        }
      } catch {
        // Malformed JSON in stream — skip silently
      }
    }
  }
}