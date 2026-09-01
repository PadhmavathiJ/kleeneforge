type Message = { sender: 'user' | 'tutor'; text: string };
type TutorMode = 'TEACH_ME' | 'HINT' | 'CHECK_WORK' | 'SOLVE_FULLY' | 'CRASH_MODE';

const modeInstructions: Record<TutorMode, string> = {
  TEACH_ME: 'Explain from basics in short, friendly steps. Define unfamiliar terms and give a small example.',
  HINT: 'Give exactly one useful next step or observation. Do not reveal the full solution or final answer.',
  CHECK_WORK: 'State what is correct first, identify the first mistake or missing justification, and explain how to repair it. Ask for the attempt if none was supplied.',
  SOLVE_FULLY: 'Give a complete, verified solution. Use Given, numbered Steps, Result, and Why when useful.',
  CRASH_MODE: 'Be concise and exam-focused: rule or formula, shortcut, common mistake, then final answer. Do not invent official GATE PYQ details.',
};

const systemPrompt = `You are Professor Kleene, a student-friendly university tutor for Models of Computation. You specialize in DFA, NFA, epsilon-NFA, epsilon-closure, subset construction, DFA minimization, regular expressions, Thompson construction, regular languages, closure properties, pumping lemma, lexical analysis, automata equivalence, and GATE-style Theory of Computation questions.

Answer direct conceptual questions directly. If asked “What is automata?”, explain that automata are mathematical models of machines that read symbols and move between states, then give a small example. Do not ask about an alphabet or start state unless the student is building a concrete machine. Keep responses readable with short paragraphs, bullets or numbered steps, and compact notation when helpful. Never invent official GATE PYQ provenance or facts.`;

function endpointFrom(baseUrl: string): string {
  const clean = baseUrl.replace(/\/+$/, '');
  return clean.endsWith('/chat/completions') ? clean : `${clean}/chat/completions`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const key = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';
  if (!key) return res.status(503).json({ error: 'AI Tutor is currently unavailable.' });
  const { message, history = [], mode = 'TEACH_ME', level = 'Beginner', image } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'A message is required.' });
  if (!Object.hasOwn(modeInstructions, mode) || !Array.isArray(history)) return res.status(400).json({ error: 'Invalid tutor request.' });
  if (image !== undefined && (typeof image !== 'string' || !image.startsWith('data:image/'))) return res.status(400).json({ error: 'Invalid image attachment.' });
  const content = image ? [{ type: 'text', text: message }, { type: 'image_url', image_url: { url: image } }] : message;
  const response = await fetch(endpointFrom(baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [
      { role: 'system', content: `${systemPrompt}\n\nStudent level: ${level}.\nMode: ${modeInstructions[mode as TutorMode]}` },
      ...history.slice(-12).filter((item: Message) => item && typeof item.text === 'string').map((item: Message) => ({ role: item.sender === 'user' ? 'user' : 'assistant', content: item.text })),
      { role: 'user', content },
    ], temperature: 0.3 }),
  });
  const raw = await response.text();
  if (!response.ok) {
    console.error('LLM provider error', { status: response.status, body: raw.slice(0, 500) });
    return res.status(502).json({ error: image ? 'Professor Kleene could not analyze that image right now. Please try a text description.' : "Professor Kleene couldn't respond right now. Please try again." });
  }
  let data: any;
  try { data = JSON.parse(raw); } catch {
    console.error('LLM provider returned non-JSON content');
    return res.status(502).json({ error: "Professor Kleene couldn't respond right now. Please try again." });
  }
  const reply = data.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) return res.status(502).json({ error: "Professor Kleene couldn't respond right now. Please try again." });
    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error('Unexpected /api/chat error', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Professor Kleene couldn't respond right now. Please try again." });
  }
}
