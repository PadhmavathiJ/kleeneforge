import { describe, it, expect } from 'vitest';
import { simulateDFA, simulateNFA, simulateAutomaton, generateTestStrings } from '../core/simulation';
import { AUTOMATON_PRESETS } from '../core/presets';

describe('Deterministic Automata Simulation', () => {
  const dfa01 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_ends_with_01')!.automaton;

  it('should accept valid strings ending in 01 for DFA', () => {
    expect(simulateDFA(dfa01, '01').accepted).toBe(true);
    expect(simulateDFA(dfa01, '101').accepted).toBe(true);
    expect(simulateDFA(dfa01, '0001').accepted).toBe(true);
    expect(simulateDFA(dfa01, '11001').accepted).toBe(true);
  });

  it('should reject invalid strings for DFA', () => {
    expect(simulateDFA(dfa01, '').accepted).toBe(false);
    expect(simulateDFA(dfa01, '0').accepted).toBe(false);
    expect(simulateDFA(dfa01, '1').accepted).toBe(false);
    expect(simulateDFA(dfa01, '10').accepted).toBe(false);
    expect(simulateDFA(dfa01, '010').accepted).toBe(false);
  });

  const nfa2nd = AUTOMATON_PRESETS.find(p => p.id === 'nfa_2nd_from_end_is_1')!.automaton;

  it('should simulate NFA correctly with multiple branches', () => {
    expect(simulateNFA(nfa2nd, '10').accepted).toBe(true);
    expect(simulateNFA(nfa2nd, '11').accepted).toBe(true);
    expect(simulateNFA(nfa2nd, '010').accepted).toBe(true);
    expect(simulateNFA(nfa2nd, '011').accepted).toBe(true);
    expect(simulateNFA(nfa2nd, '00').accepted).toBe(false);
    expect(simulateNFA(nfa2nd, '01').accepted).toBe(false);
  });

  const enfaAorB = AUTOMATON_PRESETS.find(p => p.id === 'enfa_a_star_or_b_star')!.automaton;

  it('should simulate e-NFA correctly with epsilon closure', () => {
    expect(simulateAutomaton(enfaAorB, '').accepted).toBe(true);
    expect(simulateAutomaton(enfaAorB, 'a').accepted).toBe(true);
    expect(simulateAutomaton(enfaAorB, 'aaa').accepted).toBe(true);
    expect(simulateAutomaton(enfaAorB, 'b').accepted).toBe(true);
    expect(simulateAutomaton(enfaAorB, 'bbb').accepted).toBe(true);
    expect(simulateAutomaton(enfaAorB, 'ab').accepted).toBe(false);
    expect(simulateAutomaton(enfaAorB, 'ba').accepted).toBe(false);
  });

  it('should generate canonical test strings in shortlex order', () => {
    const strings = generateTestStrings(['0', '1'], 2, 10);
    expect(strings).toEqual(['', '0', '1', '00', '01', '10', '11']);
  });
});
