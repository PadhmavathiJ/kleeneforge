import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { MathDisplay } from '../common/MathDisplay';
import {
  Globe2,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Binary,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LanguageCatalogItem {
  id: string;
  name: string;
  latex: string;
  description: string;
  alphabet: string[];
  isRegular: boolean;
  reasoning: string;
  sampleAccepted: string[];
  sampleRejected: string[];
  recommendedAction: 'DFA' | 'PUMPING';
}

const FORMAL_LANGUAGES: LanguageCatalogItem[] = [
  {
    id: 'lang_ends_01',
    name: 'Binary strings ending in 01',
    latex: 'L = \\{ w \\in \\{0, 1\\}^* \\mid w \\text{ ends with } 01 \\}',
    description: 'Strings of 0s and 1s that terminate with the specific suffix 01.',
    alphabet: ['0', '1'],
    isRegular: true,
    reasoning: 'Can be recognized by a 3-state DFA that tracks only the last 2 characters read. Finite memory is sufficient.',
    sampleAccepted: ['01', '101', '001', '11001'],
    sampleRejected: ['', '0', '1', '10', '11', '010'],
    recommendedAction: 'DFA',
  },
  {
    id: 'lang_even_as',
    name: 'Strings with even count of a\'s',
    latex: 'L = \\{ w \\in \\{a, b\\}^* \\mid \\text{count}_a(w) \\equiv 0 \\pmod 2 \\}',
    description: 'Strings where symbol \'a\' occurs an even number of times.',
    alphabet: ['a', 'b'],
    isRegular: true,
    reasoning: 'Recognized by a 2-state DFA tracking parity (even vs odd count of a).',
    sampleAccepted: ['', 'b', 'aa', 'aab', 'aba', 'bb'],
    sampleRejected: ['a', 'ab', 'ba', 'aaa', 'aaba'],
    recommendedAction: 'DFA',
  },
  {
    id: 'lang_an_bn',
    name: 'Equal a\'s followed by equal b\'s',
    latex: 'L = \\{ a^n b^n \\mid n \\ge 0 \\}',
    description: 'Strings of n a\'s followed by exactly n b\'s.',
    alphabet: ['a', 'b'],
    isRegular: false,
    reasoning: 'Requires counting an unbounded number of a\'s to verify against b\'s. Violates the Pumping Lemma under adversarial decomposition.',
    sampleAccepted: ['', 'ab', 'aabb', 'aaabbb'],
    sampleRejected: ['a', 'b', 'aab', 'abb', 'ba', 'aabba'],
    recommendedAction: 'PUMPING',
  },
  {
    id: 'lang_ww',
    name: 'Word repetition (ww)',
    latex: 'L = \\{ ww \\mid w \\in \\{0, 1\\}^* \\}',
    description: 'Arbitrary binary words repeated consecutively twice.',
    alphabet: ['0', '1'],
    isRegular: false,
    reasoning: 'Requires storing and matching an arbitrarily long prefix against the suffix. Proved non-regular using string w = 0^p 1 0^p 1.',
    sampleAccepted: ['', '00', '11', '0101', '110110'],
    sampleRejected: ['0', '1', '01', '10', '0110', '01001'],
    recommendedAction: 'PUMPING',
  },
  {
    id: 'lang_prime_ones',
    name: 'Prime unary length',
    latex: 'L = \\{ 1^p \\mid p \\text{ is prime} \\}',
    description: 'Strings of 1s whose length is a prime integer.',
    alphabet: ['1'],
    isRegular: false,
    reasoning: 'Prime numbers have non-constant gaps. Pumping with i = p + 1 yields composite length p(1 + k), leaving the language.',
    sampleAccepted: ['11', '111', '11111', '1111111'],
    sampleRejected: ['', '1', '1111', '111111', '11111111'],
    recommendedAction: 'PUMPING',
  },
];

export const LanguageLab: React.FC = () => {
  const [, actions] = useAppStore();
  const [selectedLang, setSelectedLang] = useState<LanguageCatalogItem>(FORMAL_LANGUAGES[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-blue-400" />
          <span>Formal Regular Language Laboratory</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Explore formal languages, verify regularity boundaries, and transition directly into DFA construction or Pumping Lemma contradiction proofs.
        </p>
      </div>

      {/* Language Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORMAL_LANGUAGES.map(lang => (
          <div
            key={lang.id}
            onClick={() => setSelectedLang(lang)}
            className={`p-4 rounded-2xl glass-panel border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              selectedLang.id === lang.id
                ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]'
                : 'border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    lang.isRegular
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {lang.isRegular ? 'REGULAR' : 'NON-REGULAR'}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  S = {'{' + lang.alphabet.join(', ') + '}'}
                </span>
              </div>

              <h3 className="text-xs font-mono font-bold text-slate-200 mt-2">
                {lang.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {lang.description}
              </p>
            </div>

            <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-cyan-300 text-center font-mono text-xs">
              <MathDisplay math={lang.latex} />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analysis of Selected Language */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-mono font-bold text-slate-100">
              {selectedLang.name}
            </h3>
            <div className="text-xs text-cyan-300 font-mono mt-1">
              <MathDisplay math={selectedLang.latex} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedLang.isRegular ? (
              <button
                onClick={() => actions.setView('CONVERT')}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>Construct Recognizing DFA</span>
              </button>
            ) : (
              <button
                onClick={() => actions.setView('PUMPING')}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Open Pumping Lemma Proof</span>
              </button>
            )}
          </div>
        </div>

        {/* Regularity Verdict & Theoretical Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Mathematical Regularity Analysis
            </span>
            <div
              className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                selectedLang.isRegular
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedLang.isRegular ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>Verdict: {selectedLang.isRegular ? 'Language is REGULAR' : 'Language is NOT REGULAR'}</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">{selectedLang.reasoning}</p>
            </div>
          </div>

          {/* Sample Strings */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Sample Membership Strings
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/60 space-y-1.5">
                <span className="text-emerald-400 font-bold block">Accepted (w ? L):</span>
                <div className="space-y-1 text-slate-300">
                  {selectedLang.sampleAccepted.map((s, i) => (
                    <div key={i} className="p-1 bg-slate-950 rounded">
                      {s === '' ? 'e (empty string)' : `"${s}"`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-900/60 space-y-1.5">
                <span className="text-rose-400 font-bold block">Rejected (w ? L):</span>
                <div className="space-y-1 text-slate-300">
                  {selectedLang.sampleRejected.map((s, i) => (
                    <div key={i} className="p-1 bg-slate-950 rounded">
                      {s === '' ? 'e (empty string)' : `"${s}"`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
