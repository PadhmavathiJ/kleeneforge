import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/chat';

declare const process: { env: Record<string, string | undefined> };

function responseRecorder() {
  const record: { status?: number; body?: unknown; contentType?: string } = {};
  const res = {
    setHeader: (_name: string, value: string) => { record.contentType = value; },
    status: (status: number) => ({ json: (body: unknown) => { record.status = status; record.body = body; return body; } }),
  };
  return { res, record };
}

describe('Gemini Tutor API', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  it('maps mode, history, and a PNG image to Gemini while preserving { reply }', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'A DFA has one next state.' }] } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { res, record } = responseRecorder();
    await handler({ method: 'POST', body: { message: 'What is a DFA?', history: [{ sender: 'user', text: 'What is an NFA?' }, { sender: 'tutor', text: 'An NFA can branch.' }], mode: 'TEACH_ME', level: 'Beginner', image: 'data:image/png;base64,aGVsbG8=' } }, res);
    expect(record.status).toBe(200);
    expect(record.body).toEqual({ reply: 'A DFA has one next state.' });
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.contents).toHaveLength(3);
    expect(request.contents[1].role).toBe('model');
    expect(request.contents[2].parts[1].inlineData.mimeType).toBe('image/png');
  });

  it('returns a safe message when no Gemini key is configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const { res, record } = responseRecorder();
    await handler({ method: 'POST', body: { message: 'What is a DFA?' } }, res);
    expect(record.status).toBe(503);
    expect(record.body).toEqual({ error: 'AI Tutor is currently unavailable.' });
  });
});
