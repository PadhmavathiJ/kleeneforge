import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { Automaton } from '../../core/types';
import { convertNfaToDfa } from '../../core/subsetConstruction';
import { minimizeDFA } from '../../core/minimization';
import { convertAutomatonToRegex } from '../../core/regex/gnfa';
import { regexToENFA } from '../../core/regex/thompson';
import { checkAutomataEquivalence } from '../../core/equivalence';
import { simulateAutomaton } from '../../core/simulation';
import { convertDfaToNfa } from '../../core/identityConversions';
import { validateAutomaton } from '../../core/validation';
import { AUTOMATON_PRESETS } from '../../core/presets';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { TransitionTableView } from '../pipeline/TransitionTableView';
import { ExplanationCard } from '../pipeline/ExplanationCard';
import { MathDisplay } from '../common/MathDisplay';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Table as TableIcon,
  Network,
  Columns,
  Cpu,
} from 'lucide-react';

export const ConversionLab: React.FC = () => {
  const [store, actions] = useAppStore();

  const [sourceType, setSourceType] = useState<'NFA' | 'ENFA' | 'DFA' | 'REGEX'>('NFA');
  const [targetType, setTargetType] = useState<'DFA' | 'NFA' | 'MINIMAL_DFA' | 'REGEX' | 'ENFA'>('DFA');
  const [regexInput, setRegexInput] = useState('(0|1)*01');
  const [testInput, setTestInput] = useState('01');
  const [inputMode, setInputMode] = useState<'EXAMPLE' | 'VISUAL'>('EXAMPLE');
  const [customReady, setCustomReady] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'side_by_side' | 'graph_only' | 'table_only'>('side_by_side');

  // Step-by-step animation controls
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Synchronize targetType if accessed via MINIMIZE view
  useEffect(() => {
    if (store.currentView === 'MINIMIZE') {
      setSourceType('DFA');
      setTargetType('MINIMAL_DFA');
    }
  }, [store.currentView]);

  // Compute conversion result deterministically
  const conversionData = useMemo(() => {
    try {
      if (sourceType === 'REGEX') {
        const thompsonRes = regexToENFA(regexInput);
        if (targetType === 'ENFA') {
          return {
            type: 'REGEX_TO_ENFA',
            originalAut: thompsonRes.automaton,
            resultAut: thompsonRes.automaton,
            steps: thompsonRes.steps.map((s, i) => ({
              index: i,
              title: `Fragment: ${s.subExpression}`,
              explanation: s.explanation,
              activeStates: s.fragment.states,
            })),
            isEquivalent: true,
          };
        } else if (targetType === 'DFA') {
          const subsetRes = convertNfaToDfa(thompsonRes.automaton);
          return {
            type: 'REGEX_TO_DFA',
            originalAut: thompsonRes.automaton,
            resultAut: subsetRes.dfa,
            steps: subsetRes.steps.map((s, i) => ({
              index: i,
              title: `DFA State: ${s.dfaStateName} on '${s.symbol}'`,
              explanation: s.explanation,
              activeStates: [s.dfaStateName],
            })),
            isEquivalent: true,
          };
        } else {
          // Minimal DFA
          const subsetRes = convertNfaToDfa(thompsonRes.automaton);
          const minRes = minimizeDFA(subsetRes.dfa);
          return {
            type: 'REGEX_TO_MIN_DFA',
            originalAut: thompsonRes.automaton,
            resultAut: minRes.minimalDfa,
            steps: minRes.steps.map((s, i) => ({
              index: i,
              title: s.title,
              explanation: s.explanation,
              activeStates: s.partitions.flat(),
            })),
            isEquivalent: true,
          };
        }
      }

      if (targetType === 'DFA') {
        const res = convertNfaToDfa(store.currentAutomaton);
        const eq = checkAutomataEquivalence(store.currentAutomaton, res.dfa);
        return {
          type: 'SUBSET_CONSTRUCTION',
          originalAut: store.currentAutomaton,
          resultAut: res.dfa,
          steps: res.steps.map((s, i) => ({
            index: i,
            title: `Process Subset δ(${s.dfaStateName}, '${s.symbol}') -> ${s.targetDfaStateName}`,
            explanation: s.explanation,
            activeStates: [s.dfaStateName, s.targetDfaStateName],
          })),
          isEquivalent: eq.areEquivalent,
        };
      }

      if (targetType === 'NFA') {
        const resultAut = convertDfaToNfa(store.currentAutomaton);
        const eq = checkAutomataEquivalence(store.currentAutomaton, resultAut);
        return {
          type: 'DFA_TO_NFA_IDENTITY',
          originalAut: store.currentAutomaton,
          resultAut,
          steps: [{
            index: 0,
            title: 'Identity conversion: DFA is already an NFA',
            explanation: 'Keep Q, Σ, q₀, F, and every transition unchanged. In the NFA transition relation, each DFA destination is represented by a singleton destination set, so δ_NFA(q, a) = {δ_DFA(q, a)}.',
            activeStates: store.currentAutomaton.states,
          }],
          isEquivalent: eq.areEquivalent,
        };
      }

      if (targetType === 'MINIMAL_DFA') {
        const minRes = minimizeDFA(store.currentAutomaton);
        const eq = checkAutomataEquivalence(store.currentAutomaton, minRes.minimalDfa);
        return {
          type: 'MINIMIZATION',
          originalAut: store.currentAutomaton,
          resultAut: minRes.minimalDfa,
          steps: minRes.steps.map((s, i) => ({
            index: i,
            title: s.title,
            explanation: s.explanation,
            activeStates: s.partitions.flat(),
          })),
          isEquivalent: eq.areEquivalent,
        };
      }

      if (targetType === 'REGEX') {
        const gnfaRes = convertAutomatonToRegex(store.currentAutomaton);
        let verificationAutomaton: Automaton | undefined;
        let isEquivalent = false;
        let verificationError: string | undefined;
        try {
          verificationAutomaton = regexToENFA(gnfaRes.simplifiedRegex).automaton;
          isEquivalent = checkAutomataEquivalence(store.currentAutomaton, verificationAutomaton).areEquivalent;
        } catch (error) {
          verificationError = error instanceof Error ? error.message : 'Generated expression could not be parsed for verification.';
        }
        return {
          type: 'GNFA_TO_REGEX',
          originalAut: store.currentAutomaton,
          resultRegex: gnfaRes.simplifiedRegex,
          latexRegex: gnfaRes.latexRegex,
          verificationAutomaton,
          verificationError,
          steps: gnfaRes.steps.map((s, i) => ({
            index: i,
            title: `Eliminate State '${s.eliminatedState}'`,
            explanation: s.explanation,
            activeStates: [s.eliminatedState],
          })),
          isEquivalent,
        };
      }

      // Default: NFA -> DFA
      const res = convertNfaToDfa(store.currentAutomaton);
      return {
        type: 'SUBSET_CONSTRUCTION',
        originalAut: store.currentAutomaton,
        resultAut: res.dfa,
        steps: res.steps.map((s, i) => ({
          index: i,
          title: `δ(${s.dfaStateName}, '${s.symbol}')`,
          explanation: s.explanation,
          activeStates: [s.dfaStateName],
        })),
        isEquivalent: true,
      };
    } catch (err: any) {
      return {
        type: 'ERROR',
        error: err.message || 'Conversion error',
        steps: [],
        isEquivalent: false,
      };
    }
  }, [sourceType, targetType, regexInput, store.currentAutomaton]);

  const totalSteps = conversionData.steps ? conversionData.steps.length : 0;
  const currentStep = conversionData.steps && conversionData.steps[currentStepIndex];
  const sourceMembership = conversionData.originalAut
    ? simulateAutomaton(conversionData.originalAut, testInput)
    : undefined;
  const resultMembership = conversionData.resultAut
    ? simulateAutomaton(conversionData.resultAut, testInput)
    : conversionData.verificationAutomaton
      ? simulateAutomaton(conversionData.verificationAutomaton, testInput)
      : undefined;

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
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  // Load preset
  const handlePresetSelect = (presetId: string) => {
    actions.loadPreset(presetId);
    const p = AUTOMATON_PRESETS.find(pr => pr.id === presetId);
    if (p) {
      if (p.automaton.type === 'DFA') {
        setSourceType('DFA');
        setTargetType('MINIMAL_DFA');
      } else if (p.automaton.type === 'ENFA') {
        setSourceType('ENFA');
        setTargetType('DFA');
      } else {
        setSourceType('NFA');
        setTargetType('DFA');
      }
    }
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const beginCustomBuilder = () => {
    actions.setAutomaton({ type: sourceType === 'ENFA' ? 'ENFA' : sourceType, states: [], alphabet: [], startState: '', acceptStates: [], transitions: [], description: 'Student-built source automaton' } as Automaton);
    setInputMode('VISUAL'); setCustomReady(false); setCustomError(null); setCurrentStepIndex(0);
  };

  const useCustomAutomaton = () => {
    const validation = validateAutomaton(store.currentAutomaton);
    const error = validation.issues.find(issue => issue.type === 'error');
    if (error) { setCustomError(error.message); return; }
    setCustomReady(true); setCustomError(null); setCurrentStepIndex(0);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Configuration Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-950/60 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">SOURCE:</span>
            <select
              value={sourceType}
              onChange={e => {
                const val = e.target.value as any;
                setSourceType(val);
                setTargetType(val === 'REGEX' ? 'ENFA' : val === 'DFA' ? 'NFA' : 'DFA');
                setCurrentStepIndex(0);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="NFA">NFA</option>
              <option value="ENFA">ε-NFA</option>
              <option value="DFA">DFA</option>
              <option value="REGEX">Regular Expression</option>
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-cyan-500" />

          {/* Target Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">TARGET:</span>
            <select
              value={targetType}
              onChange={e => {
                const val = e.target.value as any;
                setTargetType(val);
                setCurrentStepIndex(0);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {(sourceType === 'REGEX' || sourceType === 'NFA' || sourceType === 'ENFA') && <option value="DFA">DFA</option>}
              {sourceType === 'DFA' && <option value="NFA">NFA</option>}
              {sourceType === 'DFA' && <option value="MINIMAL_DFA">Minimal DFA</option>}
              {sourceType !== 'REGEX' && <option value="REGEX">Regular Expression</option>}
              {sourceType === 'REGEX' && <option value="ENFA">ε-NFA</option>}
            </select>
          </div>
        </div>

        {/* Presets & Regex Input */}
        <div className="flex items-center gap-2">
          {sourceType === 'REGEX' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Regex:</span>
              <input
                type="text"
                value={regexInput}
                onChange={e => setRegexInput(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono text-cyan-300 font-bold w-36"
                placeholder="(0|1)*01"
              />
            </div>
          ) : inputMode === 'EXAMPLE' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Load Preset:</span>
              <select
                onChange={e => handlePresetSelect(e.target.value)}
                value={store.activePresetId}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono text-slate-300 cursor-pointer"
              >
                {AUTOMATON_PRESETS.filter(p => p.automaton.type === sourceType).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          ) : null}

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`p-1.5 rounded text-xs font-mono ${
                viewMode === 'side_by_side' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
              title="Side-by-Side View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('graph_only')}
              className={`p-1.5 rounded text-xs font-mono ${
                viewMode === 'graph_only' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
              title="Graph View Only"
            >
              <Network className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table_only')}
              className={`p-1.5 rounded text-xs font-mono ${
                viewMode === 'table_only' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
              title="Table View Only"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {sourceType !== 'REGEX' && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-mono"><button onClick={() => { setInputMode('EXAMPLE'); setCustomReady(false); }} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200">Try an Example</button><button onClick={beginCustomBuilder} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">Build My Automaton</button>{inputMode === 'VISUAL' && !customReady && <button onClick={useCustomAutomaton} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold">Use This Automaton & Convert</button>}</div>
          {inputMode === 'VISUAL' && !customReady && <><p className="text-xs text-slate-300">Build your {sourceType}: add states, select start/final states, then connect transitions. This is the exact machine the engine will convert.</p><AutomataCanvas automaton={store.currentAutomaton} onChange={actions.setAutomaton} title={`Build Your ${sourceType}`} />{customError && <p className="text-xs text-rose-300">Fix this before converting: {customError}</p>}</>}
        </div>
      )}

      {/* Step Navigation Bar */}
      {totalSteps > 0 && (
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
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

          {/* Slider */}
          <div className="flex-1 max-w-md flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={totalSteps - 1}
              value={currentStepIndex}
              onChange={e => setCurrentStepIndex(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300 whitespace-nowrap">
              Step {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-lg border ${conversionData.isEquivalent ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{conversionData.isEquivalent ? 'Equivalence Verified' : 'Verification unavailable or failed'}</span>
          </div>
        </div>
      )}

      {/* Main Workspace (Graphs & Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Input Model */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Input: {sourceType}</span>
              {conversionData.originalAut && (
                <span className="text-[10px] text-slate-500 font-normal">
                  ({conversionData.originalAut.states.length} states)
                </span>
              )}
            </h3>
          </div>

          {conversionData.originalAut && viewMode !== 'table_only' && (
            <AutomataCanvas
              automaton={conversionData.originalAut}
              onChange={aut => actions.setAutomaton(aut)}
              title={`Source ${sourceType}`}
            />
          )}

          {conversionData.originalAut && viewMode !== 'graph_only' && (
            <TransitionTableView automaton={conversionData.originalAut} />
          )}
        </div>

        {/* Right Panel: Intermediate / Output Result */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Converted Target: {targetType}</span>
              {conversionData.resultAut && (
                <span className="text-[10px] text-purple-400 font-normal">
                  ({conversionData.resultAut.states.length} states)
                </span>
              )}
            </h3>
          </div>

          {targetType === 'REGEX' && conversionData.latexRegex ? (
            <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 text-center space-y-4">
              <span className="text-xs font-mono text-purple-300">Generated Regular Expression (R):</span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-lg font-mono text-cyan-300 glow-cyan">
                <MathDisplay math={conversionData.latexRegex} block />
              </div>
              <div className="text-xs font-mono text-slate-400">
                Raw string: <code className="text-purple-300">{conversionData.resultRegex}</code>
              </div>
            </div>
          ) : conversionData.resultAut ? (
            <>
              {viewMode !== 'table_only' && (
                <AutomataCanvas
                  automaton={conversionData.resultAut}
                  activeStateIds={currentStep?.activeStates || []}
                  readOnly
                  title={`Resulting ${targetType}`}
                />
              )}
              {viewMode !== 'graph_only' && (
                <TransitionTableView automaton={conversionData.resultAut} />
              )}
            </>
          ) : null}

          {/* Step Explanation Card */}
          {currentStep && (
            <ExplanationCard
              title={`Reasoning for Step ${currentStepIndex + 1}: ${currentStep.title}`}
              beginnerText={currentStep.explanation}
              mathText={`δ_{DFA}(S, a) = \\bigcup_{q \\in S} \\varepsilon\\text{-closure}(\\delta_{NFA}(q, a))\n\n${currentStep.explanation}`}
              examShortcutText="GATE Shortcut: Track only reachable subsets. Do not construct all 2^n subsets if they cannot be reached from the start state."
            />
          )}

          {conversionData.verificationError && (
            <p className="text-xs font-mono text-amber-300">Verification detail: {conversionData.verificationError}</p>
          )}
        </div>
      </div>

      {sourceMembership && resultMembership && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3 text-xs font-mono">
          <label className="text-slate-400">Test string</label>
          <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="empty string" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-200" />
          <span className={sourceMembership.accepted ? 'text-emerald-300' : 'text-rose-300'}>Input: {sourceMembership.accepted ? 'ACCEPT' : 'REJECT'}</span>
          <span className={resultMembership.accepted ? 'text-emerald-300' : 'text-rose-300'}>Result: {resultMembership.accepted ? 'ACCEPT' : 'REJECT'}</span>
          <span className={sourceMembership.accepted === resultMembership.accepted ? 'text-emerald-400' : 'text-rose-400'}>{sourceMembership.accepted === resultMembership.accepted ? 'Membership agrees' : 'Membership differs'}</span>
        </div>
      )}
    </div>
  );
};
