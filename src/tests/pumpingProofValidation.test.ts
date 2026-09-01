import { describe, expect, it } from 'vitest';
import { checkPumpingProof } from '../core/pumping/proofChecker';

describe('Pumping Lemma proof validation', () => {
  it('rejects decompositions that do not reconstruct w or violate the pumping constraints', () => {
    const result = checkPumpingProof({ languageId: 'an_bn', p: 3, w: 'aaabbb', x: 'aa', y: '', z: 'abbb', i: 0 });
    expect(result.isValid).toBe(false);
    expect(result.verdict).toBe('INVALID_DECOMPOSITION');
  });

  it('accepts a valid adversarial case without presenting it as a full proof', () => {
    const result = checkPumpingProof({ languageId: 'an_bn', p: 3, w: 'aaabbb', x: 'a', y: 'aa', z: 'bbb', i: 0 });
    expect(result.isValid).toBe(true);
    expect(result.verdict).toBe('CONTRADICTION_PROVED');
    expect(result.explanation).toContain('not a complete non-regularity proof');
  });

  it('reports when a chosen pump value fails to create a contradiction', () => {
    const result = checkPumpingProof({ languageId: 'an_bn', p: 3, w: 'aaabbb', x: '', y: 'a', z: 'aabbb', i: 1 });
    expect(result.isValid).toBe(false);
    expect(result.verdict).toBe('STRING_STILL_IN_LANGUAGE');
  });
});
