import { Automaton, SubsetConstructionResult, SubsetConstructionStep, Transition } from './types';
import { computeSetEpsilonClosure, isEpsilon } from './epsilonClosure';

/**
 * Canonical string representation of a state set, e.g. ["q0", "q1"] -> "{q0,q1}"
 */
export function subsetToKey(subset: string[]): string {
  if (subset.length === 0) return '�';
  const sorted = Array.from(new Set(subset)).sort();
  return `{${sorted.join(',')}}`;
}

/**
 * Generates clean DFA state names: A, B, C, ... or q0', q1', ...
 */
export function indexToStateName(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < letters.length) return letters[index];
  return `D${index}`;
}

/**
 * Deterministic Subset Construction (Powerset Construction)
 * Converts any NFA or e-NFA into an equivalent DFA with full step-by-step reasoning.
 */
export function convertNfaToDfa(nfa: Automaton): SubsetConstructionResult {
  const alphabet = nfa.alphabet.filter(s => !isEpsilon(s));
  const steps: SubsetConstructionStep[] = [];
  
  // 1. Initial State: e-closure({startState})
  const initialClosureRes = computeSetEpsilonClosure(nfa, [nfa.startState]);
  const initialSubset = initialClosureRes.closure;
  const initialKey = subsetToKey(initialSubset);

  const subsetMap = new Map<string, string[]>(); // key -> sorted array
  const nameMap = new Map<string, string>(); // key -> DFA state name
  const reverseNameMap: Record<string, string[]> = {};

  let stateCounter = 0;
  const startDfaName = indexToStateName(stateCounter++);
  subsetMap.set(initialKey, initialSubset);
  nameMap.set(initialKey, startDfaName);
  reverseNameMap[startDfaName] = initialSubset;

  const queue: string[] = [initialKey];
  const dfaTransitions: Transition[] = [];
  const processedKeys = new Set<string>();

  let stepCount = 0;

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    if (processedKeys.has(currentKey)) continue;
    processedKeys.add(currentKey);

    const currentSubset = subsetMap.get(currentKey)!;
    const currentDfaName = nameMap.get(currentKey)!;

    if (currentSubset.length === 0) {
      // Dead / Trap state � transitions to itself on all symbols
      for (const sym of alphabet) {
        dfaTransitions.push({
          from: currentDfaName,
          to: currentDfaName,
          symbol: sym,
        });
        steps.push({
          stepIndex: ++stepCount,
          dfaStateName: currentDfaName,
          nfaSubset: [],
          symbol: sym,
          targetNfaSubset: [],
          targetDfaStateName: currentDfaName,
          isNewState: false,
          explanation: `Trap state ${currentDfaName} (�) on symbol '${sym}' loops to ${currentDfaName} (�).`,
          moveSet: [],
          epsilonClosureSet: [],
        });
      }
      continue;
    }

    for (const sym of alphabet) {
      // 1. Compute move(currentSubset, sym)
      const moveSet = new Set<string>();
      const moveExplanations: string[] = [];

      for (const st of currentSubset) {
        const trans = nfa.transitions.filter(t => t.from === st && t.symbol === sym);
        const reached = trans.map(t => t.to);
        if (reached.length > 0) {
          reached.forEach(r => moveSet.add(r));
          moveExplanations.push(`d(${st}, '${sym}') = {${reached.join(', ')}}`);
        } else {
          moveExplanations.push(`d(${st}, '${sym}') = �`);
        }
      }

      const moveArr = Array.from(moveSet).sort();

      // 2. Compute e-closure(moveArr)
      const closureResult = computeSetEpsilonClosure(nfa, moveArr);
      const targetSubset = closureResult.closure;
      const targetKey = subsetToKey(targetSubset);

      let isNew = false;
      if (!nameMap.has(targetKey)) {
        isNew = true;
        const targetDfaName = targetSubset.length === 0 ? 'TRAP' : indexToStateName(stateCounter++);
        nameMap.set(targetKey, targetDfaName);
        subsetMap.set(targetKey, targetSubset);
        reverseNameMap[targetDfaName] = targetSubset;
        queue.push(targetKey);
      }

      const targetDfaName = nameMap.get(targetKey)!;
      dfaTransitions.push({
        from: currentDfaName,
        to: targetDfaName,
        symbol: sym,
      });

      // Construct detailed pedagogical explanation
      const expMove = moveExplanations.join('; ');
      const isTargetAccepting = targetSubset.some(s => nfa.acceptStates.includes(s));
      const acceptDetail = isTargetAccepting 
        ? `Contains NFA accept state(s) -> DFA state ${targetDfaName} is ACCEPTING.`
        : `Does not contain NFA accept state -> DFA state ${targetDfaName} is NON-ACCEPTING.`;

      const exp = [
        `From DFA state ${currentDfaName} = ${currentKey} on input '${sym}':`,
        `  � Move analysis: ${expMove}`,
        `  � Union of move: {${moveArr.join(', ')}}`,
        `  � e-closure({${moveArr.join(', ')}}) = ${targetKey}`,
        `  � Mapped to DFA state ${targetDfaName} ${isNew ? '(NEW state discovered)' : '(Already existing state)'}.`,
        `  � ${acceptDetail}`
      ].join('\n');

      steps.push({
        stepIndex: ++stepCount,
        dfaStateName: currentDfaName,
        nfaSubset: currentSubset,
        symbol: sym,
        targetNfaSubset: targetSubset,
        targetDfaStateName: targetDfaName,
        isNewState: isNew,
        explanation: exp,
        moveSet: moveArr,
        epsilonClosureSet: targetSubset,
      });
    }
  }

  // Find DFA accepting states: any subset containing an NFA accept state
  const dfaStates = Array.from(nameMap.values());
  const dfaAcceptStates = dfaStates.filter(stateName => {
    const sub = reverseNameMap[stateName] || [];
    return sub.some(s => nfa.acceptStates.includes(s));
  });

  const dfa: Automaton = {
    type: 'DFA',
    states: dfaStates,
    alphabet,
    startState: startDfaName,
    acceptStates: dfaAcceptStates,
    transitions: dfaTransitions,
    description: `DFA converted from ${nfa.type} via Subset Construction (${dfaStates.length} states)`,
  };

  const reachableSubsets = Array.from(subsetMap.values());

  return {
    originalAutomaton: nfa,
    dfa,
    steps,
    stateMapping: reverseNameMap,
    reachableSubsets,
  };
}
