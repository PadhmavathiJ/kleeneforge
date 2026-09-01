export interface ProofCheckInput {
  languageId: string;
  p: number;
  w: string;
  x: string;
  y: string;
  z: string;
  i: number;
}

export interface ProofCheckOutput {
  isValid: boolean;
  pumpedString: string;
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  verdict: 'CONTRADICTION_PROVED' | 'INVALID_DECOMPOSITION' | 'STRING_STILL_IN_LANGUAGE' | 'INVALID_INPUT';
  explanation: string;
}

/**
 * Validates language membership for classic non-regular languages.
 */
export function isStringInLanguage(languageId: string, str: string): boolean {
  switch (languageId) {
    case 'an_bn': {
      const match = str.match(/^(a*)(b*)$/);
      if (!match) return false;
      return match[1].length === match[2].length;
    }
    case 'an_bn_cn': {
      const match = str.match(/^(a*)(b*)(c*)$/);
      if (!match) return false;
      return match[1].length === match[2].length && match[2].length === match[3].length;
    }
    case '0n_1n': {
      const match = str.match(/^(0*)(1*)$/);
      if (!match) return false;
      return match[1].length === match[2].length;
    }
    case 'ww_repeat': {
      if (str.length % 2 !== 0) return false;
      const half = str.length / 2;
      return str.slice(0, half) === str.slice(half);
    }
    case 'prime_powers': {
      if (!/^1+$/.test(str)) return false;
      const len = str.length;
      if (len <= 1) return false;
      for (let d = 2; d * d <= len; d++) {
        if (len % d === 0) return false;
      }
      return true;
    }
    default:
      return false;
  }
}

/**
 * Deterministic Proof Checker for the Pumping Lemma for Regular Languages.
 */
export function checkPumpingProof(input: ProofCheckInput): ProofCheckOutput {
  const checks: ProofCheckOutput['checks'] = [];
  const { p, w, x, y, z, i, languageId } = input;

  // 1. Check w in L
  const wInL = isStringInLanguage(languageId, w);
  checks.push({
    name: 'Condition 0: w ? L',
    passed: wInL,
    details: wInL
      ? `Original string "${w}" belongs to language ${languageId}.`
      : `Error: Original string "${w}" does NOT belong to language ${languageId}. You must choose w ? L.`,
  });

  // 2. Check |w| >= p
  const lenWGeP = w.length >= p;
  checks.push({
    name: 'Condition 1: |w| = p',
    passed: lenWGeP,
    details: lenWGeP
      ? `Length |w| = ${w.length} is = pumping length p = ${p}.`
      : `Error: |w| = ${w.length} is strictly less than pumping length p = ${p}.`,
  });

  // 3. Check w = xyz
  const reconstructed = x + y + z;
  const wEqualsXYZ = reconstructed === w;
  checks.push({
    name: 'Condition 2: w = xyz',
    passed: wEqualsXYZ,
    details: wEqualsXYZ
      ? `x("${x}") + y("${y}") + z("${z}") exactly reconstructs w("${w}").`
      : `Error: x("${x}") + y("${y}") + z("${z}") = "${reconstructed}" ? "${w}".`,
  });

  // 4. Check |xy| <= p
  const xyLen = x.length + y.length;
  const xyLeP = xyLen <= p;
  checks.push({
    name: 'Condition 3: |xy| = p',
    passed: xyLeP,
    details: xyLeP
      ? `|xy| = ${xyLen} is = p = ${p}.`
      : `Error: |xy| = ${xyLen} exceeds pumping length p = ${p}. In the Pumping Lemma, the adversary guarantees y is within the first p characters.`,
  });

  // 5. Check |y| >= 1
  const yGeOne = y.length >= 1;
  checks.push({
    name: 'Condition 4: |y| = 1',
    passed: yGeOne,
    details: yGeOne
      ? `|y| = ${y.length} is = 1 (non-empty string).`
      : `Error: |y| cannot be empty (|y| = 1 required).`,
  });

  // Compute pumped string w_i = x y^i z
  const yPumped = y.repeat(Math.max(0, i));
  const pumpedString = x + yPumped + z;

  // Check if pumped string is in L
  const pumpedInL = isStringInLanguage(languageId, pumpedString);
  checks.push({
    name: `Condition 5: Pumped String xy^${i}z ? L`,
    passed: !pumpedInL,
    details: !pumpedInL
      ? `Pumped string "${pumpedString}" leaves the language (xy^${i}z ? L). Contradiction achieved!`
      : `Warning: Pumped string "${pumpedString}" is STILL in L. Pumping with i = ${i} failed to force a contradiction for this decomposition.`,
  });

  const allDecompValid = wInL && lenWGeP && wEqualsXYZ && xyLeP && yGeOne;

  if (!allDecompValid) {
    return {
      isValid: false,
      pumpedString,
      checks,
      verdict: 'INVALID_DECOMPOSITION',
      explanation: 'The chosen decomposition violates one or more fundamental premises of the Pumping Lemma.',
    };
  }

  if (!pumpedInL) {
    return {
      isValid: true,
      pumpedString,
      checks,
      verdict: 'CONTRADICTION_PROVED',
      explanation: `Valid contradiction for this decomposition: xy^${i}z = "${pumpedString}" is not in L. This is one required case, not a complete non-regularity proof by itself: a full pumping-lemma proof must defeat every decomposition satisfying |xy| <= p and |y| >= 1.`,
    };
  }

  return {
    isValid: false,
    pumpedString,
    checks,
    verdict: 'STRING_STILL_IN_LANGUAGE',
    explanation: `The decomposition satisfies Pumping Lemma constraints, but pumping with i = ${i} yields "${pumpedString}" which is still inside the language. Try pumping with i = 0 (pumping down) or i = 2 (pumping up).`,
  };
}
