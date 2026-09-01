import { describe, expect, it } from 'vitest';
import { computeEpsilonClosure, isEpsilon } from '../core/epsilonClosure';
import { checkAutomataEquivalence } from '../core/equivalence';
import { minimizeDFA } from '../core/minimization';
import { regexToENFA } from '../core/regex/thompson';
import { simulateAutomaton } from '../core/simulation';
import type { Automaton } from '../core/types';

describe('automata engine edge cases', () => {
  it('recognizes formal epsilon notation and terminates epsilon cycles', () => {
    const enfa: Automaton = { type: 'ENFA', states: ['q0', 'q1', 'q2'], alphabet: ['a'], startState: 'q0', acceptStates: ['q2'], transitions: [{ from: 'q0', to: 'q1', symbol: '\u03b5' }, { from: 'q1', to: 'q0', symbol: '\u03b5' }, { from: 'q1', to: 'q2', symbol: 'a' }] };
    expect(isEpsilon('\u03b5')).toBe(true);
    expect(computeEpsilonClosure(enfa, 'q0').closure).toEqual(['q0', 'q1']);
    expect(simulateAutomaton(enfa, '').accepted).toBe(false);
    expect(simulateAutomaton(enfa, 'a').accepted).toBe(true);
  });

  it('accepts when any branch reaches one of multiple NFA final states', () => {
    const nfa: Automaton = { type: 'NFA', states: ['q0', 'q1', 'q2'], alphabet: ['a'], startState: 'q0', acceptStates: ['q1', 'q2'], transitions: [{ from: 'q0', to: 'q1', symbol: 'a' }, { from: 'q0', to: 'q2', symbol: 'a' }, { from: 'q1', to: 'q1', symbol: 'a' }] };
    expect(simulateAutomaton(nfa, 'a').accepted).toBe(true);
    expect(simulateAutomaton(nfa, 'aa').accepted).toBe(true);
  });

  it('treats incomplete DFAs as using an implicit trap state', () => {
    const incomplete: Automaton = { type: 'DFA', states: ['q0'], alphabet: ['a'], startState: 'q0', acceptStates: [], transitions: [] };
    const explicitTrap: Automaton = { type: 'DFA', states: ['q0', 'sink'], alphabet: ['a'], startState: 'q0', acceptStates: [], transitions: [{ from: 'q0', to: 'sink', symbol: 'a' }, { from: 'sink', to: 'sink', symbol: 'a' }] };
    expect(simulateAutomaton(incomplete, 'aaaa').accepted).toBe(false);
    expect(checkAutomataEquivalence(incomplete, explicitTrap).areEquivalent).toBe(true);
    expect(minimizeDFA(incomplete).minimalDfa.states).toHaveLength(1);
  });

  it('removes unreachable self-loop states while preserving the language', () => {
    const dfa: Automaton = { type: 'DFA', states: ['q0', 'q1', 'unused'], alphabet: ['a'], startState: 'q0', acceptStates: ['q1'], transitions: [{ from: 'q0', to: 'q1', symbol: 'a' }, { from: 'q1', to: 'q1', symbol: 'a' }, { from: 'unused', to: 'unused', symbol: 'a' }] };
    const result = minimizeDFA(dfa);
    expect(result.unreachableRemoved).toContain('unused');
    expect(simulateAutomaton(result.minimalDfa, 'a').accepted).toBe(true);
    expect(simulateAutomaton(result.minimalDfa, '').accepted).toBe(false);
  });

  it('finds long shortest counterexamples without a depth cutoff', () => {
    const states = Array.from({ length: 15 }, (_, i) => `q${i}`);
    const acceptsExactlyThirteen: Automaton = { type: 'DFA', states, alphabet: ['a'], startState: 'q0', acceptStates: ['q13'], transitions: states.map((state, i) => ({ from: state, to: i < 14 ? `q${i + 1}` : 'q14', symbol: 'a' })) };
    const rejectsAll: Automaton = { type: 'DFA', states: ['r'], alphabet: ['a'], startState: 'r', acceptStates: [], transitions: [{ from: 'r', to: 'r', symbol: 'a' }] };
    const result = checkAutomataEquivalence(acceptsExactlyThirteen, rejectsAll);
    expect(result.areEquivalent).toBe(false);
    expect(result.shortestCounterexample).toBe('a'.repeat(13));
  });

  it('parses and constructs a Thompson epsilon fragment', () => {
    const result = regexToENFA('\u03b5');
    expect(simulateAutomaton(result.automaton, '').accepted).toBe(true);
    expect(simulateAutomaton(result.automaton, 'a').accepted).toBe(false);
  });
});
