import { Automaton, MinimizationResult, MinimizationStep, Transition } from './types';
import { isEpsilon } from './epsilonClosure';

/** Complete a partial DFA with one explicit rejecting trap state. This gives
 * partition refinement the same semantics as simulation and makes the output
 * a genuinely minimal complete DFA rather than merely a partial quotient. */
function completeDFA(dfa: Automaton, alphabet: string[]): Automaton {
  let trapState = '__TRAP__';
  while (dfa.states.includes(trapState)) trapState = `_${trapState}`;

  const states = [...dfa.states];
  const transitions = [...dfa.transitions];
  let needsTrap = false;

  for (const state of dfa.states) {
    for (const symbol of alphabet) {
      if (!transitions.some(t => t.from === state && t.symbol === symbol)) {
        transitions.push({ from: state, to: trapState, symbol });
        needsTrap = true;
      }
    }
  }

  if (needsTrap) {
    states.push(trapState);
    for (const symbol of alphabet) transitions.push({ from: trapState, to: trapState, symbol });
  }

  return { ...dfa, states, alphabet, transitions };
}

/**
 * Removes unreachable states from a DFA.
 */
export function removeUnreachableStates(dfa: Automaton): {
  reachableDfa: Automaton;
  unreachableStates: string[];
} {
  const reachable = new Set<string>([dfa.startState]);
  const queue = [dfa.startState];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const trans = dfa.transitions.filter(t => t.from === curr);
    for (const t of trans) {
      if (!reachable.has(t.to)) {
        reachable.add(t.to);
        queue.push(t.to);
      }
    }
  }

  const reachableStates = dfa.states.filter(s => reachable.has(s));
  const unreachableStates = dfa.states.filter(s => !reachable.has(s));
  const cleanTransitions = dfa.transitions.filter(
    t => reachable.has(t.from) && reachable.has(t.to)
  );
  const cleanAcceptStates = dfa.acceptStates.filter(s => reachable.has(s));

  return {
    reachableDfa: {
      ...dfa,
      states: reachableStates,
      acceptStates: cleanAcceptStates,
      transitions: cleanTransitions,
    },
    unreachableStates,
  };
}

/**
 * Minimizes a DFA using the Partition Refinement (Hopcroft's equivalence) Algorithm.
 */
export function minimizeDFA(dfa: Automaton): MinimizationResult {
  if (dfa.type !== 'DFA') {
    throw new Error('DFA minimization requires an automaton whose type is DFA.');
  }

  const steps: MinimizationStep[] = [];
  const alphabet = dfa.alphabet.filter(s => !isEpsilon(s));
  if (dfa.transitions.some(t => isEpsilon(t.symbol))) {
    throw new Error('DFA minimization does not allow epsilon transitions. Convert to a DFA first.');
  }
  for (const state of dfa.states) {
    for (const symbol of alphabet) {
      if (dfa.transitions.filter(t => t.from === state && t.symbol === symbol).length > 1) {
        throw new Error(`DFA minimization requires one transition from ${state} on '${symbol}'.`);
      }
    }
  }
  const completeInput = completeDFA(dfa, alphabet);

  // Step 1: Remove unreachable states
  const { reachableDfa, unreachableStates } = removeUnreachableStates(completeInput);
  const cleanStates = reachableDfa.states;

  steps.push({
    stepIndex: 1,
    title: 'Reachability Analysis',
    partitions: [cleanStates],
    explanation: unreachableStates.length > 0
      ? `Identified and eliminated ${unreachableStates.length} unreachable state(s): {${unreachableStates.join(', ')}}. Remaining reachable states: {${cleanStates.join(', ')}}.`
      : `All ${cleanStates.length} states are reachable from the start state '${dfa.startState}'.`,
  });

  // Step 2: Initial Partition P0 = { F, Q \ F }
  const finalGroup = cleanStates.filter(s => reachableDfa.acceptStates.includes(s));
  const nonFinalGroup = cleanStates.filter(s => !reachableDfa.acceptStates.includes(s));

  let currentPartitions: string[][] = [];
  if (finalGroup.length > 0) currentPartitions.push(finalGroup);
  if (nonFinalGroup.length > 0) currentPartitions.push(nonFinalGroup);
  if (currentPartitions.length === 0) currentPartitions.push(cleanStates);

  steps.push({
    stepIndex: 2,
    title: 'Initial Partition (P0)',
    partitions: currentPartitions.map(p => [...p]),
    explanation: `P0 separates accepting final states F = {${finalGroup.join(', ') || '�'}} from non-accepting states Q \\ F = {${nonFinalGroup.join(', ') || '�'}}. (Strings of length 0 distinguish them).`,
  });

  // Helper to find partition group index of a state
  const findGroupIndex = (state: string, partitions: string[][]): number => {
    return partitions.findIndex(group => group.includes(state));
  };

  // Helper to get transition target from state on symbol
  const getTransition = (state: string, symbol: string): string | null => {
    const t = reachableDfa.transitions.find(tr => tr.from === state && tr.symbol === symbol);
    return t ? t.to : null;
  };

  let iteration = 0;
  let partitionChanged = true;

  while (partitionChanged) {
    iteration++;
    partitionChanged = false;
    const newPartitions: string[][] = [];
    const splitReasons: string[] = [];

    for (let gIdx = 0; gIdx < currentPartitions.length; gIdx++) {
      const group = currentPartitions[gIdx];
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Group states by signature: for each symbol, which partition group index is reached?
      const signatureMap = new Map<string, string[]>();
      const stateSignatures: Record<string, string> = {};

      for (const state of group) {
        const sigParts: string[] = [];
        for (const sym of alphabet) {
          const target = getTransition(state, sym);
          const targetGroup = target !== null ? findGroupIndex(target, currentPartitions) : -1;
          sigParts.push(`${sym}->G${targetGroup}`);
        }
        const sig = sigParts.join('|');
        stateSignatures[state] = sig;

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig)!.push(state);
      }

      if (signatureMap.size === 1) {
        // All states in group have identical transition behaviors
        newPartitions.push(group);
      } else {
        // Group split!
        partitionChanged = true;
        const subGroups = Array.from(signatureMap.values());
        for (const sub of subGroups) {
          newPartitions.push(sub);
        }

        const splitDesc = Array.from(signatureMap.entries())
          .map(([sig, stList]) => `{${stList.join(', ')}} (transitions: ${sig})`)
          .join(' vs ');
        splitReasons.push(`Group {${group.join(', ')}} split into: ${splitDesc}`);
      }
    }

    currentPartitions = newPartitions;

    steps.push({
      stepIndex: steps.length + 1,
      title: `Partition Refinement (P${iteration})`,
      partitions: currentPartitions.map(p => [...p]),
      distinguishedReason: splitReasons.join('\n'),
      explanation: partitionChanged
        ? `Refinement round ${iteration}: Distinguishable behaviors detected.\n${splitReasons.join('\n')}`
        : `Refinement round ${iteration}: No further partitions could be split (P${iteration} = P${iteration - 1}). Equivalence classes have stabilized.`,
    });
  }

  // Step 4: Merge equivalent states & Construct Minimal DFA
  const finalPartitions = currentPartitions;
  const stateToGroupMap = new Map<string, string>();
  const equivalenceClasses: Record<string, string[]> = {};

  const minStateNames = finalPartitions.map((group, idx) => {
    // Label state as [q0,q1] or q_idx
    const label = group.length === 1 ? group[0] : `[${group.join(',')}]`;
    group.forEach(s => stateToGroupMap.set(s, label));
    equivalenceClasses[label] = group;
    return label;
  });

  const minStartState = stateToGroupMap.get(reachableDfa.startState)!;
  const minAcceptStates = Array.from(
    new Set(
      reachableDfa.acceptStates
        .map(s => stateToGroupMap.get(s))
        .filter((s): s is string => s !== undefined)
    )
  );

  const minTransitions: Transition[] = [];
  const addedTransKeys = new Set<string>();

  for (const group of finalPartitions) {
    const repState = group[0];
    const fromLabel = stateToGroupMap.get(repState)!;

    for (const sym of alphabet) {
      const target = getTransition(repState, sym);
      if (target !== null) {
        const toLabel = stateToGroupMap.get(target)!;
        const key = `${fromLabel}--${sym}-->${toLabel}`;
        if (!addedTransKeys.has(key)) {
          addedTransKeys.add(key);
          minTransitions.push({
            from: fromLabel,
            to: toLabel,
            symbol: sym,
          });
        }
      }
    }
  }

  const minimalDfa: Automaton = {
    type: 'DFA',
    states: minStateNames,
    alphabet,
    startState: minStartState,
    acceptStates: minAcceptStates,
    transitions: minTransitions,
    description: `Minimized DFA (${dfa.states.length} states -> ${minStateNames.length} states)`,
  };

  steps.push({
    stepIndex: steps.length + 1,
    title: 'Minimal DFA Construction',
    partitions: finalPartitions,
    explanation: `Merged equivalent states into ${minStateNames.length} equivalence class(es): ${minStateNames.join(', ')}. Final transition table and graph constructed.`,
  });

  return {
    originalDfa: dfa,
    minimalDfa,
    unreachableRemoved: unreachableStates,
    initialPartitions: [finalGroup, nonFinalGroup].filter(g => g.length > 0),
    finalPartitions,
    equivalenceClasses,
    steps,
  };
}
