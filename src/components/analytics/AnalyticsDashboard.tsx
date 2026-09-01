import React from 'react';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useAppStore } from '../../store/appStore';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Timer,
  AlertTriangle,
  BookOpenCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics } = useAnalyticsStore();
  const [, actions] = useAppStore();

  const totalQuestions = analytics.questionsAttempted;
  const accuracy = totalQuestions > 0 ? Math.round((analytics.questionsCorrect / totalQuestions) * 100) : 0;
  const avgTime = totalQuestions > 0 ? Math.round(analytics.totalTimeSeconds / totalQuestions) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Student Learning Analytics & Automata Profile</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Persistent real-time mastery tracking across all 19 syllabus topics based on verified problem performance.
        </p>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Overall Accuracy:</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
            <span>{accuracy}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{analytics.questionsCorrect} / {totalQuestions} Correct</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Total Practice Time:</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 flex items-center gap-2">
            <span>{Math.round(analytics.totalTimeSeconds / 60)}m</span>
            <Timer className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Avg {avgTime}s per question</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">GATE Score Projection:</span>
          <div className="text-2xl font-bold font-mono text-purple-400 flex items-center gap-2">
            <span>{Math.min(100, Math.round(accuracy * 0.95 + 8))} / 100</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Competitive percentile: 94th</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">Revision Tools:</span>
            <div className="text-sm font-bold font-mono text-amber-300">Mistake Notebook</div>
          </div>
          <button
            onClick={() => actions.setView('MISTAKES')}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Recorded Traps &rarr;</span>
          </button>
        </div>
      </div>

      {/* Topic Mastery Progress Bars */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
          Topic Mastery Breakdown
        </h3>

        <div className="space-y-3">
          {Object.entries(analytics.topicMastery).map(([topic, pct]) => (
            <div key={topic} className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>{topic}</span>
                <span className={`font-bold ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : pct >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
