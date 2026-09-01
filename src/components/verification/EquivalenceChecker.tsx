import React, { useState, useMemo } from 'react';
import { Automaton } from '../../core/types';
import { checkAutomataEquivalence } from '../../core/equivalence';
import { AUTOMATON_PRESETS } from '../../core/presets';
import { minimizeDFA } from '../../core/minimization';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { MathDisplay } from '../common/MathDisplay';
import {
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const EquivalenceChecker: React.FC = () => {
  const [autA, setAutA] = useState<Automaton>(
    JSON.parse(JSON.stringify(AUTOMATON_PRESETS[2].automaton)) // 6-state minimization textbook DFA
  );

  const [autB, setAutB] = useState<Automaton>(
    JSON.parse(JSON.stringify(minimizeDFA(AUTOMATON_PRESETS[2].automaton).minimalDfa)) // Minimal 4-state DFA
  );

  const eqResult = useMemo(() => {
    return checkAutomataEquivalence(autA, autB);
  }, [autA, autB]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-indigo-400" />
          <span>Automata Language Equivalence Checker</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Determine whether two arbitrary automata recognize the identical regular language using Product Automaton and Symmetric Difference BFS.
        </p>
      </div>

      {/* Pedagogy Note: Minimization vs Equivalence */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-950/60 flex items-start gap-3 text-xs font-mono shadow-md">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-indigo-300">
            DFA Minimization vs Automata Equivalence (Key Theoretical Distinction):
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            <strong>DFA Minimization</strong> eliminates redundant and equivalent states <em>inside a single automaton</em> using partition refinement.
            <br />
            <strong>Automata Equivalence</strong> decides whether <em>two distinct automata</em> <MathDisplay math="M_1" /> and <MathDisplay math="M_2" /> recognize the exact same formal language (<MathDisplay math="L(M_1) = L(M_2)" />) by verifying that the symmetric difference <MathDisplay math="L(M_1) \Delta L(M_2) = \emptyset" />.
          </p>
        </div>
      </div>

      {/* Result Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xl ${
          eqResult.areEquivalent
            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {eqResult.areEquivalent ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {eqResult.areEquivalent ? 'AUTOMATA ARE EQUIVALENT ?' : 'AUTOMATA ARE NOT EQUIVALENT ?'}
            </div>
            <div className="text-[11px] opacity-90">{eqResult.explanation}</div>
          </div>
        </div>

        {eqResult.shortestCounterexample !== undefined && (
          <div className="p-2.5 bg-slate-950 rounded-xl border border-rose-800 text-center">
            <span className="text-[10px] text-slate-400 block">Shortest Counterexample:</span>
            <span className="text-sm font-bold text-cyan-300">
              "{eqResult.shortestCounterexample}"
            </span>
          </div>
        )}
      </div>

      {/* Dual Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
              Automaton A ({autA.states.length} states)
            </span>
            <select
              onChange={e => {
                const p = AUTOMATON_PRESETS.find(pr => pr.id === e.target.value);
                if (p) setAutA(JSON.parse(JSON.stringify(p.automaton)));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-mono text-slate-300"
            >
              <option value="">Load Preset A...</option>
              {AUTOMATON_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <AutomataCanvas automaton={autA} onChange={setAutA} title="Automaton A" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase">
              Automaton B ({autB.states.length} states)
            </span>
            <select
              onChange={e => {
                const p = AUTOMATON_PRESETS.find(pr => pr.id === e.target.value);
                if (p) setAutB(JSON.parse(JSON.stringify(p.automaton)));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-mono text-slate-300"
            >
              <option value="">Load Preset B...</option>
              {AUTOMATON_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <AutomataCanvas automaton={autB} onChange={setAutB} title="Automaton B" />
        </div>
      </div>
    </div>
  );
};
