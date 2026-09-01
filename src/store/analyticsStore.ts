import { useState, useEffect } from 'react';
import { MistakeRecord, StudentAnalytics } from '../core/types';

const STORAGE_KEY_ANALYTICS = 'kleeneforge_analytics_v1';
const STORAGE_KEY_MISTAKES = 'kleeneforge_mistakes_v1';

const DEFAULT_ANALYTICS: StudentAnalytics = {
  topicMastery: {
    'Deterministic Finite Automata (DFA)': 85,
    'Non-Deterministic Finite Automata (NFA)': 78,
    'DFA Minimization': 82,
    'Regular Expressions': 70,
    'Pumping Lemma for Regular Languages': 45,
    'Lexical Analysis using Finite Automata': 90,
    'Equivalence of finite automata': 75,
  },
  questionsAttempted: 14,
  questionsCorrect: 11,
  totalTimeSeconds: 1420,
  history: [
    {
      timestamp: Date.now() - 3600000 * 24,
      questionId: 'gate_dfa_01',
      correct: true,
      topic: 'Deterministic Finite Automata (DFA)',
      timeSpentSeconds: 45,
    },
    {
      timestamp: Date.now() - 3600000 * 12,
      questionId: 'gate_pumping_04',
      correct: false,
      topic: 'Pumping Lemma for Regular Languages',
      timeSpentSeconds: 90,
    },
  ],
};

const DEFAULT_MISTAKES: MistakeRecord[] = [
  {
    id: 'mistake_01',
    timestamp: Date.now() - 3600000 * 12,
    questionId: 'gate_pumping_04',
    topic: 'Pumping Lemma for Regular Languages',
    questionSummary: 'Quantifier direction and necessary vs sufficient conditions in Pumping Lemma.',
    userMistake: 'Assumed satisfying the pumping lemma property proves a language is regular.',
    correctReasoning: 'The Pumping Lemma is only a necessary condition for regularity. It can only be used in the contrapositive to disprove regularity.',
    trapType: 'Pumping Lemma Quantifier & Sufficiency Fallacy',
    counterexample: 'Language L = {a^i b^j c^j} ? {b^j c^k} satisfies pumping conditions but is non-regular.',
  },
  {
    id: 'mistake_02',
    timestamp: Date.now() - 3600000 * 48,
    questionId: 'gate_min_02',
    topic: 'DFA Minimization',
    questionSummary: 'State count in complement of minimal DFA.',
    userMistake: 'Thought complementing a DFA requires subset construction with 2^n states.',
    correctReasoning: 'For a complete DFA, complement is obtained by simply swapping accept and non-accept states. State count remains identical.',
    trapType: 'NFA vs DFA Complement Confusion',
  },
];

function loadStoredAnalytics(): StudentAnalytics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    return raw ? JSON.parse(raw) : DEFAULT_ANALYTICS;
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

function loadStoredMistakes(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    return raw ? JSON.parse(raw) : DEFAULT_MISTAKES;
  } catch {
    return DEFAULT_MISTAKES;
  }
}

let analyticsState = loadStoredAnalytics();
let mistakesState = loadStoredMistakes();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
  try {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(analyticsState));
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakesState));
  } catch {
    // ignore in sandboxed environments
  }
}

export function useAnalyticsStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const recordQuestionAttempt = (
    topic: string,
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds: number,
    mistakeContext?: {
      userMistake: string;
      correctReasoning: string;
      trapType: string;
      counterexample?: string;
      summary: string;
    }
  ) => {
    const currentMastery = analyticsState.topicMastery[topic] ?? 50;
    const delta = isCorrect ? 6 : -8;
    const newMastery = Math.max(0, Math.min(100, currentMastery + delta));

    analyticsState = {
      ...analyticsState,
      topicMastery: {
        ...analyticsState.topicMastery,
        [topic]: newMastery,
      },
      questionsAttempted: analyticsState.questionsAttempted + 1,
      questionsCorrect: analyticsState.questionsCorrect + (isCorrect ? 1 : 0),
      totalTimeSeconds: analyticsState.totalTimeSeconds + timeSpentSeconds,
      history: [
        {
          timestamp: Date.now(),
          questionId,
          correct: isCorrect,
          topic,
          timeSpentSeconds,
        },
        ...analyticsState.history,
      ],
    };

    if (!isCorrect && mistakeContext) {
      const newMistake: MistakeRecord = {
        id: `mistake_${Date.now()}`,
        timestamp: Date.now(),
        questionId,
        topic,
        questionSummary: mistakeContext.summary,
        userMistake: mistakeContext.userMistake,
        correctReasoning: mistakeContext.correctReasoning,
        trapType: mistakeContext.trapType,
        counterexample: mistakeContext.counterexample,
      };
      mistakesState = [newMistake, ...mistakesState];
    }

    notify();
  };

  const removeMistake = (id: string) => {
    mistakesState = mistakesState.filter(m => m.id !== id);
    notify();
  };

  return {
    analytics: analyticsState,
    mistakes: mistakesState,
    recordQuestionAttempt,
    removeMistake,
  };
}
