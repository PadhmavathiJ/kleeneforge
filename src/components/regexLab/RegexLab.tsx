import React, { useState, useMemo } from 'react';
import { parseRegex } from '../../core/regex/parser';
import { regexToENFA } from '../../core/regex/thompson';
import { convertNfaToDfa } from '../../core/subsetConstruction';
import { minimizeDFA } from '../../core/minimization';
import { ASTNode } from '../../core/types';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { TransitionTableView } from '../pipeline/TransitionTableView';
import { MathDisplay } from '../common/MathDisplay';
import { simulateAutomaton } from '../../core/simulation';
import {
  FileCode,
  TreePine,
  Play,
  Sparkles,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

const REGEX_PRESETS = [
  { label: '(0|1)*01', desc: 'Binary strings ending in 01' },
  { label: '(a|b)*abb', desc: 'Strings over {a,b} ending in abb' },
  { label: '(00|11)*', desc: 'Even pairs of repeated bits' },
  { label: 'a(a|b)*b', desc: 'Starts with a and ends with b' },
  { label: '0*1*2*', desc: 'Sorted block orders' },
];

/**
 * Recursive AST Tree node renderer.
 */
const ASTTreeNode: React.FC<{ node: ASTNode; depth?: number }> = ({ node, depth = 0 }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border shadow-md ${
          node.type === 'LITERAL'
            ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
            : node.type === 'STAR' || node.type === 'PLUS'
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
            : node.type === 'UNION'
            ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
            : 'bg-indigo-950/80 border-indigo-500/60 text-indigo-200'
        }`}
      >
        {node.type === 'LITERAL'
          ? `Char: '${node.value}'`
          : node.type === 'EPSILON'
          ? 'Epsilon (e)'
          : node.type === 'EMPTY'
          ? 'Empty (�)'
          : node.type === 'STAR'
          ? 'Kleene Star (*)'
          : node.type === 'PLUS'
          ? 'Positive Closure (+)'
          : node.type === 'UNION'
          ? 'Union (|)'
          : 'Concat (�)'}
      </div>

      {'left' in node && 'right' in node && (
        <div className="flex items-start gap-4 pt-3 relative">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-500 font-mono mb-1">L</span>
            <ASTTreeNode node={node.left} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-500 font-mono mb-1">R</span>
            <ASTTreeNode node={node.right} depth={depth + 1} />
          </div>
        </div>
      )}

      {'child' in node && (
        <div className="pt-3 flex flex-col items-center">
          <span className="text-[9px] text-slate-500 font-mono mb-1">Sub</span>
          <ASTTreeNode node={node.child} depth={depth + 1} />
        </div>
      )}
    </div>
  );
};

export const RegexLab: React.FC = () => {
  const [pattern, setPattern] = useState('(0|1)*01');
  const [testString, setTestString] = useState('1101');
  const [activePipelineTab, setActivePipelineTab] = useState<'AST' | 'ENFA' | 'DFA' | 'MIN_DFA'>('ENFA');

  // Compute AST, Thompson ENFA, DFA, Minimal DFA
  const pipeline = useMemo(() => {
    try {
      const ast = parseRegex(pattern);
      const thompsonRes = regexToENFA(pattern);
      const enfa = thompsonRes.automaton;
      const subsetRes = convertNfaToDfa(enfa);
      const dfa = subsetRes.dfa;
      const minRes = minimizeDFA(dfa);
      const minDfa = minRes.minimalDfa;

      return {
        ast,
        enfa,
        dfa,
        minDfa,
        thompsonSteps: thompsonRes.steps,
        error: null,
      };
    } catch (err: any) {
      return {
        ast: null,
        enfa: null,
        dfa: null,
        minDfa: null,
        thompsonSteps: [],
        error: err.message || 'Syntax error in regular expression',
      };
    }
  }, [pattern]);

  // Test string against generated automaton
  const simResult = useMemo(() => {
    if (!pipeline.minDfa) return null;
    return simulateAutomaton(pipeline.minDfa, testString);
  }, [pipeline.minDfa, testString]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <FileCode className="w-6 h-6 text-emerald-400" />
          <span>Regular Expression Laboratory</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Parse regular expressions into syntax trees, construct Thompson fragments, and compile to minimal DFAs.
        </p>
      </div>

      {/* Input Bar & Presets */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-950/60 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px] relative">
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 shadow-inner"
              placeholder="e.g. (0|1)*01"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-mono mr-1">Presets:</span>
            {REGEX_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setPattern(p.label)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {pipeline.error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
            {pipeline.error}
          </div>
        )}
      </div>

      {/* Compilation Pipeline Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActivePipelineTab('AST')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activePipelineTab === 'AST'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TreePine className="w-3.5 h-3.5" />
          <span>1. Syntax Tree (AST)</span>
        </button>

        <button
          onClick={() => setActivePipelineTab('ENFA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activePipelineTab === 'ENFA'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>2. Thompson e-NFA</span>
        </button>

        <button
          onClick={() => setActivePipelineTab('DFA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activePipelineTab === 'DFA'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>3. Subset DFA</span>
        </button>

        <button
          onClick={() => setActivePipelineTab('MIN_DFA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activePipelineTab === 'MIN_DFA'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>4. Minimal DFA</span>
        </button>
      </div>

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activePipelineTab === 'AST' && pipeline.ast && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 min-h-[460px] flex items-center justify-center overflow-auto shadow-2xl">
              <ASTTreeNode node={pipeline.ast} />
            </div>
          )}

          {activePipelineTab === 'ENFA' && pipeline.enfa && (
            <AutomataCanvas automaton={pipeline.enfa} readOnly title="Thompson e-NFA" />
          )}

          {activePipelineTab === 'DFA' && pipeline.dfa && (
            <AutomataCanvas automaton={pipeline.dfa} readOnly title="Deterministic DFA" />
          )}

          {activePipelineTab === 'MIN_DFA' && pipeline.minDfa && (
            <AutomataCanvas automaton={pipeline.minDfa} readOnly title="Minimized Canonical DFA" />
          )}
        </div>

        {/* Right Sidebar: String Tester & Table */}
        <div className="space-y-4">
          {/* Live String Tester */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Test String Acceptance</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testString}
                onChange={e => setTestString(e.target.value)}
                placeholder="Enter string to test..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
              />
            </div>

            {simResult && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 font-mono text-xs ${
                  simResult.accepted
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                {simResult.accepted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold">{simResult.accepted ? 'ACCEPTED ?' : 'REJECTED ?'}</div>
                  <div className="text-[10px] opacity-80">
                    Halted in state(s): {simResult.finalStates.join(', ') || 'Trap'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transition Table */}
          {pipeline.minDfa && <TransitionTableView automaton={pipeline.minDfa} />}
        </div>
      </div>
    </div>
  );
};
