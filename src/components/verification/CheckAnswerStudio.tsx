import React, { useState, useMemo } from 'react';
import { Automaton } from '../../core/types';
import { checkStudentAnswer } from '../../core/equivalence';
import { simulateAutomaton, generateTestStrings } from '../../core/simulation';
import { AUTOMATON_PRESETS } from '../../core/presets';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import { TransitionTableView } from '../pipeline/TransitionTableView';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Play,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Scale,
  ArrowRight,
  ListFilter,
} from 'lucide-react';

const SPEC_PROBLEMS = [
  {
    id: 'spec_ends_with_01',
    title: 'Construct DFA for strings ending in 01',
    description: 'Alphabet S = {0, 1}. Must accept all strings ending with the suffix 01 and reject all others.',
    referenceAutomaton: AUTOMATON_PRESETS.find(p => p.id === 'dfa_ends_with_01')!.automaton,
    initialStudentAut: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q1', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        // Intentional mistake in initial template to let student debug or test
        { from: 'q2', to: 'q0', symbol: '0' },
        { from: 'q2', to: 'q0', symbol: '1' },
      ],
    } as Automaton,
  },
  {
    id: 'spec_div_by_3',
    title: 'Construct DFA for Binary numbers divisible by 3',
    description: 'Alphabet S = {0, 1}. MSB-first binary representation mod 3 == 0.',
    referenceAutomaton: AUTOMATON_PRESETS.find(p => p.id === 'dfa_divisible_by_3')!.automaton,
    initialStudentAut: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q0'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q1', symbol: '1' },
        { from: 'q1', to: 'q2', symbol: '0' },
        { from: 'q1', to: 'q0', symbol: '1' },
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q2', symbol: '1' },
      ],
    } as Automaton,
  },
];

export const CheckAnswerStudio: React.FC = () => {
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const problem = SPEC_PROBLEMS[selectedProblemIdx];

  const [studentAut, setStudentAut] = useState<Automaton>(
    JSON.parse(JSON.stringify(problem.initialStudentAut))
  );

  const [checkResult, setCheckResult] = useState<{
    isCorrect: boolean;
    counterexample?: string;
    divergenceDetail?: string;
    feedback: string;
  } | null>(null);

  // String tracer state
  const [testString, setTestString] = useState('0101');
  const [activeStepTrace, setActiveStepTrace] = useState<number>(0);

  const simResult = useMemo(() => {
    return simulateAutomaton(studentAut, testString);
  }, [studentAut, testString]);

  // Generated 10 test strings comparison
  const batchTestResults = useMemo(() => {
    const testStrings = generateTestStrings(studentAut.alphabet, 4, 10);
    return testStrings.map(str => {
      const studentVerdict = simulateAutomaton(studentAut, str).accepted;
      const refVerdict = simulateAutomaton(problem.referenceAutomaton, str).accepted;
      return {
        input: str === '' ? 'e (empty)' : str,
        expected: refVerdict,
        actual: studentVerdict,
        passed: studentVerdict === refVerdict,
      };
    });
  }, [studentAut, problem]);

  const handleSelectProblem = (idx: number) => {
    setSelectedProblemIdx(idx);
    setStudentAut(JSON.parse(JSON.stringify(SPEC_PROBLEMS[idx].initialStudentAut)));
    setCheckResult(null);
  };

  const handleCheckAnswer = () => {
    const res = checkStudentAnswer(studentAut, problem.referenceAutomaton);
    setCheckResult(res);
    if (res.isCorrect) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-teal-400" />
          <span>Check My Answer & Automated Professor</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Draw your automaton to satisfy a language specification. The automated professor tests thousands of strings and finds exact divergence states.
        </p>
      </div>

      {/* Problem Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SPEC_PROBLEMS.map((prob, i) => (
          <div
            key={prob.id}
            onClick={() => handleSelectProblem(i)}
            className={`p-4 rounded-2xl glass-panel border cursor-pointer transition-all ${
              selectedProblemIdx === i
                ? 'border-teal-500 bg-teal-500/15 shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]'
                : 'border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-mono font-bold text-slate-200">{prob.title}</div>
            <p className="text-xs text-slate-400 mt-1">{prob.description}</p>
          </div>
        ))}
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Drawing Canvas & Check Button */}
        <div className="lg:col-span-2 space-y-4">
          <AutomataCanvas
            automaton={studentAut}
            onChange={updated => {
              setStudentAut(updated);
              setCheckResult(null);
            }}
            title="Your Drawn Automaton"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleCheckAnswer}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              CHECK MY ANSWER
            </button>

            <button
              onClick={() => handleSelectProblem(selectedProblemIdx)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
            >
              Reset to Template
            </button>
          </div>

          {/* Professor Verdict Banner */}
          {checkResult && (
            <div
              className={`p-5 rounded-2xl border shadow-xl space-y-3 font-mono text-xs ${
                checkResult.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {checkResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{checkResult.isCorrect ? 'LANGUAGES ARE EQUIVALENT ?' : 'AUTOMATON INCORRECT ?'}</span>
              </div>

              <div className="whitespace-pre-line leading-relaxed text-slate-300">
                {checkResult.feedback}
              </div>

              {checkResult.counterexample !== undefined && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-800/80 space-y-1">
                  <div className="text-rose-400 font-bold">
                    Shortest Distinguishing Counterexample:
                  </div>
                  <div className="text-sm font-bold text-cyan-300">
                    "{checkResult.counterexample}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {checkResult.divergenceDetail}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: String Simulation & Batch Tests */}
        <div className="space-y-4">
          {/* Live String Simulation Tracer */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Step-by-Step String Tracer</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testString}
                onChange={e => {
                  setTestString(e.target.value);
                  setActiveStepTrace(0);
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-slate-200"
                placeholder="Enter string (e.g. 0101)..."
              />
            </div>

            {simResult && (
              <div className="space-y-2 text-xs font-mono">
                <div
                  className={`p-2.5 rounded-xl border ${
                    simResult.accepted
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  Verdict: <span className="font-bold">{simResult.accepted ? 'ACCEPT' : 'REJECT'}</span>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                  {simResult.steps.map((s, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-900/60 rounded border border-slate-800 text-[11px]">
                      <span className="text-cyan-400 font-bold">Step {s.stepIndex}: </span>
                      <span className="text-slate-300">{s.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Batch Test Table */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-teal-400" />
                <span>Automated Batch String Tests (10)</span>
              </h3>
            </div>

            <div className="overflow-x-auto no-scrollbar max-h-48">
              <table className="w-full text-[11px] font-mono text-left">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-1">String</th>
                    <th className="py-1 text-center">Expected</th>
                    <th className="py-1 text-center">Your DFA</th>
                    <th className="py-1 text-center">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {batchTestResults.map((r, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-slate-300 font-bold">{r.input}</td>
                      <td className="py-1 text-center">{r.expected ? 'ACCEPT' : 'REJECT'}</td>
                      <td className="py-1 text-center">{r.actual ? 'ACCEPT' : 'REJECT'}</td>
                      <td className="py-1 text-center">
                        {r.passed ? (
                          <span className="text-emerald-400 font-bold">?</span>
                        ) : (
                          <span className="text-rose-400 font-bold">?</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
