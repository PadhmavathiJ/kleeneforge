import { ASTNode, LiteralNode, EpsilonNode, EmptyNode, UnionNode, ConcatNode, StarNode, PlusNode } from '../types';
import { tokenizeRegex, RegexToken } from './tokenizer';

/**
 * Recursive Descent Parser for Regular Expressions.
 * Produces a typed Abstract Syntax Tree (AST) with exact precedence handling.
 */
export class RegexParser {
  private tokens: RegexToken[];
  private current = 0;

  constructor(tokens: RegexToken[]) {
    this.tokens = tokens;
  }

  public parse(): ASTNode {
    if (this.peek().type === 'EOF') {
      return { type: 'EPSILON' };
    }
    const node = this.parseUnion();
    if (this.peek().type !== 'EOF') {
      throw new Error(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`);
    }
    return node;
  }

  // Union: Concat ('|' Concat)*
  private parseUnion(): ASTNode {
    let left = this.parseConcat();

    while (this.peek().type === 'UNION') {
      this.advance(); // consume '|'
      const right = this.parseConcat();
      left = {
        type: 'UNION',
        left,
        right,
      } as UnionNode;
    }

    return left;
  }

  // Concat: Repetition ('.' Repetition)*
  private parseConcat(): ASTNode {
    let left = this.parseRepetition();

    while (this.peek().type === 'CONCAT') {
      this.advance(); // consume '�'
      const right = this.parseRepetition();
      left = {
        type: 'CONCAT',
        left,
        right,
      } as ConcatNode;
    }

    return left;
  }

  // Repetition: Atom ('*' | '+' | '?')*
  private parseRepetition(): ASTNode {
    let expr = this.parseAtom();

    while (
      this.peek().type === 'STAR' ||
      this.peek().type === 'PLUS' ||
      this.peek().type === 'QUESTION'
    ) {
      const op = this.advance();
      if (op.type === 'STAR') {
        expr = {
          type: 'STAR',
          child: expr,
        } as StarNode;
      } else if (op.type === 'PLUS') {
        expr = {
          type: 'PLUS',
          child: expr,
        } as PlusNode;
      } else if (op.type === 'QUESTION') {
        // R? is syntactic sugar for (R | e)
        expr = {
          type: 'UNION',
          left: expr,
          right: { type: 'EPSILON' } as EpsilonNode,
        } as UnionNode;
      }
    }

    return expr;
  }

  // Atom: LITERAL | EPSILON | EMPTY | '(' Expression ')'
  private parseAtom(): ASTNode {
    const token = this.peek();

    if (token.type === 'LITERAL') {
      this.advance();
      return {
        type: 'LITERAL',
        value: token.value,
      } as LiteralNode;
    }

    if (token.type === 'EPSILON') {
      this.advance();
      return {
        type: 'EPSILON',
      } as EpsilonNode;
    }

    if (token.type === 'EMPTY') {
      this.advance();
      return {
        type: 'EMPTY',
      } as EmptyNode;
    }

    if (token.type === 'LPAREN') {
      this.advance(); // consume '('
      const expr = this.parseUnion();
      if (this.peek().type !== 'RPAREN') {
        throw new Error(`Mismatched parenthesis: expected ')' at position ${this.peek().position}`);
      }
      this.advance(); // consume ')'
      return expr;
    }

    throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
  }

  private peek(): RegexToken {
    return this.tokens[this.current] || { type: 'EOF', value: '', position: -1 };
  }

  private advance(): RegexToken {
    const t = this.peek();
    this.current++;
    return t;
  }
}

/**
 * Parses a regular expression string into an AST.
 */
export function parseRegex(pattern: string): ASTNode {
  const tokens = tokenizeRegex(pattern);
  const parser = new RegexParser(tokens);
  return parser.parse();
}
