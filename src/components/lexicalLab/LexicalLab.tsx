import React, { useState, useMemo } from 'react';
import { tokenizeSourceCode } from '../../core/lexer/lexerEngine';
import { STANDARD_LEXER_RULES } from '../../core/lexer/programConstructs';
import { parseRegex } from '../../core/regex/parser';
import { regexToENFA } from '../../core/regex/thompson';
import { convertNfaToDfa } from '../../core/subsetConstruction';
import { minimizeDFA } from '../../core/minimization';
import { AutomataCanvas } from '../canvas/AutomataCanvas';
import {
  Sparkles,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCode,
} from 'lucide-react';

const SAMPLE_PROGRAMS = [
  {
    title: 'Variable Declaration & Arithmetic',
    code: 'int total = count + 10;\nfloat pi = 3.1415;\nif (total >= 100) {\n    return total * 2;\n}',
  },
  {
    title: 'While Loop & Conditions',
    code: 'while (index < max_items) {\n    sum = sum + items[index];\n    index = index + 1;\n}',
  },
  {
    title: 'Comments & String Literals',
    code: '// Compute area of circle\nfloat radius = 5.0;\n/* Multi-line comment block */\nreturn 3.14 * radius * radius;',
  },
];

export const LexicalLab: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(SAMPLE_PROGRAMS[0].code);
  const [selectedTokenRule, setSelectedTokenRule] = useState<string>('IDENTIFIER');

  // Tokenize source code live
  const lexResult = useMemo(() => {
    return tokenizeSourceCode(sourceCode);
  }, [sourceCode]);

  // Build DFA for the selected token rule
  const selectedRule = STANDARD_LEXER_RULES.find(r => r.tokenType === selectedTokenRule)!;
  const tokenAutomaton = useMemo(() => {
    try {
      // Simplified regex for visual DFA display
      const simpleRegex =
        selectedRule.tokenType === 'IDENTIFIER'
          ? '(a|b|c|d|e|f|g|_)(a|b|c|d|e|f|g|_|0|1|2)*'
          : selectedRule.tokenType === 'INTEGER'
          ? '(0|1|2|3|4|5|6|7|8|9)+'
          : selectedRule.tokenType === 'FLOAT'
          ? '(0|1|2|3)+.(0|1|2|3)+'
          : 'i.f|e.l.s.e|w.h.i.l.e';

      const enfa = regexToENFA(simpleRegex).automaton;
      const dfa = convertNfaToDfa(enfa).dfa;
      return minimizeDFA(dfa).minimalDfa;
    } catch {
      return null;
    }
  }, [selectedRule]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-400" />
          <span>Lexical Analysis & Program Constructs Studio</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          See how Regular Expressions compile into deterministic finite automata to scan real source code tokens.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Code Editor & Token Stream */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Source Code Input</span>
              </span>
              <div className="flex items-center gap-1">
                {SAMPLE_PROGRAMS.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSourceCode(sp.code)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 rounded transition-all"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              rows={7}
              className="w-full bg-[#06080d] border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 font-medium leading-relaxed resize-y"
              placeholder="Type program code here..."
            />
          </div>

          {/* Token Stream Output */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-pink-400" />
                <span>Extracted Token Stream ({lexResult.tokens.length} tokens)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Maximal-Munch Scanner</span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
              {lexResult.tokens.map((tok, i) => {
                const rule = STANDARD_LEXER_RULES.find(r => r.tokenType === tok.type);
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedTokenRule(tok.type)}
                    className="px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                    style={{
                      borderColor: rule?.color || '#64748b',
                      backgroundColor: `${rule?.color}15` || 'rgba(100,116,139,0.1)',
                      color: rule?.color || '#e2e8f0',
                    }}
                  >
                    <span className="text-[10px] opacity-75 font-bold">{tok.type}:</span>
                    <span className="font-bold">{tok.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Token Rule DFA & Grammar Pipeline */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                Token Construct: {selectedRule.tokenType}
              </span>
              <select
                value={selectedTokenRule}
                onChange={e => setSelectedTokenRule(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-purple-300 cursor-pointer"
              >
                {STANDARD_LEXER_RULES.filter(r => r.tokenType !== 'WHITESPACE').map(r => (
                  <option key={r.tokenType} value={r.tokenType}>
                    {r.tokenType}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
              <div className="text-slate-400">Formal Token Specification Regex:</div>
              <div className="text-cyan-300 font-bold break-all">{selectedRule.regex}</div>
              <p className="text-[11px] text-slate-400 pt-1 font-sans">{selectedRule.description}</p>
            </div>

            {/* Token Recognition DFA */}
            {tokenAutomaton && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Compiled Scanner DFA ({tokenAutomaton.states.length} states):
                </span>
                <AutomataCanvas
                  automaton={tokenAutomaton}
                  readOnly
                  title={`${selectedRule.tokenType} Scanner DFA`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
