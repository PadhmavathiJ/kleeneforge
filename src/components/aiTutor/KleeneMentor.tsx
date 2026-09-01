import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Automaton } from '../../core/types';
import { convertNfaToDfa } from '../../core/subsetConstruction';
import { minimizeDFA } from '../../core/minimization';
import { AUTOMATON_PRESETS } from '../../core/presets';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { MathDisplay } from '../common/MathDisplay';
import confetti from 'canvas-confetti';
import {
  Flame,
  Sparkles,
  Send,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Zap,
  BookOpen,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  latex?: string;
  hintLevel?: number;
  automatonData?: Automaton;
  needsConfirmation?: boolean;
}

export const KleeneMentor: React.FC = () => {
  const [store, actions] = useAppStore();

  const [tutorMode, setTutorMode] = useState<
    'TEACH_ME' | 'HINT' | 'CHECK_WORK' | 'SOLVE_FULLY' | 'CRASH_MODE'
  >('TEACH_ME');

  const [avatarMood, setAvatarMood] = useState<
    'idle' | 'thinking' | 'explaining' | 'celebrating' | 'questioning'
  >('idle');

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'tutor',
      text: 'Greetings, Formal Language Scholar! I am Kleene Mentor, your Automata Theory instructor. How can I guide your reasoning today?',
    },
  ]);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const newMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages(prev => [...prev, newMsg]);
    setAvatarMood('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: messages.map(({ sender, text }) => ({ sender, text })), mode: tutorMode, level: store.userLevel }),
      });
      const rawBody = await response.text();
      if (!rawBody.trim()) throw new Error('The tutor server returned an empty response. Please retry.');
      let data: { reply?: string; error?: string };
      try {
        data = JSON.parse(rawBody);
      } catch {
        throw new Error('The tutor server returned an invalid response. Please retry.');
      }
      if (!response.ok) throw new Error(data.error || 'Tutor request failed.');
      const reply = data.reply;
      if (!reply) throw new Error('The tutor returned no answer. Please retry.');
      setMessages(prev => [...prev, { id: `tutor_${Date.now()}`, sender: 'tutor', text: reply }]);
      setAvatarMood('explaining');
    } catch (error) {
      setMessages(prev => [...prev, { id: `tutor_error_${Date.now()}`, sender: 'tutor', text: error instanceof Error ? error.message : 'Unable to contact the tutor. Please retry.' }]);
      setAvatarMood('questioning');
    }
    return;

    // Simulate Socratic AI tutor responses deterministically based on topic
    setTimeout(() => {
      let replyText = '';
      let replyMood: any = 'explaining';

      const lower = userText.toLowerCase();

      if (tutorMode === 'TEACH_ME') {
        if (lower.includes('subset') || lower.includes('nfa')) {
          replyText = 'Let us analyze subset construction together. If you are at subset {q0, q1}, what states can the machine transition to on input symbol \'0\'? Look at transitions from q0 and q1 individually.';
          replyMood = 'questioning';
        } else if (lower.includes('pumping') || lower.includes('non-regular')) {
          replyText = 'Remember the quantifier rules in the Pumping Lemma: we do NOT choose the pumping length p. The adversary gives us p. Which string w in terms of p would you choose for your language?';
          replyMood = 'questioning';
        } else {
          replyText = `Under ${tutorMode} mode, let us break this down step-by-step: What is the initial state and formal alphabet for your problem?`;
          replyMood = 'questioning';
        }
      } else if (tutorMode === 'HINT') {
        replyText = '?? Hint: Apply e-closure immediately after reading each input symbol. In an e-NFA, any state reachable via spontaneous e-transitions must be included in the active subset.';
        replyMood = 'explaining';
      } else if (tutorMode === 'CRASH_MODE') {
        replyText = '? Exam Shortcut:\n� k-th symbol from right is 1 ? NFA = k+1 states, DFA = 2^k states.\n� DFA Complement ? Swap Final / Non-Final states (state count unchanged).\n� Modulo k in binary ? Exactly k states for odd k.';
        replyMood = 'explaining';
      } else {
        // SOLVE FULLY
        replyText = 'Here is the complete deterministic solution: We begin with initial subset S0 = e-closure({q0}). We compute move(S0, a) for every symbol, build the transition table, and mark any subset containing an original accept state as accepting.';
        replyMood = 'celebrating';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `tutor_${Date.now()}`,
          sender: 'tutor',
          text: replyText,
        },
      ]);
      setAvatarMood(replyMood);
    }, 900);
  };

  // Handle Photo / Image Upload & OCR
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages(prev => [...prev, { id: `image_notice_${Date.now()}`, sender: 'tutor', text: 'Image analysis is not enabled yet. Please describe the diagram or paste its transitions; text chat is available now.' }]);
    return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setUploadedImage(b64);
      setIsAnalyzingImage(true);
      setAvatarMood('thinking');

      setTimeout(() => {
        setIsAnalyzingImage(false);
        setAvatarMood('explaining');

        const detectedAut: Automaton = {
          type: 'NFA',
          states: ['q0', 'q1', 'q2'],
          alphabet: ['0', '1'],
          startState: 'q0',
          acceptStates: ['q2'],
          transitions: [
            { from: 'q0', to: 'q0', symbol: '0' },
            { from: 'q0', to: 'q1', symbol: '1' },
            { from: 'q1', to: 'q2', symbol: '0' },
          ],
        };

        setMessages(prev => [
          ...prev,
          {
            id: `ocr_${Date.now()}`,
            sender: 'tutor',
            text: 'I parsed the uploaded diagram. I detected an NFA with states {q0, q1, q2}, start state q0, and accept state q2.\n\n?? Verification note: Transition q0 --1--> q1 was slightly ambiguous. Please confirm if this matches your diagram.',
            automatonData: detectedAut,
            needsConfirmation: true,
          },
        ]);
      }, 1500);
    };
    const fileToRead = e.currentTarget.files?.item(0);
    if (!fileToRead) return;
    reader.readAsDataURL(fileToRead as File);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <span>KLEENE MENTOR — AI Socratic Instructor</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Multimodal tutoring engine: Upload textbook questions, handwritten automata photos, and practice with Socratic dialogue.
        </p>
      </div>

      {/* Teaching Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'TEACH_ME', label: '1. Teach Me (Socratic)', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'HINT', label: '2. Give Me a Hint', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          { id: 'CHECK_WORK', label: '3. Check My Work', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          { id: 'SOLVE_FULLY', label: '4. Solve It Fully', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'CRASH_MODE', label: '5. Exam Crash Mode', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setTutorMode(m.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              tutorMode === m.id
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tutor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Animated Professor Avatar & Status */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-4 shadow-xl">
            {/* Animated SVG Professor Avatar */}
            <div className="relative w-28 h-28 mx-auto">
              <div
                className={`w-full h-full rounded-full border-2 p-1 flex items-center justify-center transition-all duration-500 ${
                  avatarMood === 'thinking'
                    ? 'border-purple-400 glow-purple animate-pulse'
                    : avatarMood === 'celebrating'
                    ? 'border-emerald-400 glow-emerald scale-105'
                    : avatarMood === 'questioning'
                    ? 'border-amber-400 glow-amber'
                    : 'border-cyan-400 glow-cyan'
                }`}
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-cyan-300 font-mono text-2xl font-bold shadow-inner">
                  {avatarMood === 'thinking' ? '??' : avatarMood === 'celebrating' ? '??' : avatarMood === 'questioning' ? '??' : '?????'}
                </div>
              </div>

              <span
                className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                  avatarMood === 'thinking'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : avatarMood === 'celebrating'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-slate-900 text-cyan-300 border-cyan-500'
                }`}
              >
                {avatarMood.toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold text-slate-100">
                Professor Kleene
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Automata & Formal Languages AI Mentor
              </p>
            </div>

            {/* Quick Socratic Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <button
                onClick={() => {
                  setInputQuery('Explain why we use epsilon closure in NFA to DFA conversion.');
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                &rarr; Why is e-closure needed?
              </button>
              <button
                onClick={() => {
                  setInputQuery('Give me a similar practice problem for DFA minimization.');
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                &rarr; Give me a similar question
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Interactive Chat & Image OCR Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 min-h-[480px] flex flex-col justify-between space-y-4 shadow-2xl">
            {/* Message Thread */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-2 no-scrollbar">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 text-xs font-mono leading-relaxed ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'tutor' && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold shrink-0 mt-0.5">
                      K
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-lg whitespace-pre-line shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-slate-950 font-bold rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* If message returned an imported automaton from OCR */}
                    {msg.automatonData && (
                      <div className="mt-3 space-y-2">
                        <AutomataCanvas automaton={msg.automatonData} readOnly title="OCR Reconstructed Automaton" />
                        {msg.needsConfirmation && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                actions.setAutomaton(msg.automatonData!);
                                actions.setView('CONVERT');
                              }}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-lg shadow"
                            >
                              ? Confirm & Solve in Lab
                            </button>
                            <button
                              onClick={() => {
                                actions.setAutomaton(msg.automatonData!);
                                actions.setView('BUILDER');
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg"
                            >
                              Edit on Canvas
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar with Image Upload */}
            <form onSubmit={handleSendMessage} className="space-y-2 border-t border-slate-800 pt-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                  title="Upload Automaton Image / Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Ask Kleene Mentor or discuss a formal problem..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                />

                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all shadow cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {isAnalyzingImage && (
                <div className="text-[11px] font-mono text-cyan-400 animate-pulse">
                  Analyzing uploaded automaton diagram with vision OCR...
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
