import { describe, it, expect } from 'vitest';
import { checkPumpingProof, isStringInLanguage } from '../core/pumping/proofChecker';

describe('Pumping Lemma Verifier & Proof Checker', () => {
  it('should verify membership for an_bn', () => {
    expect(isStringInLanguage('an_bn', 'aabb')).toBe(true);
    expect(isStringInLanguage('an_bn', 'aaabbb')).toBe(true);
    expect(isStringInLanguage('an_bn', 'aab')).toBe(false);
    expect(isStringInLanguage('an_bn', 'ba')).toBe(false);
  });

  it('should accept valid contradiction proof on an_bn', () => {
    const res = checkPumpingProof({
      languageId: 'an_bn',
      p: 3,
      w: 'aaabbb',
      x: 'a',
      y: 'aa',
      z: 'bbb',
      i: 0,
    });

    expect(res.isValid).toBe(true);
    expect(res.verdict).toBe('CONTRADICTION_PROVED');
    expect(res.pumpedString).toBe('abbb');
  });

  it('should reject invalid decomposition where |xy| > p', () => {
    const res = checkPumpingProof({
      languageId: 'an_bn',
      p: 3,
      w: 'aaabbb',
      x: 'aaa',
      y: 'b',
      z: 'bb',
      i: 0,
    });

    expect(res.isValid).toBe(false);
    expect(res.verdict).toBe('INVALID_DECOMPOSITION');
  });
});
