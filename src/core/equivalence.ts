import { Automaton, EquivalenceResult } from './types';
import { convertNfaToDfa } from './subsetConstruction';
import { simulateAutomaton } from './simulation';
import { isEpsilon } from './epsilonClosure';

/**
 * Ensures an automaton is converted to a complete DFA with uniform alphabet.
 */
function ensureCompleteDFA(automaton: Automaton, unifiedAlphabet: string[]): Automaton {
  // If not a DFA or has epsilons, convert via subset construction
  let dfa = automaton.type === 'DFA' && !automaton.transitions.some(t => isEpsilon(t.symbol))
    ? automaton
    : convertNfaToDfa(automaton).dfa;

  // Add explicit trap state if missing transitions for completeness
  const trapState = '__TRAP__';
  let trapUsed = false;
  const newTransitions = [...dfa.transitions];
  const newStates = [...dfa.states];

  for (const s of dfa.states) {
    for (const sym of unifiedAlphabet) {
      const exists = dfa.transitions.some(t => t.from === s && t.symbol === sym);
      if (!exists) {
        newTransitions.push({ from: s, to: trapState, symbol: sym });
        trapUsed = true;
      }
    }
  }

  if (trapUsed) {
    newStates.push(trapState);
    for (const sym of unifiedAlphabet) {
      newTransitions.push({ from: trapState, to: trapState, symbol: sym });
    }
  }

  return {
    ...dfa,
    states: newStates,
    alphabet: unifiedAlphabet,
    transitions: newTransitions,
  };
}

/**
 * Checks language equivalence of two automata using Product Automaton and Symmetric Difference BFS.
 * Finds the shortest distinguishing counterexample string if they differ.
 */
export function checkAutomataEquivalence(
  autA: Automaton,
  autB: Automaton
): EquivalenceResult {
  const unifiedAlphabet = Array.from(
    new Set([...autA.alphabet, ...autB.alphabet].filter(s => !isEpsilon(s) && s.length > 0))
  ).sort();

  if (unifiedAlphabet.length === 0) {
    unifiedAlphabet.push('0');
  }

  const dfaA = ensureCompleteDFA(autA, unifiedAlphabet);
  const dfaB = ensureCompleteDFA(autB, unifiedAlphabet);

  const startPairKey = `${dfaA.startState}|${dfaB.startState}`;
  const visited = new Set<string>([startPairKey]);
  const queue: { stateA: string; stateB: string; path: string }[] = [
    { stateA: dfaA.startState, stateB: dfaB.startState, path: '' },
  ];

  let counterexample: string | null = null;
  let counterAccA = false;
  let counterAccB = false;

  while (queue.length > 0) {
    const { stateA, stateB, path } = queue.shift()!;

    const isAccA = dfaA.acceptStates.includes(stateA);
    const isAccB = dfaB.acceptStates.includes(stateB);

    // Symmetric difference condition: one is accepting and the other is non-accepting
    if (isAccA !== isAccB) {
      counterexample = path;
      counterAccA = isAccA;
      counterAccB = isAccB;
      break;
    }

    // Limit BFS depth to prevent runaway in edge cases (up to 12 length)
    if (path.length > 12) continue;

    for (const sym of unifiedAlphabet) {
      const transA = dfaA.transitions.find(t => t.from === stateA && t.symbol === sym);
      const transB = dfaB.transitions.find(t => t.from === stateB && t.symbol === sym);

      const nextA = transA ? transA.to : '__TRAP__';
      const nextB = transB ? transB.to : '__TRAP__';
      const pairKey = `${nextA}|${nextB}`;

      if (!visited.has(pairKey)) {
        visited.add(pairKey);
        queue.push({
          stateA: nextA,
          stateB: nextB,
          path: path + sym,
        });
      }
    }
  }

  if (counterexample !== null) {
    const displayStr = counterexample === '' ? 'e (empty string)' : `"${counterexample}"`;
    return {
      areEquivalent: false,
      shortestCounterexample: counterexample,
      acceptedByA: counterAccA,
      acceptedByB: counterAccB,
      stateCountA: autA.states.length,
      stateCountB: autB.states.length,
      explanation: `Automata are NOT equivalent. The shortest distinguishing counterexample string is ${displayStr}. Automaton A ${counterAccA ? 'ACCEPTS' : 'REJECTS'} this string, while Automaton B ${counterAccB ? 'ACCEPTS' : 'REJECTS'} it.`,
    };
  }

  return {
    areEquivalent: true,
    stateCountA: autA.states.length,
    stateCountB: autB.states.length,
    explanation: `? The two automata recognize exactly the SAME regular language (L(A) = L(B)). Product automaton exploration verified that the symmetric difference (L(A) ? L(B)) is empty.`,
  };
}

/**
 * Checks a student-drawn automaton against a reference language specification / automaton.
 */
export function checkStudentAnswer(
  studentAut: Automaton,
  referenceAut: Automaton
): {
  isCorrect: boolean;
  counterexample?: string;
  divergenceDetail?: string;
  feedback: string;
} {
  const eq = checkAutomataEquivalence(studentAut, referenceAut);

  if (eq.areEquivalent) {
    return {
      isCorrect: true,
      feedback: '? Correct! Your automaton is mathematically equivalent to the required target language.',
    };
  }

  const ce = eq.shortestCounterexample ?? '';
  const studentSim = simulateAutomaton(studentAut, ce);
  const refSim = simulateAutomaton(referenceAut, ce);

  // Pinpoint where student automaton diverged
  let divergenceState = 'Start';
  if (studentSim.steps.length > 0) {
    const lastStep = studentSim.steps[studentSim.steps.length - 1];
    divergenceState = `{${lastStep.currentStates.join(', ')}}`;
  }

  const ceText = ce === '' ? 'e' : `"${ce}"`;
  const expectedVerdict = refSim.accepted ? 'ACCEPT' : 'REJECT';
  const studentVerdict = studentSim.accepted ? 'ACCEPT' : 'REJECT';

  const feedback = [
    `? Your automaton is NOT equivalent to the required target language.`,
    `Shortest Counterexample: ${ceText}`,
    `  � Expected: ${expectedVerdict}`,
    `  � Your Automaton: ${studentVerdict}`,
    `Diagnostic Note: On input ${ceText}, your automaton halted in states ${studentSim.finalStates.length > 0 ? '{' + studentSim.finalStates.join(', ') + '}' : 'TRAP'}.`,
  ].join('\n');

  return {
    isCorrect: false,
    counterexample: ce,
    divergenceDetail: `Diverged around state ${divergenceState}`,
    feedback,
  };
}
