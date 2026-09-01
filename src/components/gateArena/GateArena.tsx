import React, { useState, useEffect, useMemo } from 'react';
import { GATE_QUESTIONS } from '../../core/gateQuestions';
import { GATEQuestion } from '../../core/types';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { MathDisplay } from '../common/MathDisplay';
import { ExplanationCard } from '../pipeline/ExplanationCard';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Zap,
  BookOpen,
  Filter,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const GateArena: React.FC = () => {
  const { recordQuestionAttempt } = useAnalyticsStore();

  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // User input states
  const [userSelectedOptions, setUserSelectedOptions] = useState<string[]>([]);
  const [userNatInput, setUserNatInput] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // 30-min Exam Mode
  const [isExamMode, setIsExamMode] = useState(false);
  const [examTimer, setExamTimer] = useState(1800); // 30 minutes in seconds
  const [examAnswers, setExamAnswers] = useState<Record<string, string[]>>({});
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Filter questions
  const filteredQuestions = GATE_QUESTIONS.filter(q => {
    const matchTopic = selectedTopic === 'ALL' || q.topic === selectedTopic;
    const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchTopic && matchDiff;
  });

  const currentQ: GATEQuestion | undefined = filteredQuestions[activeQuestionIdx] || GATE_QUESTIONS[0];

  // Question timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuestionIdx]);

  // Exam timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isExamMode && !isExamCompleted && examTimer > 0) {
      timer = setInterval(() => {
        setExamTimer(t => {
          if (t <= 1) {
            setIsExamCompleted(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamMode, isExamCompleted, examTimer]);

  const handleOptionToggle = (optionId: string) => {
    if (hasSubmitted && !isExamMode) return;

    if (currentQ.type === 'MSQ') {
      setUserSelectedOptions(prev =>
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      );
    } else {
      setUserSelectedOptions([optionId]);
    }
  };

  const handleSubmitPractice = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);

    let isCorrect = false;
    if (currentQ.type === 'NAT') {
      const num = parseFloat(userNatInput.trim());
      if (currentQ.natRange && !isNaN(num)) {
        isCorrect = num >= currentQ.natRange[0] && num <= currentQ.natRange[1];
      }
    } else {
      const sortedUser = [...userSelectedOptions].sort().join(',');
      const sortedAns = [...currentQ.correctAnswers].sort().join(',');
      isCorrect = sortedUser === sortedAns;
    }

    if (isCorrect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    recordQuestionAttempt(
      currentQ.topic,
      currentQ.id,
      isCorrect,
      timeSpent,
      !isCorrect
        ? {
            userMistake: `Selected [${userSelectedOptions.join(', ')}] instead of [${currentQ.correctAnswers.join(', ')}]`,
            correctReasoning: currentQ.explanation,
            trapType: currentQ.gateTrapAlert || 'Conceptual Misconception',
            summary: currentQ.questionText.slice(0, 80),
          }
        : undefined
    );
  };

  const handleNextQuestion = () => {
    setUserSelectedOptions([]);
    setUserNatInput('');
    setHasSubmitted(false);
    setTimeSpent(0);
    setActiveQuestionIdx(prev => (prev + 1) % filteredQuestions.length);
  };

  const isCurrentCorrect = useMemo(() => {
    if (!hasSubmitted) return false;
    if (currentQ.type === 'NAT') {
      const num = parseFloat(userNatInput.trim());
      return !!(currentQ.natRange && !isNaN(num) && num >= currentQ.natRange[0] && num <= currentQ.natRange[1]);
    }
    return (
      [...userSelectedOptions].sort().join(',') === [...currentQ.correctAnswers].sort().join(',')
    );
  }, [hasSubmitted, currentQ, userSelectedOptions, userNatInput]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <span>GATE & University Practice Arena</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            High-yield questions with instant trap detection, why other options are wrong, and exam shortcuts.
          </p>
        </div>

        <button
          onClick={() => {
            setIsExamMode(!isExamMode);
            setIsExamCompleted(false);
            setExamTimer(1800);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow ${
            isExamMode
              ? 'bg-purple-600 text-white glow-purple'
              : 'glass-panel border border-purple-500/40 text-purple-300 hover:border-purple-400'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{isExamMode ? 'Exit 30-Min Mock Exam' : 'Launch 30-Min Mock Exam'}</span>
        </button>
      </div>

      {/* Filter Toolbar (Practice Mode) */}
      {!isExamMode && (
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Topic:</span>
            </div>
            <select
              value={selectedTopic}
              onChange={e => {
                setSelectedTopic(e.target.value);
                setActiveQuestionIdx(0);
                setHasSubmitted(false);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Syllabus Topics (19/19)</option>
              <option value="Deterministic Finite Automata (DFA)">Deterministic Finite Automata (DFA)</option>
              <option value="NFA ? DFA conversion">NFA ? DFA conversion</option>
              <option value="DFA Minimization">DFA Minimization</option>
              <option value="Regular Expressions">Regular Expressions</option>
              <option value="Pumping Lemma for Regular Languages">Pumping Lemma for Regular Languages</option>
              <option value="Lexical Analysis using Finite Automata">Lexical Analysis</option>
              <option value="Regular Languages">Regular Languages & Closure</option>
            </select>

            <div className="flex items-center gap-1.5 text-slate-400 ml-2">
              <span>Difficulty:</span>
            </div>
            <select
              value={selectedDifficulty}
              onChange={e => {
                setSelectedDifficulty(e.target.value);
                setActiveQuestionIdx(0);
                setHasSubmitted(false);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-purple-300 font-medium cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="GATE-Level">GATE-Level</option>
              <option value="GATE-Trap">GATE-Trap</option>
            </select>
          </div>

          <div className="text-slate-400">
            Question {activeQuestionIdx + 1} of {filteredQuestions.length}
          </div>
        </div>
      )}

      {/* Main Question Card */}
      {currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question & Options Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 shadow-2xl">
              {/* Question Meta Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                    {currentQ.type}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      currentQ.difficulty === 'GATE-Trap'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : currentQ.difficulty === 'GATE-Level'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {currentQ.topic}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{timeSpent}s</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm text-slate-100 font-sans leading-relaxed font-medium">
                <p>{currentQ.questionText}</p>
                {currentQ.questionLatex && (
                  <div className="my-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-cyan-300 text-center font-mono">
                    <MathDisplay math={currentQ.questionLatex} block />
                  </div>
                )}
              </div>

              {/* Options / NAT Input */}
              {currentQ.type === 'NAT' ? (
                <div className="space-y-2 max-w-xs">
                  <label className="block text-xs font-mono text-slate-400">
                    Numerical Answer (Type integer or float):
                  </label>
                  <input
                    type="number"
                    value={userNatInput}
                    onChange={e => setUserNatInput(e.target.value)}
                    disabled={hasSubmitted}
                    placeholder="Enter value..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentQ.options?.map(opt => {
                    const isSelected = userSelectedOptions.includes(opt.id);
                    const isCorrectOption = currentQ.correctAnswers.includes(opt.id);

                    let borderStyle = 'border-slate-800 hover:border-slate-700';
                    let bgStyle = 'bg-slate-900/60';

                    if (hasSubmitted) {
                      if (isCorrectOption) {
                        borderStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                      } else if (isSelected && !isCorrectOption) {
                        borderStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                      }
                    } else if (isSelected) {
                      borderStyle = 'border-cyan-500 bg-cyan-500/15 text-cyan-200';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionToggle(opt.id)}
                        className={`p-3.5 rounded-xl border ${borderStyle} ${bgStyle} flex items-start gap-3 cursor-pointer transition-all`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                            isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <div className="text-xs text-slate-200 font-sans leading-relaxed flex-1">
                          {opt.text}
                          {opt.latex && <MathDisplay math={opt.latex} className="ml-2" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit & Next Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitPractice}
                    disabled={userSelectedOptions.length === 0 && userNatInput === ''}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all shadow cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {hasSubmitted && (
                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    {isCurrentCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Instant Explanations, Traps & Tips */}
          <div className="space-y-4">
            {hasSubmitted ? (
              <>
                <ExplanationCard
                  title={`Solution & Reasoning (${currentQ.conceptTested})`}
                  beginnerText={currentQ.beginnerExplanation || currentQ.explanation}
                  mathText={currentQ.explanation}
                  examShortcutText={currentQ.examShortcut || currentQ.examTip}
                  trapAlert={currentQ.gateTrapAlert}
                />

                {currentQ.whyOtherWrong && (
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-mono font-bold text-rose-300">
                      Why Other Options Are Wrong:
                    </span>
                    <div className="space-y-1.5 text-slate-300">
                      {Object.entries(currentQ.whyOtherWrong).map(([optKey, reason]) => (
                        <div key={optKey} className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                          <span className="font-mono font-bold text-rose-400">{optKey}: </span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3 shadow-xl">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
                <h4 className="text-xs font-mono font-bold text-slate-200">
                  Submit to Reveal GATE Trap & Detailed Solution
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  KleeneForge will analyze your answer, detect conceptual misconceptions, explain why each distracter option is incorrect, and provide exam shortcuts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
