import {
  ASTNode,
  Automaton,
  ThompsonFragment,
  ThompsonResult,
  ThompsonStep,
  Transition,
} from '../types';
import { parseRegex } from './parser';

/**
 * Helper to convert AST node back to a human-readable subexpression string.
 */
export function astToString(node: ASTNode): string {
  switch (node.type) {
    case 'LITERAL':
      return node.value;
    case 'EPSILON':
      return 'e';
    case 'EMPTY':
      return '�';
    case 'UNION':
      return `(${astToString(node.left)} | ${astToString(node.right)})`;
    case 'CONCAT':
      return `${astToString(node.left)}${astToString(node.right)}`;
    case 'STAR':
      return `${astToString(node.child)}*`;
    case 'PLUS':
      return `${astToString(node.child)}+`;
  }
}

/**
 * Thompson's Construction Algorithm
 * Recursively converts an AST of a Regular Expression into an equivalent e-NFA.
 */
export class ThompsonConstructor {
  private stateCounter = 0;
  private steps: ThompsonStep[] = [];
  private allAlphabet = new Set<string>();

  private newState(): string {
    return `q${this.stateCounter++}`;
  }

  public construct(ast: ASTNode): ThompsonResult {
    this.stateCounter = 0;
    this.steps = [];
    this.allAlphabet.clear();

    const rootFragment = this.buildFragment(ast);

    const alphabetArr = Array.from(this.allAlphabet).sort();
    if (alphabetArr.length === 0) alphabetArr.push('0');

    const automaton: Automaton = {
      type: 'ENFA',
      states: rootFragment.states,
      alphabet: alphabetArr,
      startState: rootFragment.startState,
      acceptStates: [rootFragment.acceptState],
      transitions: rootFragment.transitions,
      description: `e-NFA generated via Thompson Construction from regex`,
    };

    return {
      ast,
      automaton,
      steps: this.steps,
    };
  }

  private buildFragment(node: ASTNode): ThompsonFragment {
    const exprStr = astToString(node);

    switch (node.type) {
      case 'LITERAL': {
        this.allAlphabet.add(node.value);
        const s = this.newState();
        const f = this.newState();
        const trans: Transition[] = [{ from: s, to: f, symbol: node.value }];
        const frag: ThompsonFragment = {
          startState: s,
          acceptState: f,
          states: [s, f],
          transitions: trans,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: exprStr,
          nodeType: 'LITERAL',
          fragment: frag,
          explanation: `Base Fragment for literal '${node.value}': Created start state ${s} and accept state ${f} with transition ${s} --${node.value}--> ${f}.`,
        });

        return frag;
      }

      case 'EPSILON': {
        const s = this.newState();
        const f = this.newState();
        const trans: Transition[] = [{ from: s, to: f, symbol: 'e' }];
        const frag: ThompsonFragment = {
          startState: s,
          acceptState: f,
          states: [s, f],
          transitions: trans,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: 'e',
          nodeType: 'EPSILON',
          fragment: frag,
          explanation: `Base Fragment for empty string e: Created start state ${s} and accept state ${f} with e-transition ${s} --e--> ${f}.`,
        });

        return frag;
      }

      case 'EMPTY': {
        const s = this.newState();
        const f = this.newState();
        const frag: ThompsonFragment = {
          startState: s,
          acceptState: f,
          states: [s, f],
          transitions: [],
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: '�',
          nodeType: 'EMPTY',
          fragment: frag,
          explanation: `Base Fragment for empty language �: Created disconnected states ${s} and ${f}. No string can reach the accept state.`,
        });

        return frag;
      }

      case 'UNION': {
        const leftFrag = this.buildFragment(node.left);
        const rightFrag = this.buildFragment(node.right);

        const newStart = this.newState();
        const newAccept = this.newState();

        const transitions: Transition[] = [
          ...leftFrag.transitions,
          ...rightFrag.transitions,
          { from: newStart, to: leftFrag.startState, symbol: 'e' },
          { from: newStart, to: rightFrag.startState, symbol: 'e' },
          { from: leftFrag.acceptState, to: newAccept, symbol: 'e' },
          { from: rightFrag.acceptState, to: newAccept, symbol: 'e' },
        ];

        const states = [
          newStart,
          ...leftFrag.states,
          ...rightFrag.states,
          newAccept,
        ];

        const frag: ThompsonFragment = {
          startState: newStart,
          acceptState: newAccept,
          states,
          transitions,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: exprStr,
          nodeType: 'UNION',
          fragment: frag,
          explanation: `Union Fragment (${astToString(node.left)} | ${astToString(node.right)}): Added initial branching state ${newStart} --e--> {${leftFrag.startState}, ${rightFrag.startState}} and converging accept state ${newAccept}.`,
        });

        return frag;
      }

      case 'CONCAT': {
        const leftFrag = this.buildFragment(node.left);
        const rightFrag = this.buildFragment(node.right);

        // Connect left accept to right start via e-transition
        const transitions: Transition[] = [
          ...leftFrag.transitions,
          ...rightFrag.transitions,
          { from: leftFrag.acceptState, to: rightFrag.startState, symbol: 'e' },
        ];

        const states = [...leftFrag.states, ...rightFrag.states];

        const frag: ThompsonFragment = {
          startState: leftFrag.startState,
          acceptState: rightFrag.acceptState,
          states,
          transitions,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: exprStr,
          nodeType: 'CONCAT',
          fragment: frag,
          explanation: `Concatenation Fragment (${astToString(node.left)} � ${astToString(node.right)}): Chained left fragment output ${leftFrag.acceptState} --e--> right fragment input ${rightFrag.startState}.`,
        });

        return frag;
      }

      case 'STAR': {
        const childFrag = this.buildFragment(node.child);

        const newStart = this.newState();
        const newAccept = this.newState();

        const transitions: Transition[] = [
          ...childFrag.transitions,
          { from: newStart, to: childFrag.startState, symbol: 'e' }, // Enter child
          { from: newStart, to: newAccept, symbol: 'e' },            // Skip 0 times
          { from: childFrag.acceptState, to: childFrag.startState, symbol: 'e' }, // Loop back
          { from: childFrag.acceptState, to: newAccept, symbol: 'e' },            // Exit child
        ];

        const states = [newStart, ...childFrag.states, newAccept];

        const frag: ThompsonFragment = {
          startState: newStart,
          acceptState: newAccept,
          states,
          transitions,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: exprStr,
          nodeType: 'STAR',
          fragment: frag,
          explanation: `Kleene Star Fragment (${astToString(node.child)}*): Added new start ${newStart} and accept ${newAccept} with 4 e-transitions for zero-or-more repetition and looping.`,
        });

        return frag;
      }

      case 'PLUS': {
        const childFrag = this.buildFragment(node.child);

        const newStart = this.newState();
        const newAccept = this.newState();

        const transitions: Transition[] = [
          ...childFrag.transitions,
          { from: newStart, to: childFrag.startState, symbol: 'e' }, // Must enter at least once
          { from: childFrag.acceptState, to: childFrag.startState, symbol: 'e' }, // Loop back
          { from: childFrag.acceptState, to: newAccept, symbol: 'e' },            // Exit child
        ];

        const states = [newStart, ...childFrag.states, newAccept];

        const frag: ThompsonFragment = {
          startState: newStart,
          acceptState: newAccept,
          states,
          transitions,
        };

        this.steps.push({
          stepIndex: this.steps.length + 1,
          subExpression: exprStr,
          nodeType: 'PLUS',
          fragment: frag,
          explanation: `Positive Closure Fragment (${astToString(node.child)}+): Requires at least one pass through child fragment before reaching accept state ${newAccept}.`,
        });

        return frag;
      }
    }
  }
}

/**
 * Converts a regular expression string directly to an e-NFA via Thompson's Construction.
 */
export function regexToENFA(pattern: string): ThompsonResult {
  const ast = parseRegex(pattern);
  const constructor = new ThompsonConstructor();
  return constructor.construct(ast);
}
