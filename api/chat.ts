type Message = { sender: 'user' | 'tutor'; text: string };

const systemPrompt = `You are Professor Kleene, a student-friendly Models of Computation tutor. Teach DFA, NFA, epsilon-NFA, epsilon closure, conversions, minimization, regex, regular languages, pumping lemma, lexical analysis, equivalence, and GATE TOC. Respect the requested mode and level. Answer direct conceptual questions directly; do not ask about alphabets/start states unless constructing a concrete automaton. Never invent official GATE PYQ metadata.`;

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const key = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';
  if (!key) return res.status(503).json({ error: 'Tutor is not configured. Set server-side LLM_API_KEY to enable chat.' });
  const { message, history = [], mode = 'TEACH_ME', level = 'Beginner' } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'A message is required.' });
  const response = await fetch(baseUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model, messages: [{ role: 'system', content: `${systemPrompt}\nMode: ${mode}. Level: ${level}.` }, ...history.slice(-12).map((item: Message) => ({ role: item.sender === 'user' ? 'user' : 'assistant', content: item.text })), { role: 'user', content: message }], temperature: 0.3 }) });
  if (!response.ok) return res.status(502).json({ error: 'Tutor provider request failed.' });
  const data = await response.json();
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || 'The tutor returned no response.' });
  } catch (error) {
    console.error('Unexpected /api/chat error', error);
    return res.status(500).json({ error: 'The tutor encountered an unexpected server error. Please retry.' });
  }
}
