import React from 'react';
import { useAppStore } from '../../store/appStore';
import { MathDisplay } from './MathDisplay';
import { ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [, actions] = useAppStore();

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-center items-center px-4 py-12 overflow-hidden bg-grid-pattern">
      {/* Dynamic Animated Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Mathematical Automata Badges */}
      <div className="absolute top-16 left-8 sm:left-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-cyan-300/80 font-mono text-xs animate-pulse">
        <MathDisplay math="\delta(q_0, 0) \to \{q_0, q_1\}" />
      </div>
      <div className="absolute bottom-20 left-12 sm:left-24 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-purple-300/80 font-mono text-xs animate-pulse">
        <MathDisplay math="w = xyz \implies xy^i z \in L" />
      </div>
      <div className="absolute top-24 right-12 sm:right-24 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-indigo-300/80 font-mono text-xs animate-pulse">
        <MathDisplay math="L(M) = \{ w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F \}" />
      </div>

      <div className="max-w-4xl mx-auto text-center z-10 space-y-6">
        {/* Top pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>100% Deterministic Mathematical Core � Zero Hallucinations</span>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm font-mono">
              KLEENEFORGE
            </span>
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-slate-300 font-mono">
            The Intelligent Automata Reasoning Lab
          </p>
          <p className="text-sm sm:text-base text-cyan-400/90 font-mono italic tracking-wider">
            �Build it. Convert it. Prove it. Master it.�
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => actions.setView('MODE_SELECT')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono"
          >
            <span>ENTER THE LAB</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => actions.setView('GATE_ARENA')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass-panel border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white font-mono font-medium text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>START EXAM MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
