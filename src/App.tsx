import React, { useEffect } from 'react';
import { useAppStore, AppView } from './store/appStore';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/common/HeroSection';
import { ModeSelector } from './components/common/ModeSelector';
import { ConversionLab } from './components/conversion/ConversionLab';
import { MinimizationLab } from './components/conversion/MinimizationLab';
import { BuilderStudio } from './components/canvas/BuilderStudio';
import { RegexLab } from './components/regexLab/RegexLab';
import { PumpingLemmaLab } from './components/pumpingLab/PumpingLemmaLab';
import { GateArena } from './components/gateArena/GateArena';
import { LexicalLab } from './components/lexicalLab/LexicalLab';
import { KleeneMentor } from './components/aiTutor/KleeneMentor';
import { LanguageLab } from './components/languageLab/LanguageLab';
import { CheckAnswerStudio } from './components/verification/CheckAnswerStudio';
import { EquivalenceChecker } from './components/verification/EquivalenceChecker';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { MistakeNotebook } from './components/analytics/MistakeNotebook';
import { FlashReview } from './components/analytics/FlashReview';
import {
  ShieldCheck,
  Zap,
  GraduationCap,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const pathToViewMap: Record<string, AppView> = {
  '': 'HERO',
  '/': 'HERO',
  '#': 'HERO',
  '#/': 'HERO',
  '#hero': 'HERO',
  'hub': 'MODE_SELECT',
  'lab': 'MODE_SELECT',
  '#hub': 'MODE_SELECT',
  '#lab': 'MODE_SELECT',
  'convert': 'CONVERT',
  '#convert': 'CONVERT',
  'minimize': 'MINIMIZE',
  '#minimize': 'MINIMIZE',
  'pumping': 'PUMPING',
  'pumping-lemma': 'PUMPING',
  '#pumping': 'PUMPING',
  '#pumping-lemma': 'PUMPING',
  'regex': 'REGEX_LAB',
  '#regex': 'REGEX_LAB',
  'builder': 'BUILDER',
  'playground': 'BUILDER',
  '#builder': 'BUILDER',
  '#playground': 'BUILDER',
  'gate': 'GATE_ARENA',
  '#gate': 'GATE_ARENA',
  'lexer': 'LEXICAL_LAB',
  '#lexer': 'LEXICAL_LAB',
  'tutor': 'AI_TUTOR',
  '#tutor': 'AI_TUTOR',
  'language': 'LANGUAGE_LAB',
  '#language': 'LANGUAGE_LAB',
  'check-answer': 'CHECK_ANSWER',
  '#check-answer': 'CHECK_ANSWER',
  'equivalence': 'EQUIVALENCE',
  '#equivalence': 'EQUIVALENCE',
  'analytics': 'ANALYTICS',
  '#analytics': 'ANALYTICS',
  'mistakes': 'MISTAKES',
  '#mistakes': 'MISTAKES',
  'flash-review': 'FLASH_REVIEW',
  '#flash-review': 'FLASH_REVIEW',
};

const viewToPathMap: Record<AppView, string> = {
  HERO: '#hero',
  MODE_SELECT: '#hub',
  CONVERT: '#convert',
  MINIMIZE: '#minimize',
  BUILDER: '#playground',
  REGEX_LAB: '#regex',
  PUMPING: '#pumping-lemma',
  GATE_ARENA: '#gate',
  LEXICAL_LAB: '#lexer',
  AI_TUTOR: '#tutor',
  LANGUAGE_LAB: '#language',
  CHECK_ANSWER: '#check-answer',
  EQUIVALENCE: '#equivalence',
  ANALYTICS: '#analytics',
  MISTAKES: '#mistakes',
  FLASH_REVIEW: '#flash-review',
};

export function App() {
  const [store, actions] = useAppStore();

  // Listen to browser URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.replace(/^\//, '').toLowerCase();
      const targetView = pathToViewMap[hash] || pathToViewMap[pathname];
      if (targetView && targetView !== store.currentView) {
        actions.setView(targetView);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [actions, store.currentView]);

  // Sync window hash when view changes
  useEffect(() => {
    const desiredHash = viewToPathMap[store.currentView];
    if (desiredHash && window.location.hash !== desiredHash) {
      window.location.hash = desiredHash;
    }
  }, [store.currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f1f5f9]">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {store.currentView === 'HERO' && <HeroSection />}
        {store.currentView === 'MODE_SELECT' && <ModeSelector />}
        {store.currentView === 'CONVERT' && <ConversionLab />}
        {store.currentView === 'MINIMIZE' && <MinimizationLab />}
        {store.currentView === 'BUILDER' && <BuilderStudio />}
        {store.currentView === 'REGEX_LAB' && <RegexLab />}
        {store.currentView === 'PUMPING' && <PumpingLemmaLab />}
        {store.currentView === 'GATE_ARENA' && <GateArena />}
        {store.currentView === 'LEXICAL_LAB' && <LexicalLab />}
        {store.currentView === 'AI_TUTOR' && <KleeneMentor />}
        {store.currentView === 'LANGUAGE_LAB' && <LanguageLab />}
        {store.currentView === 'CHECK_ANSWER' && <CheckAnswerStudio />}
        {store.currentView === 'EQUIVALENCE' && <EquivalenceChecker />}
        {store.currentView === 'ANALYTICS' && <AnalyticsDashboard />}
        {store.currentView === 'MISTAKES' && <MistakeNotebook />}
        {store.currentView === 'FLASH_REVIEW' && <FlashReview />}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900/80 px-4 py-8 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-300 flex items-center justify-center sm:justify-start gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>KLEENEFORGE � The Intelligent Automata Reasoning Lab</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic, mathematically verified core engine covering all 19 Formal Languages & Automata topics.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button onClick={() => actions.setView('MODE_SELECT')} className="hover:text-cyan-300">
              Lab Hub
            </button>
            <button onClick={() => actions.setView('GATE_ARENA')} className="hover:text-purple-300">
              GATE Arena
            </button>
            <button onClick={() => actions.setView('AI_TUTOR')} className="hover:text-orange-300">
              AI Mentor
            </button>
            <button onClick={() => actions.setView('FLASH_REVIEW')} className="hover:text-emerald-300">
              Flash Review
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
