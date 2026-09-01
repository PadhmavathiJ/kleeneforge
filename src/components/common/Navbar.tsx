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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-300 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div
          onClick={() => actions.setView('HERO')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-700 via-indigo-600 to-violet-600 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-700 fill-cyan-700/20" />
            </div>
          </div>
          <div>
            <div className="font-mono font-bold text-sm tracking-wider text-slate-900">
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
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-600">Level:</span>
            <select
              value={store.userLevel}
              onChange={e => actions.setUserLevel(e.target.value as UserProficiency)}
              className="bg-transparent text-xs text-cyan-800 focus:outline-none cursor-pointer font-medium"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced / GATE</option>
            </select>
          </div>

          <button
            onClick={() => actions.setView('FLASH_REVIEW')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-mono font-medium transition-all"
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
