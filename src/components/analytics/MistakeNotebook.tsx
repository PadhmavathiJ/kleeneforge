import React from 'react';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useAppStore } from '../../store/appStore';
import {
  BookOpenCheck,
  AlertTriangle,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const MistakeNotebook: React.FC = () => {
  const { mistakes, removeMistake } = useAnalyticsStore();
  const [, actions] = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-amber-400" />
            <span>My Mistake Notebook & Trap Journal</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Personalized record of conceptual traps, counterexample strings, and corrected reasoning.
          </p>
        </div>

        <button
          onClick={() => actions.setView('FLASH_REVIEW')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Flash Revision</span>
        </button>
      </div>

      {/* Mistake Entries List */}
      {mistakes.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
          <h3 className="text-sm font-mono font-bold text-slate-200">
            No Active Mistakes Recorded!
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Whenever you make an error in the GATE Arena or Check My Answer studio, KleeneForge records the trap and counterexample here for spaced revision.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((m, idx) => (
            <div
              key={m.id}
              className="glass-panel p-5 rounded-2xl border border-amber-950/60 space-y-3 shadow-xl relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    MISTAKE #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {m.topic}
                  </span>
                </div>

                <button
                  onClick={() => removeMistake(m.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove from notebook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                {/* User Mistake */}
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Your Misconception / Trap:</span>
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">{m.userMistake}</p>
                </div>

                {/* Correct Reasoning */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Correct Reasoning:</span>
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">{m.correctReasoning}</p>
                </div>
              </div>

              {m.counterexample && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2">
                  <span className="text-slate-400">Distinguishing Counterexample:</span>
                  <span className="text-cyan-300 font-bold">{m.counterexample}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
