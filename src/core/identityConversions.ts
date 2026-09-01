import type { Automaton } from './types';

/**
 * A DFA is a special case of an NFA: every transition relation contains
 * exactly one destination. The structure is copied unchanged; only its type
 * is widened so downstream NFA tools can consume it.
 */
export function convertDfaToNfa(dfa: Automaton): Automaton {
  if (dfa.type !== 'DFA') throw new Error('DFA to NFA conversion requires a DFA input.');
  return {
    ...dfa,
    type: 'NFA',
    states: [...dfa.states],
    alphabet: [...dfa.alphabet],
    acceptStates: [...dfa.acceptStates],
    transitions: dfa.transitions.map(transition => ({ ...transition })),
    description: 'NFA obtained by identity conversion from a DFA; each transition has one destination.',
  };
}
