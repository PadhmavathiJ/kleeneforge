import { Automaton, ValidationIssue, ValidationResult } from './types';
import { isEpsilon } from './epsilonClosure';

export function validateAutomaton(automaton: Automaton): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Check basic structure
  if (!automaton.states || automaton.states.length === 0) {
    issues.push({
      type: 'error',
      title: 'No States Defined',
      message: 'The automaton must contain at least one state.',
    });
    return { isValid: false, issues };
  }

  if (!automaton.startState) {
    issues.push({
      type: 'error',
      title: 'Missing Start State',
      message: 'No initial start state is designated for this automaton.',
    });
  } else if (!automaton.states.includes(automaton.startState)) {
    issues.push({
      type: 'error',
      title: 'Invalid Start State',
      message: `The designated start state '${automaton.startState}' does not exist in the states set.`,
      stateId: automaton.startState,
    });
  }

  // 2. Check accepting states
  for (const acc of automaton.acceptStates) {
    if (!automaton.states.includes(acc)) {
      issues.push({
        type: 'error',
        title: 'Invalid Accept State',
        message: `Accepting state '${acc}' is not present in the states set.`,
        stateId: acc,
      });
    }
  }

  if (automaton.acceptStates.length === 0) {
    issues.push({
      type: 'warning',
      title: 'No Accept States',
      message: 'The automaton has 0 accepting states; it will reject all input strings (language is �).',
    });
  }

  // 3. Check transitions validity
  const seenTransitions = new Set<string>();
  const cleanAlphabet = new Set(automaton.alphabet);

  for (const t of automaton.transitions) {
    if (!automaton.states.includes(t.from)) {
      issues.push({
        type: 'error',
        title: 'Unknown Origin State',
        message: `Transition source '${t.from}' is not in states list.`,
        stateId: t.from,
      });
    }
    if (!automaton.states.includes(t.to)) {
      issues.push({
        type: 'error',
        title: 'Unknown Destination State',
        message: `Transition target '${t.to}' is not in states list.`,
        stateId: t.to,
      });
    }

    if (!isEpsilon(t.symbol) && !cleanAlphabet.has(t.symbol)) {
      issues.push({
        type: 'warning',
        title: 'Symbol Not In Alphabet',
        message: `Transition on symbol '${t.symbol}' uses a character not listed in the formal alphabet S.`,
        symbol: t.symbol,
      });
    }

    const tKey = `${t.from}|${t.to}|${t.symbol}`;
    if (seenTransitions.has(tKey)) {
      issues.push({
        type: 'warning',
        title: 'Duplicate Transition',
        message: `Duplicate transition from '${t.from}' to '${t.to}' on symbol '${t.symbol}'.`,
        stateId: t.from,
        symbol: t.symbol,
      });
    }
    seenTransitions.add(tKey);
  }

  // 4. Type specific validations (DFA vs NFA vs ENFA)
  if (automaton.type === 'DFA') {
    // DFA must not have epsilon transitions
    const epsTrans = automaton.transitions.filter(t => isEpsilon(t.symbol));
    if (epsTrans.length > 0) {
      issues.push({
        type: 'error',
        title: 'DFA Violation: Epsilon Transitions',
        message: `DFA contains ${epsTrans.length} e-transition(s). A deterministic automaton cannot have spontaneous transitions.`,
      });
    }

    // DFA must have at most 1 transition per (state, symbol)
    for (const state of automaton.states) {
      for (const sym of automaton.alphabet.filter(s => !isEpsilon(s))) {
        const matching = automaton.transitions.filter(t => t.from === state && t.symbol === sym);
        if (matching.length > 1) {
          issues.push({
            type: 'error',
            title: 'DFA Non-Determinism',
            message: `State '${state}' has ${matching.length} transitions on symbol '${sym}'. In a DFA, d(q, a) must be single-valued.`,
            stateId: state,
            symbol: sym,
          });
        } else if (matching.length === 0) {
          issues.push({
            type: 'info',
            title: 'Incomplete DFA (Implicit Dead State)',
            message: `State '${state}' has no defined transition on symbol '${sym}'. (Treated as an implicit trap state).`,
            stateId: state,
            symbol: sym,
          });
        }
      }
    }
  }

  // 5. Reachability and Dead States
  if (automaton.startState && automaton.states.includes(automaton.startState)) {
    const reachable = new Set<string>([automaton.startState]);
    const queue = [automaton.startState];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const t of automaton.transitions) {
        if (t.from === curr && !reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }

    for (const s of automaton.states) {
      if (!reachable.has(s)) {
        issues.push({
          type: 'warning',
          title: 'Unreachable State',
          message: `State '${s}' cannot be reached from the initial start state '${automaton.startState}'. It has no impact on L(M).`,
          stateId: s,
        });
      }
    }

    // Check dead states (cannot reach any accept state)
    const canReachAccept = new Set<string>(automaton.acceptStates);
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of automaton.transitions) {
        if (canReachAccept.has(t.to) && !canReachAccept.has(t.from)) {
          canReachAccept.add(t.from);
          changed = true;
        }
      }
    }

    for (const s of automaton.states) {
      if (reachable.has(s) && !canReachAccept.has(s)) {
        issues.push({
          type: 'info',
          title: 'Dead / Trap State',
          message: `Reachable state '${s}' cannot reach any accepting state. Any computational branch entering '${s}' is destined to reject.`,
          stateId: s,
        });
      }
    }
  }

  const hasErrors = issues.some(i => i.type === 'error');
  return {
    isValid: !hasErrors,
    issues,
  };
}
