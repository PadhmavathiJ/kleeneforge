export type RegexTokenType =
  | 'LITERAL'
  | 'UNION'
  | 'CONCAT'
  | 'STAR'
  | 'PLUS'
  | 'QUESTION'
  | 'LPAREN'
  | 'RPAREN'
  | 'EPSILON'
  | 'EMPTY'
  | 'EOF';

export interface RegexToken {
  type: RegexTokenType;
  value: string;
  position: number;
}

/**
 * Checks if a character is a formal epsilon indicator.
 */
export function isEpsChar(c: string): boolean {
  return c === 'e' || c === '?' || c === 'E';
}

/**
 * Tokenizes a regular expression and inserts explicit concatenation tokens ('.').
 */
export function tokenizeRegex(pattern: string): RegexToken[] {
  const rawTokens: RegexToken[] = [];
  const clean = pattern.trim();
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === '|') {
      rawTokens.push({ type: 'UNION', value: '|', position: i });
      i++;
    } else if (char === '*') {
      rawTokens.push({ type: 'STAR', value: '*', position: i });
      i++;
    } else if (char === '+') {
      // In formal regex, check if '+' is union or one-or-more. We treat + as one-or-more if preceded by atom
      rawTokens.push({ type: 'PLUS', value: '+', position: i });
      i++;
    } else if (char === '?') {
      rawTokens.push({ type: 'QUESTION', value: '?', position: i });
      i++;
    } else if (char === '(') {
      rawTokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
    } else if (char === ')') {
      rawTokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
    } else if (isEpsChar(char) || clean.slice(i, i + 2) === '\\e' || clean.slice(i, i + 3) === 'eps') {
      const len = clean.slice(i, i + 3) === 'eps' ? 3 : clean.slice(i, i + 2) === '\\e' ? 2 : 1;
      rawTokens.push({ type: 'EPSILON', value: 'e', position: i });
      i += len;
    } else if (char === '�' || clean.slice(i, i + 2) === '\\0' || clean.slice(i, i + 3) === 'phi') {
      const len = clean.slice(i, i + 3) === 'phi' ? 3 : clean.slice(i, i + 2) === '\\0' ? 2 : 1;
      rawTokens.push({ type: 'EMPTY', value: '�', position: i });
      i += len;
    } else if (char === '\\' && i + 1 < clean.length) {
      // Escaped literal
      rawTokens.push({ type: 'LITERAL', value: clean[i + 1], position: i });
      i += 2;
    } else {
      // Regular character literal
      rawTokens.push({ type: 'LITERAL', value: char, position: i });
      i++;
    }
  }

  // Insert explicit concatenation '.' tokens where needed
  const tokensWithConcat: RegexToken[] = [];

  for (let j = 0; j < rawTokens.length; j++) {
    const curr = rawTokens[j];
    tokensWithConcat.push(curr);

    if (j + 1 < rawTokens.length) {
      const next = rawTokens[j + 1];

      const currCanEndAtom =
        curr.type === 'LITERAL' ||
        curr.type === 'EPSILON' ||
        curr.type === 'EMPTY' ||
        curr.type === 'RPAREN' ||
        curr.type === 'STAR' ||
        curr.type === 'PLUS' ||
        curr.type === 'QUESTION';

      const nextCanStartAtom =
        next.type === 'LITERAL' ||
        next.type === 'EPSILON' ||
        next.type === 'EMPTY' ||
        next.type === 'LPAREN';

      if (currCanEndAtom && nextCanStartAtom) {
        tokensWithConcat.push({
          type: 'CONCAT',
          value: '�',
          position: curr.position,
        });
      }
    }
  }

  tokensWithConcat.push({ type: 'EOF', value: '', position: clean.length });
  return tokensWithConcat;
}
