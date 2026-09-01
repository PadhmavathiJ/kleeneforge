import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { MathDisplay } from '../common/MathDisplay';
import {
  Sparkles,
  BookOpen,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface ExplanationCardProps {
  title?: string;
  beginnerText?: string;
  mathText?: string;
  examShortcutText?: string;
  trapAlert?: string;
  customLatex?: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  title = 'Reasoning & Mathematical Verification',
  beginnerText,
  mathText,
  examShortcutText,
  trapAlert,
  customLatex,
}) => {
  const [store, actions] = useAppStore();
  const [copied, setCopied] = useState(false);

  const activeMode = store.explanationMode;

  const currentContent =
    activeMode === 'beginner'
      ? beginnerText || 'Step-by-step intuitive breakdown of the algorithm and transitions.'
      : activeMode === 'mathematical'
      ? mathText || 'Formal proof under the Myhill-Nerode theorem and transition function homomorphisms.'
      : examShortcutText || 'GATE exam elimination techniques and rapid verification shortcuts.';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
      {/* Top Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-slate-200">{title}</span>
        </div>

        {/* Perspective Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => actions.setExplanationMode('beginner')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              activeMode === 'beginner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Beginner</span>
          </button>

          <button
            onClick={() => actions.setExplanationMode('mathematical')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              activeMode === 'mathematical'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>Math Proof</span>
          </button>

          <button
            onClick={() => actions.setExplanationMode('exam_shortcut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              activeMode === 'exam_shortcut'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Exam Shortcut</span>
          </button>
        </div>
      </div>

      {/* Main Explanation Body */}
      <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line space-y-2">
        <p>{currentContent}</p>

        {customLatex && (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-300 font-mono my-2 overflow-x-auto text-center">
            <MathDisplay math={customLatex} block />
          </div>
        )}
      </div>

      {/* Trap Alert Section */}
      {trapAlert && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold text-rose-300">GATE Trap Warning: </span>
            <span>{trapAlert}</span>
          </div>
        </div>
      )}

      {/* Footer Copy Action */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied explanation' : 'Copy explanation'}</span>
        </button>
      </div>
    </div>
  );
};
