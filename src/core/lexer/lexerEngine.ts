import { LexerResult, LexerRule, LexerToken } from '../types';
import { STANDARD_LEXER_RULES } from './programConstructs';

/**
 * Maximal-Munch Lexical Scanner using regular expression token definitions.
 */
export function tokenizeSourceCode(
  source: string,
  rules: LexerRule[] = STANDARD_LEXER_RULES
): LexerResult {
  const tokens: LexerToken[] = [];
  const errors: { message: string; line: number; col: number; char: string }[] = [];

  // Sort rules by priority ascending
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  let pos = 0;
  let line = 1;
  let col = 1;

  while (pos < source.length) {
    let matchFound = false;
    const remaining = source.slice(pos);

    for (const rule of sortedRules) {
      // Anchor regex to start of remaining text
      const regex = new RegExp(`^(${rule.regex})`);
      const m = remaining.match(regex);

      if (m && m[0].length > 0) {
        const val = m[0];
        const token: LexerToken = {
          type: rule.tokenType,
          value: val,
          line,
          col,
          start: pos,
          end: pos + val.length,
          dfaPath: ['q_start', `q_${rule.tokenType.toLowerCase()}`, 'q_accept'],
        };

        if (rule.tokenType !== 'WHITESPACE') {
          tokens.push(token);
        }

        // Advance line/col count
        for (let cIdx = 0; cIdx < val.length; cIdx++) {
          if (val[cIdx] === '\n') {
            line++;
            col = 1;
          } else {
            col++;
          }
        }

        pos += val.length;
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      const badChar = source[pos];
      errors.push({
        message: `Unrecognized character '${badChar}'`,
        line,
        col,
        char: badChar,
      });
      pos++;
      col++;
    }
  }

  return { tokens, errors };
}
