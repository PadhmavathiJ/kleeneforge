import { Automaton } from './types';

export interface AutomatonPreset {
  id: string;
  name: string;
  category: 'DFA' | 'NFA' | 'ENFA' | 'MINIMIZATION' | 'GATE';
  description: string;
  automaton: Automaton;
  referenceRegex?: string;
  sampleAccepted: string[];
  sampleRejected: string[];
}

export const AUTOMATON_PRESETS: AutomatonPreset[] = [
  {
    id: 'dfa_ends_with_01',
    name: 'DFA: Strings ending in 01',
    category: 'DFA',
    description: 'Accepts all binary strings that terminate with the sequence 01 (Regex: (0|1)*01).',
    referenceRegex: '(0|1)*01',
    sampleAccepted: ['01', '001', '101', '11001', '0101'],
    sampleRejected: ['', '0', '1', '00', '10', '110', '010'],
    automaton: {
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
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q0', symbol: '1' },
      ],
    },
  },
  {
    id: 'dfa_divisible_by_3',
    name: 'DFA: Binary numbers mod 3 == 0',
    category: 'DFA',
    description: 'Processes binary strings MSB-first and accepts if the represented integer is divisible by 3.',
    referenceRegex: '(0|1(01*0)*1)*',
    sampleAccepted: ['0', '11', '110', '1001', '1100', '1111'],
    sampleRejected: ['1', '10', '100', '101', '111', '1010'],
    automaton: {
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
    },
  },
  {
    id: 'dfa_minimization_textbook',
    name: 'DFA: Classic 6-State Minimization',
    category: 'MINIMIZATION',
    description: 'A 6-state textbook DFA with two pairs of equivalent states ({q0,q1} and {q2,q3}) that reduces to 4 states.',
    sampleAccepted: ['1', '01', '10', '010', '100'],
    sampleRejected: ['', '0', '00', '11', '011'],
    automaton: {
      type: 'DFA',
      states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q2', 'q3', 'q4'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q2', symbol: '1' },
        { from: 'q1', to: 'q0', symbol: '0' },
        { from: 'q1', to: 'q3', symbol: '1' },
        { from: 'q2', to: 'q4', symbol: '0' },
        { from: 'q2', to: 'q5', symbol: '1' },
        { from: 'q3', to: 'q4', symbol: '0' },
        { from: 'q3', to: 'q5', symbol: '1' },
        { from: 'q4', to: 'q4', symbol: '0' },
        { from: 'q4', to: 'q4', symbol: '1' },
        { from: 'q5', to: 'q5', symbol: '0' },
        { from: 'q5', to: 'q5', symbol: '1' },
      ],
    },
  },
  {
    id: 'nfa_contains_010',
    name: 'NFA: Substring 010',
    category: 'NFA',
    description: 'Non-deterministic automaton that guesses when the substring 010 occurs.',
    referenceRegex: '(0|1)*010(0|1)*',
    sampleAccepted: ['010', '0010', '0101', '110100', '10101'],
    sampleRejected: ['', '0', '1', '01', '10', '100', '111'],
    automaton: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2', 'q3'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q3'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        { from: 'q2', to: 'q3', symbol: '0' },
        { from: 'q3', to: 'q3', symbol: '0' },
        { from: 'q3', to: 'q3', symbol: '1' },
      ],
    },
  },
  {
    id: 'nfa_2nd_from_end_is_1',
    name: 'NFA: 2nd symbol from end is 1',
    category: 'NFA',
    description: 'Accepts any binary string where the second-to-last symbol is 1. (Regex: (0|1)*1(0|1))',
    referenceRegex: '(0|1)*1(0|1)',
    sampleAccepted: ['10', '11', '010', '011', '1100', '00010'],
    sampleRejected: ['', '0', '1', '00', '01', '100', '101'],
    automaton: {
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', to: 'q0', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q0', to: 'q1', symbol: '1' },
        { from: 'q1', to: 'q2', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
      ],
    },
  },
  {
    id: 'enfa_a_star_or_b_star',
    name: 'e-NFA: a* | b*',
    category: 'ENFA',
    description: 'Uses spontaneous epsilon transitions to branch between a* and b*.',
    referenceRegex: 'a*|b*',
    sampleAccepted: ['', 'a', 'aa', 'aaa', 'b', 'bb', 'bbb'],
    sampleRejected: ['ab', 'ba', 'aab', 'bba', 'aba'],
    automaton: {
      type: 'ENFA',
      states: ['q0', 'q1', 'q2', 'q3', 'q4'],
      alphabet: ['a', 'b'],
      startState: 'q0',
      acceptStates: ['q3', 'q4'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: 'e' },
        { from: 'q0', to: 'q2', symbol: 'e' },
        { from: 'q1', to: 'q1', symbol: 'a' },
        { from: 'q1', to: 'q3', symbol: 'e' },
        { from: 'q2', to: 'q2', symbol: 'b' },
        { from: 'q2', to: 'q4', symbol: 'e' },
      ],
    },
  },
];
