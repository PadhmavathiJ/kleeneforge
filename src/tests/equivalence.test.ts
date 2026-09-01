import { describe, it, expect } from 'vitest';
import { checkAutomataEquivalence, checkStudentAnswer } from '../core/equivalence';
import { AUTOMATON_PRESETS } from '../core/presets';
import { minimizeDFA } from '../core/minimization';

describe('Automata Equivalence & Shortest Counterexample BFS', () => {
  const dfa6 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_minimization_textbook')!.automaton;
  const dfa4 = minimizeDFA(dfa6).minimalDfa;

  it('should prove equivalent automata recognize the same language', () => {
    const eq = checkAutomataEquivalence(dfa6, dfa4);
    expect(eq.areEquivalent).toBe(true);
    expect(eq.shortestCounterexample).toBeUndefined();
  });

  const dfa01 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_ends_with_01')!.automaton;
  const dfaMod3 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_divisible_by_3')!.automaton;

  it('should identify non-equivalent automata and find shortest counterexample', () => {
    const eq = checkAutomataEquivalence(dfa01, dfaMod3);
    expect(eq.areEquivalent).toBe(false);
    expect(eq.shortestCounterexample).toBeDefined();
  });

  it('should provide actionable feedback on student mistakes', () => {
    const feedback = checkStudentAnswer(dfaMod3, dfa01);
    expect(feedback.isCorrect).toBe(false);
    expect(feedback.counterexample).toBeDefined();
  });
});
