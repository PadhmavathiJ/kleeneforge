import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { Automaton } from '../../core/types';
import { minimizeDFA } from '../../core/minimization';
import { checkAutomataEquivalence } from '../../core/equivalence';
import { simulateAutomaton, generateTestStrings } from '../../core/simulation';
import { AUTOMATON_PRESETS } from '../../core/presets';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { TransitionTableView } from '../pipeline/TransitionTableView';
import { ExplanationCard } from '../pipeline/ExplanationCard';
import { MathDisplay } from '../common/MathDisplay';
import confetti from 'canvas-confetti';
import {
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Columns,
  Table as TableIcon,
  Network,
} from 'lucide-react';

export const MinimizationLab: React.FC = () => {
  const [store, actions] = useAppStore();

  // Load a 6-state textbook DFA by default
  const defaultMinimizationDFA = useMemo(() => {
    return AUTOMATON_PRESETS.find(p => p.id === 'dfa_minimization_textbook')!.automaton;
  }, []);

  const [inputDfa, setInputDfa] = useState<Automaton>(
    JSON.parse(JSON.stringify(defaultMinimizationDFA))
  );

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'side_by_side' | 'graph_only' | 'table_only'>('side_by_side');
  const [testInput, setTestInput] = useState('01');

  // Compute deterministic minimization
  const minResult = useMemo(() => {
    return minimizeDFA(inputDfa);
  }, [inputDfa]);

  // Equivalence verification
  const eqResult = useMemo(() => {
    return checkAutomataEquivalence(inputDfa, minResult.minimalDfa);
  }, [inputDfa, minResult]);

  const totalSteps = minResult.steps.length;
  const currentStep = minResult.steps[currentStepIndex];
  const inputMembership = simulateAutomaton(inputDfa, testInput);
  const minimizedMembership = simulateAutomaton(minResult.minimalDfa, testInput);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  const handleLoadPreset = (presetId: string) => {
    const p = AUTOMATON_PRESETS.find(pr => pr.id === presetId);
    if (p) {
      setInputDfa(JSON.parse(JSON.stringify(p.automaton)));
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Minimize2 className="w-6 h-6 text-indigo-400" />
            <span>DFA Minimization Laboratory</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Hopcroft Partition Refinement: Eliminate unreachable states, build initial partition P₀ = &#123;F, Q\F&#125;, refine equivalence classes, and merge states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Load Preset:</span>
          <select
            onChange={e => handleLoadPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 cursor-pointer"
          >
            {AUTOMATON_PRESETS.filter(p => p.automaton.type === 'DFA').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* State Reduction Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-950/60 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono block">Original DFA</span>
            <span className="text-base font-bold font-mono text-cyan-300">
              {minResult.originalDfa.states.length} States
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-400" />

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/50 text-center glow-indigo">
            <span className="text-[10px] text-indigo-300 font-mono block">Minimal DFA</span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {minResult.minimalDfa.states.length} States
            </span>
          </div>

          <div className="hidden sm:block text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">
              {minResult.originalDfa.states.length - minResult.minimalDfa.states.length} redundant state(s)
            </span>{' '}
            merged via partition refinement.
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border ${eqResult.areEquivalent ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-300 bg-rose-500/10 border-rose-500/30'}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{eqResult.areEquivalent ? 'L(Original) = L(Minimal) Verified' : 'Equivalence verification failed'}</span>
        </div>
      </div>

      {/* Step Navigation Controls */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentStepIndex(Math.min(totalSteps - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === totalSteps - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentStepIndex(0)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Slider */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={e => setCurrentStepIndex(Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-indigo-300 whitespace-nowrap">
            Step {currentStepIndex + 1} / {totalSteps}: {currentStep?.title}
          </span>
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setViewMode('side_by_side')}
            className={`p-1.5 rounded text-xs font-mono ${
              viewMode === 'side_by_side' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('graph_only')}
            className={`p-1.5 rounded text-xs font-mono ${
              viewMode === 'graph_only' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table_only')}
            className={`p-1.5 rounded text-xs font-mono ${
              viewMode === 'table_only' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input DFA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Input DFA ({inputDfa.states.length} states)
            </span>
          </div>

          {viewMode !== 'table_only' && (
            <AutomataCanvas automaton={inputDfa} onChange={setInputDfa} title="Editable Input DFA" />
          )}
          {viewMode !== 'graph_only' && (
            <TransitionTableView automaton={inputDfa} />
          )}
        </div>

        {/* Right: Partition Stages & Minimal DFA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
              Minimized Canonical DFA ({minResult.minimalDfa.states.length} states)
            </span>
          </div>

          {viewMode !== 'table_only' && (
            <AutomataCanvas
              automaton={minResult.minimalDfa}
              readOnly
              title="Minimal Canonical DFA"
            />
          )}

          {viewMode !== 'graph_only' && (
            <TransitionTableView automaton={minResult.minimalDfa} />
          )}

          {/* Partition Refinement Step Card */}
          {currentStep && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {currentStep.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentStep.partitions.length} Partition Group(s)
                </span>
              </div>

              {/* Partition Snapshot */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {currentStep.partitions.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-bold"
                  >
                    Group {gIdx + 1}: &#123;{group.join(', ')}&#125;
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                {currentStep.explanation}
              </p>
              {currentStep.distinguishedReason && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] font-mono whitespace-pre-line text-amber-200">
                  <span className="font-bold text-amber-300">Distinguishable transitions</span>{'\n'}
                  {currentStep.distinguishedReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
          <div className="font-bold text-indigo-300">Reachability and final equivalence classes</div>
          <div className="text-slate-400">Removed unreachable states: <span className="text-slate-200">{minResult.unreachableRemoved.length ? `{${minResult.unreachableRemoved.join(', ')}}` : 'none'}</span></div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(minResult.equivalenceClasses).map(([name, states]) => (
              <span key={name} className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-indigo-200">{name} = &#123;{states.join(', ')}&#125;</span>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3 text-xs font-mono">
          <label className="text-slate-400">Test string</label>
          <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="empty string" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-200" />
          <span className={inputMembership.accepted ? 'text-emerald-300' : 'text-rose-300'}>Input: {inputMembership.accepted ? 'ACCEPT' : 'REJECT'}</span>
          <span className={minimizedMembership.accepted ? 'text-emerald-300' : 'text-rose-300'}>Minimized: {minimizedMembership.accepted ? 'ACCEPT' : 'REJECT'}</span>
          <span className={inputMembership.accepted === minimizedMembership.accepted ? 'text-emerald-400' : 'text-rose-400'}>{inputMembership.accepted === minimizedMembership.accepted ? 'Membership agrees' : 'Membership differs'}</span>
        </div>
      </div>
    </div>
  );
};
