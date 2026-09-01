import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { AutomataCanvas } from './AutomataCanvas';
import { TransitionTableView } from '../pipeline/TransitionTableView';
import { validateAutomaton } from '../../core/validation';
import { simulateAutomaton } from '../../core/simulation';
import { AUTOMATON_PRESETS } from '../../core/presets';
import {
  Binary,
  ShieldCheck,
  AlertTriangle,
  Play,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const BuilderStudio: React.FC = () => {
  const [store, actions] = useAppStore();
  const [testString, setTestString] = useState('01');

  // Semantic linter issues
  const validation = validateAutomaton(store.currentAutomaton);
  const simResult = simulateAutomaton(store.currentAutomaton, testString);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.currentAutomaton, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${store.currentAutomaton.type}_automaton.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.states && parsed.transitions) {
          actions.setAutomaton(parsed);
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <Binary className="w-6 h-6 text-sky-400" />
            <span>Interactive State Diagram Canvas & Playground</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Construct arbitrary DFAs, NFAs, and e-NFAs with instant real-time semantic linting and execution tracing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Interactive Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <AutomataCanvas
            automaton={store.currentAutomaton}
            onChange={actions.setAutomaton}
            title={`${store.currentAutomaton.type} Editor Canvas`}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Machine Type:</span>
              <select
                value={store.currentAutomaton.type}
                onChange={e => {
                  actions.setAutomaton({
                    ...store.currentAutomaton,
                    type: e.target.value as any,
                  });
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-300 font-bold"
              >
                <option value="DFA">DFA</option>
                <option value="NFA">NFA</option>
                <option value="ENFA">e-NFA</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Load Preset:</span>
              <select
                onChange={e => actions.loadPreset(e.target.value)}
                value={store.activePresetId}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 cursor-pointer"
              >
                {AUTOMATON_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Col: Semantic Linter & String Tester */}
        <div className="space-y-4">
          {/* Real-Time Validator / Linter */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Automata Semantic Linter</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  validation.isValid
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {validation.isValid ? 'VALID' : 'ISSUES DETECTED'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar text-xs font-mono">
              {validation.issues.length === 0 ? (
                <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No semantic errors or warnings detected.</span>
                </div>
              ) : (
                validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-[11px] space-y-0.5 ${
                      issue.type === 'error'
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                        : issue.type === 'warning'
                        ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{issue.title}</span>
                    </div>
                    <p className="text-[10px] opacity-90">{issue.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live String Tester */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Simulate String</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testString}
                onChange={e => setTestString(e.target.value)}
                placeholder="Enter string (e.g. 0101)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
              />
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-2 font-mono text-xs ${
                simResult.accepted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              {simResult.accepted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold">{simResult.accepted ? 'ACCEPTED ?' : 'REJECTED ?'}</span>
                <span className="text-[10px] block opacity-80">
                  Final state(s): {simResult.finalStates.join(', ') || 'Trap'}
                </span>
              </div>
            </div>
          </div>

          {/* Transition Table */}
          <TransitionTableView automaton={store.currentAutomaton} />
        </div>
      </div>
    </div>
  );
};
