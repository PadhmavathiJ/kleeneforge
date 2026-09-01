import { describe, it, expect } from 'vitest';
import { convertNfaToDfa } from '../core/subsetConstruction';
import { simulateAutomaton, generateTestStrings } from '../core/simulation';
import { AUTOMATON_PRESETS } from '../core/presets';

describe('Subset Construction (NFA / e-NFA ? DFA)', () => {
  const nfa2nd = AUTOMATON_PRESETS.find(p => p.id === 'nfa_2nd_from_end_is_1')!.automaton;

  it('should convert NFA to DFA and maintain language equivalence', () => {
    const res = convertNfaToDfa(nfa2nd);
    expect(res.dfa.type).toBe('DFA');
    expect(res.dfa.states.length).toBeGreaterThan(0);

    // Property-based test over all strings of length up to 5
    const testStrings = generateTestStrings(['0', '1'], 5, 50);
    for (const str of testStrings) {
      const nfaAccepts = simulateAutomaton(nfa2nd, str).accepted;
      const dfaAccepts = simulateAutomaton(res.dfa, str).accepted;
      expect(dfaAccepts).toBe(nfaAccepts);
    }
  });

  const enfaAorB = AUTOMATON_PRESETS.find(p => p.id === 'enfa_a_star_or_b_star')!.automaton;

  it('should convert e-NFA to DFA and preserve e-closure transitions', () => {
    const res = convertNfaToDfa(enfaAorB);
    expect(res.dfa.type).toBe('DFA');

    const testStrings = generateTestStrings(['a', 'b'], 4, 30);
    for (const str of testStrings) {
      const enfaAccepts = simulateAutomaton(enfaAorB, str).accepted;
      const dfaAccepts = simulateAutomaton(res.dfa, str).accepted;
      expect(dfaAccepts).toBe(enfaAccepts);
    }
  });
});
