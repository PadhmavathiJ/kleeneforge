import { Automaton } from './types';

export function isEpsilon(symbol: string): boolean {
  return symbol === 'e' || symbol === 'e' || symbol === '' || symbol === '?' || symbol === 'eps';
}

/**
 * Computes the e-closure of a single state q in an automaton.
 * e-closure(q) is the set of all states reachable from q by taking 0 or more e-transitions.
 */
export function computeEpsilonClosure(
  automaton: Automaton,
  state: string
): { closure: string[]; steps: string[] } {
  const closureSet = new Set<string>([state]);
  const queue: string[] = [state];
  const steps: string[] = [`Initial: e-closure(${state}) contains {${state}} (reflexive basis)`];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Find all e-transitions originating from current
    const epsTransitions = automaton.transitions.filter(
      t => t.from === current && isEpsilon(t.symbol)
    );

    for (const t of epsTransitions) {
      if (!closureSet.has(t.to)) {
        closureSet.add(t.to);
        queue.push(t.to);
        steps.push(`Transition ${t.from} --e--> ${t.to} discovers new state: ${t.to}`);
      }
    }
  }

  const closure = Array.from(closureSet).sort();
  steps.push(`Final e-closure(${state}) = {${closure.join(', ')}}`);
  return { closure, steps };
}

/**
 * Computes the e-closure of a set of states S.
 * e-closure(S) = ?_{q ? S} e-closure(q)
 */
export function computeSetEpsilonClosure(
  automaton: Automaton,
  states: string[]
): { closure: string[]; steps: string[] } {
  const resultSet = new Set<string>();
  const steps: string[] = [`Computing e-closure for set {${states.join(', ')}}`];

  for (const st of states) {
    const single = computeEpsilonClosure(automaton, st);
    single.closure.forEach(s => resultSet.add(s));
    steps.push(`e-closure(${st}) = {${single.closure.join(', ')}}`);
  }

  const closure = Array.from(resultSet).sort();
  steps.push(`Combined e-closure({${states.join(', ')}}) = {${closure.join(', ')}}`);
  return { closure, steps };
}
