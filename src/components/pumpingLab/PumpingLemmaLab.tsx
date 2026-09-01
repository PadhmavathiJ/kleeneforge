import React, { useState } from 'react';
import { PUMPING_LANGUAGES } from '../../core/pumping/languages';
import { checkPumpingProof, ProofCheckOutput } from '../../core/pumping/proofChecker';
import { MathDisplay } from '../common/MathDisplay';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const PumpingLemmaLab: React.FC = () => {
  const [selectedLangId, setSelectedLangId] = useState(PUMPING_LANGUAGES[0].id);
  const selectedLang = PUMPING_LANGUAGES.find(l => l.id === selectedLangId)!;

  // 5-Stage Guided Walkthrough State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [chosenI, setChosenI] = useState<number>(0);

  // Check My Proof Custom Form State
  const [customP, setCustomP] = useState(3);
  const [customW, setCustomW] = useState(selectedLang.defaultW || 'aaabbb');
  const [customX, setCustomX] = useState('a');
  const [customY, setCustomY] = useState('aa');
  const [customZ, setCustomZ] = useState('bbb');
  const [customI, setCustomI] = useState(0);
  const [proofResult, setProofResult] = useState<ProofCheckOutput | null>(null);

  const handleLanguageChange = (id: string) => {
    setSelectedLangId(id);
    const lang = PUMPING_LANGUAGES.find(l => l.id === id)!;
    setCustomP(lang.defaultP || 3);
    setCustomW(lang.defaultW || 'aaabbb');
    setActiveStep(1);
    setProofResult(null);
  };

  const handleVerifyCustomProof = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkPumpingProof({
      languageId: selectedLangId,
      p: customP,
      w: customW,
      x: customX,
      y: customY,
      z: customZ,
      i: customI,
    });
    setProofResult(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-amber-400" />
          <span>Pumping Lemma Interactive Proof Laboratory</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Rigorous adversarial proof engine respecting quantifiers: Adversary chooses p & decomposition; You choose string w & pump factor i.
        </p>
      </div>

      {/* Language Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PUMPING_LANGUAGES.map(lang => (
          <button
            key={lang.id}
            onClick={() => handleLanguageChange(lang.id)}
            className={`p-3 rounded-xl glass-panel border text-left transition-all cursor-pointer ${
              selectedLangId === lang.id
                ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]'
                : 'border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="text-xs font-mono font-bold text-slate-200 truncate">
              {lang.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {lang.description}
            </div>
          </button>
        ))}
      </div>

      {/* Main 5-Stage Interactive Proof Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 5-Stage Guided Walkthrough */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-amber-950/60 space-y-5 shadow-2xl">
            {/* Step Pills */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar gap-2">
              {[1, 2, 3, 4, 5].map(stepNum => (
                <button
                  key={stepNum}
                  onClick={() => setActiveStep(stepNum as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeStep === stepNum
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 glow-amber'
                      : activeStep > stepNum
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  <span>Stage {stepNum}</span>
                </button>
              ))}
            </div>

            {/* Stage Content */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
                  <MathDisplay math={selectedLang.latex} block />
                </div>
                <h3 className="text-sm font-bold font-mono text-amber-300">
                  Stage 1: Assume Language L is Regular (Proof by Contradiction)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We begin our proof by assuming the contrary: suppose <MathDisplay math="L" /> is a regular language.
                  By the Pumping Lemma for regular languages, there must exist some constant integer pumping length{' '}
                  <MathDisplay math="p \ge 1" /> (corresponding to the number of states in a recognizing DFA).
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
                  >
                    <span>Proceed to Stage 2</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-amber-300">
                  Stage 2: Pumping Length (Adversary Choice)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Crucial Quantifier Rule:</strong> We do NOT get to pick a specific value of <MathDisplay math="p" />.
                  The adversary supplies some arbitrary positive integer <MathDisplay math="p" />.
                  Our proof must work for <em>any</em> <MathDisplay math="p \ge 1" />.
                </p>
                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setActiveStep(1)} className="text-xs text-slate-400 hover:text-slate-200 font-mono">&larr; Back</button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
                  >
                    <span>Proceed to Stage 3</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-amber-300">
                  Stage 3: Choose String w ? L with |w| = p (Our Choice)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We now strategically pick a single string <MathDisplay math="w \in L" /> expressed in terms of <MathDisplay math="p" /> such that <MathDisplay math="|w| \ge p" />.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-cyan-300 font-mono text-xs">
                  Chosen String: <MathDisplay math={`w = ${selectedLang.defaultW || 'a^p b^p'}`} />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setActiveStep(2)} className="text-xs text-slate-400 hover:text-slate-200 font-mono">&larr; Back</button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
                  >
                    <span>Proceed to Stage 4</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-amber-300">
                  Stage 4: Adversarial Decomposition w = xyz
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Pumping Lemma states that the adversary can decompose <MathDisplay math="w = xyz" /> in any way, subject only to:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">1. <MathDisplay math="|xy| \le p" /> (y is in the first p characters)</div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">2. <MathDisplay math="|y| \ge 1" /> (y is non-empty)</div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-bold text-slate-300">Adversary Decomposition Cases:</span>
                  {selectedLang.adversaryCases.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-amber-300">{c.caseName}</div>
                      <div className="text-slate-400">{c.yConstraint}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => setActiveStep(3)} className="text-xs text-slate-400 hover:text-slate-200 font-mono">&larr; Back</button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
                  >
                    <span>Proceed to Stage 5 (Pump & Contradict)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stage 5: Pump with factor i to derive Contradiction</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We choose <MathDisplay math="i \ge 0" /> to pump <MathDisplay math="xy^i z" /> and prove the resulting string leaves <MathDisplay math="L" />.
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Choose pump factor i:</span>
                  {[0, 2, 3].map(val => (
                    <button
                      key={val}
                      onClick={() => setChosenI(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                        chosenI === val
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      i = {val} {val === 0 ? '(Pump Down)' : '(Pump Up)'}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="text-xs font-mono font-bold text-emerald-300">
                    Case analysis (not a conclusion yet):
                  </div>
                  <p className="text-xs text-slate-200">
                    A favorable decomposition alone does not prove non-regularity. A valid proof must use this pumping strategy to defeat every decomposition satisfying the two adversarial constraints.
                  </p>
                  <div className="font-mono text-xs text-cyan-300 font-bold">
                    Only state the non-regularity conclusion after every listed adversarial case has been justified.
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <button onClick={() => setActiveStep(4)} className="text-xs text-slate-400 hover:text-slate-200 font-mono">&larr; Back</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: "Check My Proof" Tool */}
        <div className="space-y-4">
          <form
            onSubmit={handleVerifyCustomProof}
            className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Check My Proof</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Adversarial Verifier</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-0.5">Pumping length (p):</label>
                <input
                  type="number"
                  min="1"
                  value={customP}
                  onChange={e => setCustomP(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Test string (w ? L):</label>
                <input
                  type="text"
                  value={customW}
                  onChange={e => setCustomW(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-0.5">Prefix x:</label>
                  <input
                    type="text"
                    value={customX}
                    onChange={e => setCustomX(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">Mid y (|y|=1):</label>
                  <input
                    type="text"
                    value={customY}
                    onChange={e => setCustomY(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 font-bold text-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">Suffix z:</label>
                  <input
                    type="text"
                    value={customZ}
                    onChange={e => setCustomZ(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Pump factor (i = 0):</label>
                <input
                  type="number"
                  min="0"
                  value={customI}
                  onChange={e => setCustomI(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Verify Proof Conditions
            </button>

            {proofResult && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div
                  className={`p-3 rounded-xl border ${
                    proofResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {proofResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{proofResult.verdict}</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-300">{proofResult.explanation}</p>
                </div>

                <div className="space-y-1">
                  {proofResult.checks.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] flex items-start gap-1.5"
                    >
                      {c.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-200">{c.name}</div>
                        <div className="text-slate-400 text-[10px]">{c.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
