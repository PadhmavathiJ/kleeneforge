import { Automaton, GNFAResult, GNFAStep } from '../types';
import { isEpsilon } from '../epsilonClosure';
import { simplifyRegex, formatRegexToLatex } from './simplifier';

/**
 * Converts any DFA, NFA, or e-NFA to an equivalent Regular Expression using the GNFA (State Elimination) Method.
 */
export function convertAutomatonToRegex(automaton: Automaton): GNFAResult {
  const steps: GNFAStep[] = [];
  const startGNFA = 'q_start';
  const acceptGNFA = 'q_accept';

  // 1. Initial State Matrix
  const states = [startGNFA, ...automaton.states, acceptGNFA];
  const matrix: Record<string, Record<string, string>> = {};

  for (const u of states) {
    matrix[u] = {};
    for (const v of states) {
      matrix[u][v] = '�';
    }
  }

  // Add transition from q_start to original startState on e
  matrix[startGNFA][automaton.startState] = 'e';

  // Add transitions from original accept states to q_accept on e
  for (const acc of automaton.acceptStates) {
    matrix[acc][acceptGNFA] = 'e';
  }

  // Populate original transitions into matrix
  for (const t of automaton.transitions) {
    const sym = isEpsilon(t.symbol) ? 'e' : t.symbol;
    const currentVal = matrix[t.from][t.to];
    if (currentVal === '�') {
      matrix[t.from][t.to] = sym;
    } else {
      matrix[t.from][t.to] = `${currentVal}|${sym}`;
    }
  }

  // Helper to format a subexpression with parens if needed
  const wrapIfNeeded = (expr: string): string => {
    const s = expr.trim();
    if (s.length === 1 || s === 'e' || s === '�') return s;
    if (s.startsWith('(') && s.endsWith(')')) return s;
    return `(${s})`;
  };

  // Intermediate states to eliminate in sequence
  const ripStates = [...automaton.states];
  let remainingStates = [...states];
  let stepIdx = 0;

  for (const rip of ripStates) {
    stepIdx++;
    const prevMatrixSnapshot: Record<string, Record<string, string>> = {};
    for (const u of remainingStates) {
      prevMatrixSnapshot[u] = { ...matrix[u] };
    }

    const R_rip_rip = matrix[rip][rip];
    const starPart = R_rip_rip !== '�' && R_rip_rip !== 'e'
      ? `${wrapIfNeeded(R_rip_rip)}*`
      : '';

    const newRemaining = remainingStates.filter(s => s !== rip);
    const formulaLogs: string[] = [];

    for (const qi of newRemaining) {
      for (const qj of newRemaining) {
        if (qi === acceptGNFA || qj === startGNFA) continue;

        const R_ij = matrix[qi][qj];
        const R_i_rip = matrix[qi][rip];
        const R_rip_j = matrix[rip][qj];

        if (R_i_rip === '�' || R_rip_j === '�') {
          // No path through rip state
          continue;
        }

        // Formula: R_new = R_ij | R_i_rip (R_rip_rip)* R_rip_j
        let detour = '';
        if (R_i_rip === 'e' && R_rip_j === 'e' && !starPart) {
          detour = 'e';
        } else {
          const part1 = R_i_rip === 'e' ? '' : wrapIfNeeded(R_i_rip);
          const part2 = starPart;
          const part3 = R_rip_j === 'e' ? '' : wrapIfNeeded(R_rip_j);
          detour = `${part1}${part2}${part3}` || 'e';
        }

        let combined = '';
        if (R_ij === '�') {
          combined = detour;
        } else if (detour === '�') {
          combined = R_ij;
        } else {
          combined = `${wrapIfNeeded(R_ij)}|${wrapIfNeeded(detour)}`;
        }

        const simplified = simplifyRegex(combined);
        matrix[qi][qj] = simplified;
        formulaLogs.push(`R(${qi}, ${qj}) = ${R_ij} | ${R_i_rip}(${R_rip_rip})*${R_rip_j} -> ${simplified}`);
      }
    }

    remainingStates = newRemaining;

    steps.push({
      stepIndex: stepIdx,
      eliminatedState: rip,
      intermediateRegexes: prevMatrixSnapshot,
      formulaApplied: `Eliminated state '${rip}'. Applied R_ij(new) = R_ij ? R_i,k(R_k,k)*R_k,j`,
      explanation: `State '${rip}' eliminated. Updated direct transition regular expressions between all predecessor and successor states:\n${formulaLogs.slice(0, 5).join('\n')}${formulaLogs.length > 5 ? `\n...and ${formulaLogs.length - 5} more updates.` : ''}`,
    });
  }

  const rawResult = matrix[startGNFA][acceptGNFA] || '�';
  const simplified = simplifyRegex(rawResult);
  const latex = formatRegexToLatex(simplified);

  return {
    rawRegex: rawResult,
    simplifiedRegex: simplified,
    latexRegex: latex,
    steps,
  };
}
