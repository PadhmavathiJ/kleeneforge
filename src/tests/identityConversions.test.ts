import { describe, expect, it } from 'vitest';
import { convertDfaToNfa } from '../core/identityConversions';
import { checkAutomataEquivalence } from '../core/equivalence';
import { simulateAutomaton } from '../core/simulation';
import { AUTOMATON_PRESETS } from '../core/presets';

describe('DFA to NFA identity conversion', () => {
  it('copies the formal tuple and preserves language membership, including empty input', () => {
    const dfa = AUTOMATON_PRESETS.find(preset => preset.id === 'dfa_ends_with_01')!.automaton;
    const nfa = convertDfaToNfa(dfa);
    expect(nfa.type).toBe('NFA');
    expect(nfa.states).toEqual(dfa.states);
    expect(nfa.transitions).toEqual(dfa.transitions);
    expect(checkAutomataEquivalence(dfa, nfa).areEquivalent).toBe(true);
    for (const input of ['', '01', '101', '10']) {
      expect(simulateAutomaton(nfa, input).accepted).toBe(simulateAutomaton(dfa, input).accepted);
    }
  });
});
