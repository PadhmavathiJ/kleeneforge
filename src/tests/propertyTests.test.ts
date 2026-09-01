import { describe, it, expect } from 'vitest';
import { parseRegex } from '../core/regex/parser';
import { regexToENFA } from '../core/regex/thompson';
import { convertNfaToDfa } from '../core/subsetConstruction';
import { minimizeDFA } from '../core/minimization';
import { convertAutomatonToRegex } from '../core/regex/gnfa';
import { checkAutomataEquivalence } from '../core/equivalence';
import { simulateAutomaton, generateTestStrings } from '../core/simulation';

describe('Property-Based & Pipeline Round-Trip Verification', () => {
  const patterns = [
    '0*1*',
    '(0|1)*01',
    '(a|b)*abb',
    'a(a|b)*b',
    '(00|11)*',
    '1(0|1)*0',
  ];

  for (const pat of patterns) {
    it(`should preserve language equivalence across full pipeline for regex: ${pat}`, () => {
      // 1. Regex -> e-NFA (Thompson)
      const thompsonRes = regexToENFA(pat);
      const enfa = thompsonRes.automaton;

      // 2. e-NFA -> DFA (Subset Construction)
      const subsetRes = convertNfaToDfa(enfa);
      const dfa = subsetRes.dfa;

      // 3. DFA -> Minimal DFA (Partition Refinement)
      const minRes = minimizeDFA(dfa);
      const minDfa = minRes.minimalDfa;

      // Check equivalence between e-NFA and DFA
      const eq1 = checkAutomataEquivalence(enfa, dfa);
      expect(eq1.areEquivalent).toBe(true);

      // Check equivalence between DFA and Minimal DFA
      const eq2 = checkAutomataEquivalence(dfa, minDfa);
      expect(eq2.areEquivalent).toBe(true);

      // Verify minimal DFA has <= states than original DFA
      expect(minDfa.states.length).toBeLessThanOrEqual(dfa.states.length);

      // Batch verify string acceptance
      const alphabet = dfa.alphabet.length > 0 ? dfa.alphabet : ['0', '1'];
      const testStrings = generateTestStrings(alphabet, 4, 30);

      for (const str of testStrings) {
        const enfaVerdict = simulateAutomaton(enfa, str).accepted;
        const dfaVerdict = simulateAutomaton(dfa, str).accepted;
        const minVerdict = simulateAutomaton(minDfa, str).accepted;

        expect(dfaVerdict).toBe(enfaVerdict);
        expect(minVerdict).toBe(dfaVerdict);
      }
    });
  }
});
