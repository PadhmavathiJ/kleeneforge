import { describe, it, expect } from 'vitest';
import { minimizeDFA } from '../core/minimization';
import { simulateAutomaton, generateTestStrings } from '../core/simulation';
import { AUTOMATON_PRESETS } from '../core/presets';

describe('DFA Minimization (Partition Refinement / Hopcroft)', () => {
  const textbookDfa = AUTOMATON_PRESETS.find(p => p.id === 'dfa_minimization_textbook')!.automaton;

  it('should reduce 6-state textbook DFA to minimal 4 states', () => {
    const minResult = minimizeDFA(textbookDfa);
    expect(minResult.originalDfa.states.length).toBe(6);
    expect(minResult.minimalDfa.states.length).toBe(4);

    // Verify language equivalence on batch test strings
    const testStrings = generateTestStrings(['0', '1'], 5, 40);
    for (const str of testStrings) {
      const orig = simulateAutomaton(textbookDfa, str).accepted;
      const min = simulateAutomaton(minResult.minimalDfa, str).accepted;
      expect(min).toBe(orig);
    }
  });

  const dfa01 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_ends_with_01')!.automaton;

  it('should preserve minimal DFA when already minimal', () => {
    const minResult = minimizeDFA(dfa01);
    expect(minResult.minimalDfa.states.length).toBe(3);
  });

  it('emits deterministic, algorithm-backed visual steps', () => {
    const phases = minimizeDFA(textbookDfa).steps.map(step => step.phase);
    expect(phases).toContain('REACHABILITY');
    expect(phases).toContain('INITIAL_PARTITION');
    expect(phases).toContain('CHECK_TRANSITION');
    expect(phases).toContain('MERGE');
    expect(phases).toContain('BUILD_TRANSITION');
    expect(phases).toContain('VERIFY');
  });
});
