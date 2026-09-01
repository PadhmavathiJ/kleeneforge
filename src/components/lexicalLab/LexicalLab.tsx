import React, { useState, useMemo } from 'react';
import { tokenizeSourceCode } from '../../core/lexer/lexerEngine';
import { STANDARD_LEXER_RULES } from '../../core/lexer/programConstructs';
import { parseRegex } from '../../core/regex/parser';
import { regexToENFA } from '../../core/regex/thompson';
import { convertNfaToDfa } from '../../core/subsetConstruction';
import { minimizeDFA } from '../../core/minimization';
import { Automaton } from '../../core/types';
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

const examplesFor = (type: string) => type === 'IDENTIFIER'
  ? { valid: ['total', '_count', 'item2'], invalid: ['2items', 'total-name'] }
  : type === 'INTEGER'
    ? { valid: ['0', '10', '2048'], invalid: ['3.14', '12a'] }
    : type === 'KEYWORD'
      ? { valid: ['int', 'while', 'return'], invalid: ['integer', 'returns'] }
      : { valid: ['+', '==', '='], invalid: ['abc', '@'] };

function teachingDfa(type: string): Automaton {
  const identifier = type === 'IDENTIFIER';
  const integer = type === 'INTEGER';
  const states = identifier ? ['START', 'IDENTIFIER', 'TRAP'] : integer ? ['START', 'INTEGER', 'TRAP'] : ['START', 'ACCEPT', 'TRAP'];
  const accept = identifier ? 'IDENTIFIER' : integer ? 'INTEGER' : 'ACCEPT';
  const first = identifier ? 'letter/_' : integer ? 'digit' : 'valid token character';
  const repeat = identifier ? 'letter/digit/_' : integer ? 'digit' : 'token ends';
  return { type: 'DFA', states, alphabet: [first, repeat, 'other'], startState: 'START', acceptStates: [accept], transitions: [
    { from: 'START', to: accept, symbol: first }, { from: 'START', to: 'TRAP', symbol: 'other' },
    { from: accept, to: accept, symbol: repeat }, { from: accept, to: 'TRAP', symbol: 'other' }, { from: 'TRAP', to: 'TRAP', symbol: 'other' },
  ] };
}

export const LexicalLab: React.FC = () => {
  const [sourceCode, setSourceCode] = useState(SAMPLE_PROGRAMS[0].code);
  const [selectedTokenRule, setSelectedTokenRule] = useState<string>('IDENTIFIER');
  const [sampleLexeme, setSampleLexeme] = useState('total');

  // Tokenize source code live
  const lexResult = useMemo(() => {
    return tokenizeSourceCode(sourceCode);
  }, [sourceCode]);

  // Build DFA for the selected token rule
  const selectedRule = STANDARD_LEXER_RULES.find(r => r.tokenType === selectedTokenRule)!;
  const tokenAutomaton = useMemo(() => teachingDfa(selectedRule.tokenType), [selectedRule.tokenType]);
  const lexemeAccepted = useMemo(() => new RegExp(`^(?:${selectedRule.regex})$`).test(sampleLexeme), [selectedRule, sampleLexeme]);
  const examples = examplesFor(selectedRule.tokenType);

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
              <div className="text-slate-400">Regex rule:</div>
              <div className="text-cyan-300 font-bold break-all">{selectedRule.regex}</div>
              <p className="text-[11px] text-slate-300 pt-1 font-sans"><b>In plain English:</b> {selectedRule.description}</p>
              <div className="text-[11px] text-slate-400">Valid: {examples.valid.join(', ')} &nbsp; • &nbsp; Not valid: {examples.invalid.join(', ')}</div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-slate-300">Simple teaching DFA</div>
              <p className="text-[11px] text-slate-400">START means no valid character has been read. The accepting state means the lexeme may end now. TRAP means this token rule can no longer match.</p>
              <AutomataCanvas automaton={tokenAutomaton} readOnly title={`${selectedRule.tokenType}: START → ACCEPT or TRAP`} />
              <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3 space-y-2">
                <label className="block text-xs font-mono font-bold text-cyan-300">Try a lexeme</label>
                <input value={sampleLexeme} onChange={e => setSampleLexeme(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100" placeholder="Enter one token" />
                <div className={`text-center rounded-lg p-3 font-mono font-bold ${lexemeAccepted ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{lexemeAccepted ? 'ACCEPTED' : 'REJECTED'}</div>
                <p className="text-[11px] text-slate-300">{lexemeAccepted ? `“${sampleLexeme}” matches the ${selectedRule.tokenType} rule and can finish in an accepting state.` : `“${sampleLexeme}” does not match the complete ${selectedRule.tokenType} rule; it would reach TRAP or end in a non-accepting state.`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
