import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { MathDisplay } from '../common/MathDisplay';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

interface FlashCard {
  id: string;
  topic: string;
  duration: '5_MIN' | '15_MIN' | '30_MIN';
  title: string;
  latex?: string;
  bulletPoints: string[];
  trapAlert?: string;
}

const FLASH_CARDS: FlashCard[] = [
  {
    id: 'fc_1',
    topic: 'Deterministic Finite Automata (DFA)',
    duration: '5_MIN',
    title: 'DFA State Counting & Modulo Rules',
    latex: '\\delta: Q \\times \\Sigma \\to Q',
    bulletPoints: [
      'Every state has exactly ONE outgoing transition per alphabet symbol.',
      'Binary numbers divisible by odd k -> Minimal DFA has exactly k states.',
      'Binary numbers divisible by 2^k -> Minimal DFA has k + 1 states.',
      'Strings ending in a specific string of length k over binary -> k + 1 states.',
    ],
    trapAlert: 'Trap: Forgetting to add explicit dead/trap states in DFAs for unaccepted prefixes.',
  },
  {
    id: 'fc_2',
    topic: 'NFA vs DFA Conversion',
    duration: '5_MIN',
    title: 'Subset Construction & Exponential Gap',
    latex: 'Q_{DFA} \\subseteq \\mathcal{P}(Q_{NFA})',
    bulletPoints: [
      'Worst-case state blowup: n-state NFA -> up to 2^n DFA states.',
      'k-th symbol from right is 1 -> NFA = k + 1 states, DFA = 2^k states.',
      'Always apply e-closure immediately after move(S, a).',
      'A DFA subset is accepting if it contains at least ONE NFA accept state.',
    ],
    trapAlert: 'Trap: Constructing all 2^n subsets rather than only reachable subsets from the start state.',
  },
  {
    id: 'fc_3',
    topic: 'DFA Minimization',
    duration: '15_MIN',
    title: 'Partition Refinement & Myhill-Nerode',
    latex: 'P_0 = \\{ F, Q \\setminus F \\}',
    bulletPoints: [
      'Step 1: Always eliminate unreachable states first via BFS from start state.',
      'Step 2: Initial partition P0 = {F, Q \\ F}.',
      'Step 3: Split groups when transitions on the same symbol land in different blocks.',
      'Equivalence classes of the minimal DFA correspond 1-to-1 with Myhill-Nerode equivalence classes.',
    ],
    trapAlert: 'Trap: Confusing DFA minimization (within one machine) with language equivalence (between two machines).',
  },
  {
    id: 'fc_4',
    topic: 'Pumping Lemma',
    duration: '15_MIN',
    title: 'Adversarial Quantifiers & Proof Rules',
    latex: 'w = xyz, \\quad |xy| \\le p, \\quad |y| \\ge 1, \\quad xy^i z \\in L',
    bulletPoints: [
      'Pumping Lemma is a NEGATIVE test only (proves non-regularity, never proves regularity).',
      'Adversary chooses p (you must prove for arbitrary p >= 1).',
      'You choose string w in terms of p with |w| >= p.',
      'Adversary chooses decomposition w = xyz (|xy| <= p, |y| >= 1).',
      'You choose i to pump and force a contradiction.',
    ],
    trapAlert: 'Trap: Assuming one convenient decomposition. You must analyze ALL possible valid decompositions of where y can lie.',
  },
  {
    id: 'fc_5',
    topic: 'Lexical Analysis',
    duration: '30_MIN',
    title: 'Compiler Scanning & Maximal Munch',
    bulletPoints: [
      'Maximal Munch (Longest Match) always takes precedence over keyword priority.',
      'Rule order / priority is used strictly to break ties between equal length matches.',
      'Lexer uses a single consolidated DFA combining all token regexes with lookahead.',
    ],
    trapAlert: 'Trap: Believing keyword priority will cause "ifx" to be split into "if" and "x". (Maximal munch matches "ifx" as one identifier).',
  },
];

export const FlashReview: React.FC = () => {
  const [, actions] = useAppStore();
  const [selectedDuration, setSelectedDuration] = useState<'ALL' | '5_MIN' | '15_MIN' | '30_MIN'>('ALL');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  const filteredCards = FLASH_CARDS.filter(c => selectedDuration === 'ALL' || c.duration === selectedDuration);
  const card = filteredCards[currentCardIdx] || FLASH_CARDS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <span>High-Yield Flash Review Cards</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Rapid revision cards for formulas, algorithms, GATE shortcuts, and traps.
          </p>
        </div>

        {/* Duration Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['ALL', '5_MIN', '15_MIN', '30_MIN'] as const).map(d => (
            <button
              key={d}
              onClick={() => {
                setSelectedDuration(d);
                setCurrentCardIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDuration === d
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 'ALL' ? 'All Cards' : d.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard */}
      {card && (
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/40 space-y-6 shadow-2xl min-h-[400px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-purple-300">
                {card.topic}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Card {currentCardIdx + 1} of {filteredCards.length}
              </span>
            </div>

            <h3 className="text-xl font-bold font-mono text-white">
              {card.title}
            </h3>

            {card.latex && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 text-center font-mono text-sm">
                <MathDisplay math={card.latex} block />
              </div>
            )}

            <div className="space-y-2 text-xs font-mono text-slate-200 pt-2">
              {card.bulletPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">�</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {card.trapAlert && (
              <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl text-xs font-mono text-rose-300">
                {card.trapAlert}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentCardIdx(Math.max(0, currentCardIdx - 1))}
              disabled={currentCardIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-mono text-xs rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentCardIdx((currentCardIdx + 1) % filteredCards.length)}
              className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
