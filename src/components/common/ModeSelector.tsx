import React from 'react';
import { useAppStore, AppView } from '../../store/appStore';
import {
  Repeat,
  Minimize2,
  BrainCircuit,
  FileCode,
  Binary,
  GraduationCap,
  Sparkles,
  Flame,
  Globe2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface LabCard {
  id: AppView;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  tag: string;
}

export const ModeSelector: React.FC = () => {
  const [, actions] = useAppStore();

  const cards: LabCard[] = [
    {
      id: 'CONVERT',
      num: '01',
      title: 'CONVERT AN AUTOMATON',
      subtitle: 'NFA / e-NFA ? DFA, GNFA ? Regex, RE ? NFA',
      description: 'Step-by-step subset construction and state elimination with full reasoning logs and synchronized graphs.',
      icon: <Repeat className="w-6 h-6 text-cyan-400" />,
      accent: 'border-cyan-500/40 hover:border-cyan-400 group-hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)]',
      tag: 'Core Pipeline',
    },
    {
      id: 'MINIMIZE',
      num: '02',
      title: 'MINIMIZE A DFA',
      subtitle: 'Partition Refinement & Hopcroft Algorithm',
      description: 'Remove unreachable states, build initial partition P0 = {F, Q\\F}, and refine distinguishable equivalence classes.',
      icon: <Minimize2 className="w-6 h-6 text-indigo-400" />,
      accent: 'border-indigo-500/40 hover:border-indigo-400 group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]',
      tag: 'Equivalence',
    },
    {
      id: 'PUMPING',
      num: '03',
      title: 'SOLVE PUMPING LEMMA',
      subtitle: '5-Stage Interactive Proof Laboratory',
      description: 'Prove languages non-regular respecting adversarial quantifiers, decomposition constraints, and contradiction checks.',
      icon: <BrainCircuit className="w-6 h-6 text-amber-400" />,
      accent: 'border-amber-500/40 hover:border-amber-400 group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]',
      tag: 'Proof Engine',
    },
    {
      id: 'REGEX_LAB',
      num: '04',
      title: 'REGULAR EXPRESSION LAB',
      subtitle: 'AST Syntax Tree & Thompson Construction',
      description: 'Parse expressions with precedence rules, visualize ASTs, generate recursive e-NFA fragments and minimal DFAs.',
      icon: <FileCode className="w-6 h-6 text-emerald-400" />,
      accent: 'border-emerald-500/40 hover:border-emerald-400 group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]',
      tag: 'Parser & AST',
    },
    {
      id: 'BUILDER',
      num: '05',
      title: 'BUILD AN AUTOMATON',
      subtitle: 'Interactive Visual State Diagram Editor',
      description: 'Design custom DFAs, NFAs, and e-NFAs with drag-and-drop states, custom transitions, live string simulation, and export.',
      icon: <Binary className="w-6 h-6 text-sky-400" />,
      accent: 'border-sky-500/40 hover:border-sky-400 group-hover:shadow-[0_0_25px_-5px_rgba(56,189,248,0.3)]',
      tag: 'Canvas Editor',
    },
    {
      id: 'GATE_ARENA',
      num: '06',
      title: 'GATE PRACTICE',
      subtitle: 'MCQ, MSQ, NAT & Trap Detector',
      description: 'Curated university & GATE exam arena with timed 30-min mock test mode, trick alerts, and multi-tier solutions.',
      icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
      accent: 'border-purple-500/40 hover:border-purple-400 group-hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)]',
      tag: 'Exam Prep',
    },
    {
      id: 'LEXICAL_LAB',
      num: '07',
      title: 'LEXICAL ANALYSIS LAB',
      subtitle: 'Compiler Tokenizer & DFA Path Scanner',
      description: 'See how regular expressions power real compiler lexers. Type live source code and trace DFA tokenization paths.',
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      accent: 'border-pink-500/40 hover:border-pink-400 group-hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]',
      tag: 'Compilers',
    },
    {
      id: 'AI_TUTOR',
      num: '08',
      title: 'AI TUTOR (KLEENE MENTOR)',
      subtitle: 'Socratic Tutor & Image/Photo OCR',
      description: 'Upload handwritten or textbook automata photos, get Socratic guidance, step hints, and adaptive explanations.',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      accent: 'border-orange-500/40 hover:border-orange-400 group-hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.3)]',
      tag: 'Multimodal AI',
    },
    {
      id: 'LANGUAGE_LAB',
      num: '09',
      title: 'REGULAR LANGUAGE LAB',
      subtitle: 'Decider, Closure Properties & Catalog',
      description: 'Explore formal language families, test membership, evaluate regularity properties, and construct reference DFAs.',
      icon: <Globe2 className="w-6 h-6 text-blue-400" />,
      accent: 'border-blue-500/40 hover:border-blue-400 group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]',
      tag: 'Theory',
    },
    {
      id: 'CHECK_ANSWER',
      num: '10',
      title: 'CHECK MY ANSWER',
      subtitle: 'Automated Professor & Counterexample Finder',
      description: 'Build your solution to a specification problem. The engine tests thousands of strings and finds exact divergence states.',
      icon: <CheckCircle2 className="w-6 h-6 text-teal-400" />,
      accent: 'border-teal-500/40 hover:border-teal-400 group-hover:shadow-[0_0_25px_-5px_rgba(20,184,166,0.3)]',
      tag: 'Professor Mode',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
          What do you want to do?
        </h2>
        <p className="text-sm text-slate-400 font-mono">
          Select an interactive laboratory module to begin your reasoning workflow.
        </p>
      </div>

      {/* 10-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => actions.setView(card.id)}
            className={`group relative p-5 rounded-2xl glass-panel border ${card.accent} cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-4`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  {card.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
                    {card.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {card.num}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-sm font-bold font-mono text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>{card.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {card.subtitle}
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-400/90 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-300">
              <span>Launch Lab &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
