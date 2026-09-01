import { useState, useEffect } from 'react';
import { Automaton, AutomatonType, Transition } from '../core/types';
import { AUTOMATON_PRESETS } from '../core/presets';

export type AppView =
  | 'HERO'
  | 'MODE_SELECT'
  | 'CONVERT'
  | 'MINIMIZE'
  | 'PUMPING'
  | 'REGEX_LAB'
  | 'BUILDER'
  | 'GATE_ARENA'
  | 'LEXICAL_LAB'
  | 'AI_TUTOR'
  | 'LANGUAGE_LAB'
  | 'CHECK_ANSWER'
  | 'EQUIVALENCE'
  | 'MISTAKES'
  | 'ANALYTICS'
  | 'EXPERIMENTS'
  | 'FLASH_REVIEW';

export type UserProficiency = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AppState {
  currentView: AppView;
  userLevel: UserProficiency;
  currentAutomaton: Automaton;
  secondaryAutomaton?: Automaton;
  targetConversionType: string;
  activePresetId: string;
  pipelineStep: 'QUESTION' | 'UNDERSTAND' | 'BUILD' | 'CONVERT' | 'VERIFY' | 'EXPLAIN' | 'PRACTICE';
  explanationMode: 'beginner' | 'mathematical' | 'exam_shortcut';
}

const DEFAULT_AUTOMATON: Automaton = AUTOMATON_PRESETS[0].automaton;

// Global singleton state for lightweight React state sync
let state: AppState = {
  currentView: 'HERO',
  userLevel: 'Intermediate',
  currentAutomaton: JSON.parse(JSON.stringify(DEFAULT_AUTOMATON)),
  secondaryAutomaton: JSON.parse(JSON.stringify(AUTOMATON_PRESETS[1].automaton)),
  targetConversionType: 'DFA',
  activePresetId: 'dfa_ends_with_01',
  pipelineStep: 'CONVERT',
  explanationMode: 'beginner',
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

export function useAppStore(): [AppState, {
  setView: (view: AppView) => void;
  setUserLevel: (level: UserProficiency) => void;
  setAutomaton: (aut: Automaton) => void;
  setSecondaryAutomaton: (aut: Automaton) => void;
  loadPreset: (presetId: string) => void;
  setTargetConversionType: (type: string) => void;
  setPipelineStep: (step: AppState['pipelineStep']) => void;
  setExplanationMode: (mode: AppState['explanationMode']) => void;
  updateStates: (states: string[]) => void;
  updateTransitions: (transitions: Transition[]) => void;
  setStartState: (s: string) => void;
  setAcceptStates: (accepts: string[]) => void;
}] {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const actions = {
    setView: (view: AppView) => {
      state = { ...state, currentView: view };
      notify();
    },
    setUserLevel: (level: UserProficiency) => {
      state = { ...state, userLevel: level };
      notify();
    },
    setAutomaton: (aut: Automaton) => {
      state = { ...state, currentAutomaton: aut };
      notify();
    },
    setSecondaryAutomaton: (aut: Automaton) => {
      state = { ...state, secondaryAutomaton: aut };
      notify();
    },
    loadPreset: (presetId: string) => {
      const p = AUTOMATON_PRESETS.find(pr => pr.id === presetId);
      if (p) {
        state = {
          ...state,
          activePresetId: presetId,
          currentAutomaton: JSON.parse(JSON.stringify(p.automaton)),
        };
        notify();
      }
    },
    setTargetConversionType: (type: string) => {
      state = { ...state, targetConversionType: type };
      notify();
    },
    setPipelineStep: (step: AppState['pipelineStep']) => {
      state = { ...state, pipelineStep: step };
      notify();
    },
    setExplanationMode: (mode: AppState['explanationMode']) => {
      state = { ...state, explanationMode: mode };
      notify();
    },
    updateStates: (states: string[]) => {
      state = {
        ...state,
        currentAutomaton: { ...state.currentAutomaton, states },
      };
      notify();
    },
    updateTransitions: (transitions: Transition[]) => {
      state = {
        ...state,
        currentAutomaton: { ...state.currentAutomaton, transitions },
      };
      notify();
    },
    setStartState: (s: string) => {
      state = {
        ...state,
        currentAutomaton: { ...state.currentAutomaton, startState: s },
      };
      notify();
    },
    setAcceptStates: (accepts: string[]) => {
      state = {
        ...state,
        currentAutomaton: { ...state.currentAutomaton, acceptStates: accepts },
      };
      notify();
    },
  };

  return [state, actions];
}
