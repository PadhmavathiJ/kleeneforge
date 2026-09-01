/**
 * Simplifies regular expressions algebraically to avoid excessive clutter.
 */
export function simplifyRegex(expr: string): string {
  let s = expr.trim();
  if (!s) return 'e';

  let prev = '';
  let iterations = 0;

  while (prev !== s && iterations < 15) {
    prev = s;
    iterations++;

    // 1. Clean redundant outer parens
    if (s.startsWith('(') && s.endsWith(')')) {
      // Check if matching
      let depth = 0;
      let ok = true;
      for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') depth++;
        if (s[i] === ')') depth--;
        if (depth === 0) {
          ok = false;
          break;
        }
      }
      if (ok) {
        s = s.slice(1, -1);
      }
    }

    // 2. Empty language rules: � | R -> R, R | � -> R
    s = s.replace(/\b�\s*\|\s*/g, '');
    s = s.replace(/\s*\|\s*�\b/g, '');
    s = s.replace(/\(�\)/g, '�');

    // 3. Epsilon concatenation: e.R -> R, R.e -> R
    s = s.replace(/(^|[^a-zA-Z0-9*+?)])e([a-zA-Z0-9(])/g, '$1$2');
    s = s.replace(/([a-zA-Z0-9*+?)])e([^a-zA-Z0-9*+?)]|$)/g, '$1$2');
    s = s.replace(/\(e\)/g, 'e');

    // 4. Stars: e* -> e, �* -> e, (R*)* -> R*
    s = s.replace(/e\*/g, 'e');
    s = s.replace(/�\*/g, 'e');
    s = s.replace(/\(([a-zA-Z0-9]+)\*\)\*/g, '$1*');
    s = s.replace(/\*\*+/g, '*');

    // 5. Clean empty unions
    s = s.replace(/\|\s*\|+/g, '|');
    s = s.replace(/^\|+|\|+$/g, '');
  }

  return s || 'e';
}

/**
 * Formats a regular expression for LaTeX rendering with KaTeX.
 */
export function formatRegexToLatex(expr: string): string {
  let tex = expr;
  tex = tex.replace(/e/g, '\\varepsilon ');
  tex = tex.replace(/�/g, '\\emptyset ');
  tex = tex.replace(/\|/g, ' \\mid ');
  tex = tex.replace(/\*/g, '^*');
  tex = tex.replace(/\+/g, '^+');
  return tex;
}
