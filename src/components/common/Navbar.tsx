import React from 'react';
import { useAppStore, AppView, UserProficiency } from '../../store/appStore';
import {
  Compass,
  Repeat,
  Minimize2,
  BrainCircuit,
  Binary,
  GraduationCap,
  FileCode,
  Sparkles,
  CheckCircle2,
  Scale,
  BookOpenCheck,
  BarChart3,
  Flame,
  Zap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [store, actions] = useAppStore();

  const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
    { view: 'MODE_SELECT', label: 'Lab Hub', icon: <Compass className="w-4 h-4" /> },
    { view: 'CONVERT', label: 'Convert', icon: <Repeat className="w-4 h-4" /> },
    { view: 'MINIMIZE', label: 'Minimize DFA', icon: <Minimize2 className="w-4 h-4" /> },
    { view: 'BUILDER', label: 'Canvas', icon: <Binary className="w-4 h-4" /> },
    { view: 'REGEX_LAB', label: 'Regex Lab', icon: <FileCode className="w-4 h-4" /> },
    { view: 'PUMPING', label: 'Pumping Lemma', icon: <BrainCircuit className="w-4 h-4" /> },
    { view: 'CHECK_ANSWER', label: 'Check Answer', icon: <CheckCircle2 className="w-4 h-4" /> },
    { view: 'EQUIVALENCE', label: 'Equivalence', icon: <Scale className="w-4 h-4" /> },
    { view: 'GATE_ARENA', label: 'GATE Arena', icon: <GraduationCap className="w-4 h-4" /> },
    { view: 'LEXICAL_LAB', label: 'Lexer Studio', icon: <Sparkles className="w-4 h-4" /> },
    { view: 'AI_TUTOR', label: 'AI Mentor', icon: <Flame className="w-4 h-4 text-cyan-400" /> },
    { view: 'MISTAKES', label: 'Mistakes', icon: <BookOpenCheck className="w-4 h-4" /> },
    { view: 'ANALYTICS', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-950/40 px-4 py-2.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          onClick={() => actions.setView('HERO')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 glow-cyan flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#080a0f] rounded-[6px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-sm tracking-wider bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              KLEENEFORGE
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Automata Reasoning Lab
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 px-2 no-scrollbar">
          {navItems.map(item => {
            const isActive = store.currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => actions.setView(item.view)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side: Proficiency toggle & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-400">Level:</span>
            <select
              value={store.userLevel}
              onChange={e => actions.setUserLevel(e.target.value as UserProficiency)}
              className="bg-transparent text-xs text-cyan-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="Beginner" className="bg-slate-900 text-slate-200">Beginner</option>
              <option value="Intermediate" className="bg-slate-900 text-slate-200">Intermediate</option>
              <option value="Advanced" className="bg-slate-900 text-slate-200">Advanced / GATE</option>
            </select>
          </div>

          <button
            onClick={() => actions.setView('FLASH_REVIEW')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 hover:border-purple-400/50 text-purple-200 rounded-lg text-xs font-mono font-medium transition-all hover:scale-105"
            title="Rapid 5/15/30 Min Revision"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Flash Review</span>
          </button>
        </div>
      </div>
    </header>
  );
};
