import { Automaton, SimulationResult, SimulationStep, BatchTestResult, Transition } from './types';
import { computeSetEpsilonClosure, isEpsilon } from './epsilonClosure';

/**
 * Simulates a DFA step-by-step on an input string.
 */
export function simulateDFA(dfa: Automaton, input: string): SimulationResult {
  const steps: SimulationStep[] = [];
  let currentState = dfa.startState;
  
  steps.push({
    stepIndex: 0,
    currentStates: [currentState],
    symbolRead: null,
    remainingInput: input,
    nextStates: [currentState],
    activeTransitions: [],
    explanation: `Start at initial state ${currentState}`,
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const remaining = input.slice(i + 1);
    const validTrans = dfa.transitions.filter(
      t => t.from === currentState && t.symbol === symbol
    );

    if (validTrans.length === 0) {
      // Dead state / no transition
      steps.push({
        stepIndex: i + 1,
        currentStates: [currentState],
        symbolRead: symbol,
        remainingInput: remaining,
        nextStates: [],
        activeTransitions: [],
        explanation: `No transition from state ${currentState} on symbol '${symbol}'. Machine traps and rejects.`,
      });
      return {
        accepted: false,
        steps,
        inputString: input,
        finalStates: [],
      };
    }

    const nextState = validTrans[0].to;
    steps.push({
      stepIndex: i + 1,
      currentStates: [currentState],
      symbolRead: symbol,
      remainingInput: remaining,
      nextStates: [nextState],
      activeTransitions: [validTrans[0]],
      explanation: `Read symbol '${symbol}': transition d(${currentState}, '${symbol}') = ${nextState}`,
    });

    currentState = nextState;
  }

  const isAccepted = dfa.acceptStates.includes(currentState);
  steps[steps.length - 1].explanation += isAccepted
    ? ` -> Final state ${currentState} is an ACCEPTING state. (String accepted)`
    : ` -> Final state ${currentState} is NOT an accepting state. (String rejected)`;

  return {
    accepted: isAccepted,
    steps,
    inputString: input,
    finalStates: [currentState],
  };
}

/**
 * Simulates an NFA or e-NFA step-by-step on an input string using subset tracking.
 */
export function simulateNFA(nfa: Automaton, input: string): SimulationResult {
  const steps: SimulationStep[] = [];
  
  // Initial active states = e-closure({startState})
  const initialClosure = computeSetEpsilonClosure(nfa, [nfa.startState]);
  let currentStates = initialClosure.closure;

  steps.push({
    stepIndex: 0,
    currentStates,
    symbolRead: null,
    remainingInput: input,
    nextStates: currentStates,
    activeTransitions: [],
    explanation: `Initial active state set = e-closure({${nfa.startState}}) = {${currentStates.join(', ')}}`,
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const remaining = input.slice(i + 1);
    const activeTransitions: Transition[] = [];
    const moveSet = new Set<string>();

    for (const state of currentStates) {
      const trans = nfa.transitions.filter(
        t => t.from === state && t.symbol === symbol
      );
      for (const t of trans) {
        moveSet.add(t.to);
        activeTransitions.push(t);
      }
    }

    if (moveSet.size === 0) {
      steps.push({
        stepIndex: i + 1,
        currentStates,
        symbolRead: symbol,
        remainingInput: remaining,
        nextStates: [],
        activeTransitions: [],
        explanation: `On symbol '${symbol}', no active branch can transition (move is empty). All computational paths die.`,
      });
      return {
        accepted: false,
        steps,
        inputString: input,
        finalStates: [],
      };
    }

    // Apply e-closure to move set
    const moveArr = Array.from(moveSet).sort();
    const closureResult = computeSetEpsilonClosure(nfa, moveArr);
    const nextStates = closureResult.closure;

    steps.push({
      stepIndex: i + 1,
      currentStates,
      symbolRead: symbol,
      remainingInput: remaining,
      nextStates,
      activeTransitions,
      explanation: `Read symbol '${symbol}': move({${currentStates.join(', ')}}, '${symbol}') = {${moveArr.join(', ')}} -> e-closure = {${nextStates.join(', ')}}`,
    });

    currentStates = nextStates;
  }

  const isAccepted = currentStates.some(s => nfa.acceptStates.includes(s));
  const acceptingStatesReached = currentStates.filter(s => nfa.acceptStates.includes(s));

  if (steps.length > 0) {
    steps[steps.length - 1].explanation += isAccepted
      ? ` -> Accepting state(s) reached: {${acceptingStatesReached.join(', ')}}. (String accepted)`
      : ` -> None of final states {${currentStates.join(', ')}} are accepting. (String rejected)`;
  }

  return {
    accepted: isAccepted,
    steps,
    inputString: input,
    finalStates: currentStates,
  };
}

/**
 * Universal simulator for any automaton (DFA, NFA, e-NFA).
 */
export function simulateAutomaton(automaton: Automaton, input: string): SimulationResult {
  if (automaton.type === 'DFA') {
    // Check if truly deterministic
    const hasMultipleTrans = automaton.states.some(s => {
      return automaton.alphabet.some(sym => {
        return automaton.transitions.filter(t => t.from === s && t.symbol === sym).length > 1;
      });
    });
    const hasEps = automaton.transitions.some(t => isEpsilon(t.symbol));
    if (!hasMultipleTrans && !hasEps) {
      return simulateDFA(automaton, input);
    }
  }
  return simulateNFA(automaton, input);
}

/**
 * Generates canonical shortlex strings over alphabet (e.g. e, 0, 1, 00, 01, 10, 11...).
 */
export function generateTestStrings(alphabet: string[], maxLen = 4, limit = 50): string[] {
  const cleanAlphabet = alphabet.filter(s => !isEpsilon(s) && s.length > 0);
  if (cleanAlphabet.length === 0) return [''];
  
  const results: string[] = [''];
  let queue: string[] = [''];

  while (queue.length > 0 && results.length < limit) {
    const curr = queue.shift()!;
    if (curr.length >= maxLen) continue;

    for (const sym of cleanAlphabet) {
      const next = curr + sym;
      results.push(next);
      queue.push(next);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Runs a batch of test cases against an automaton.
 */
export function runBatchTests(
  automaton: Automaton,
  testCases: { input: string; expected?: boolean }[]
): BatchTestResult[] {
  return testCases.map(tc => {
    const res = simulateAutomaton(automaton, tc.input);
    const passed = tc.expected !== undefined ? res.accepted === tc.expected : undefined;
    return {
      input: tc.input,
      expected: tc.expected,
      actual: res.accepted,
      stepsCount: res.steps.length,
      passed,
    };
  });
}
