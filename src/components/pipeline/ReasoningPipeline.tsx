import React from 'react';
import { useAppStore, AppState } from '../../store/appStore';
import {
  HelpCircle,
  Brain,
  Wrench,
  Repeat,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

const PIPELINE_STEPS: {
  id: AppState['pipelineStep'];
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  { id: 'QUESTION', label: 'QUESTION', desc: 'Define Problem', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'UNDERSTAND', label: 'UNDERSTAND', desc: 'Formal Spec', icon: <Brain className="w-3.5 h-3.5" /> },
  { id: 'BUILD', label: 'BUILD', desc: 'Graph Model', icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: 'CONVERT', label: 'CONVERT', desc: 'Core Algorithm', icon: <Repeat className="w-3.5 h-3.5" /> },
  { id: 'VERIFY', label: 'VERIFY', desc: 'Emptiness / BFS', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: 'EXPLAIN', label: 'EXPLAIN', desc: 'Multi-Perspective', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'PRACTICE', label: 'PRACTICE', desc: 'GATE Drills', icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

export const ReasoningPipeline: React.FC = () => {
  const [store, actions] = useAppStore();

  const currentIdx = PIPELINE_STEPS.findIndex(s => s.id === store.pipelineStep);

  return (
    <div className="w-full glass-panel border border-cyan-950/60 p-3 rounded-2xl mb-4 overflow-x-auto no-scrollbar shadow-lg">
      <div className="flex items-center justify-between min-w-[700px] gap-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCurrent = step.id === store.pipelineStep;
          const isPassed = idx < currentIdx;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => actions.setPipelineStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-mono text-left cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]'
                    : isPassed
                    ? 'text-slate-300 hover:bg-slate-800/40 border border-transparent'
                    : 'text-slate-500 hover:text-slate-400 border border-transparent opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    isCurrent
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-wider">{step.label}</div>
                  <div className="text-[9px] text-slate-400 font-sans">{step.desc}</div>
                </div>
              </button>

              {idx < PIPELINE_STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
