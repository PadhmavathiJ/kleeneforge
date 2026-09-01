import { LexerRule } from '../types';

export const STANDARD_LEXER_RULES: LexerRule[] = [
  {
    tokenType: 'KEYWORD',
    regex: '\\b(if|else|while|for|return|int|float|double|char|void|bool|true|false)\\b',
    priority: 1,
    color: '#38bdf8', // cyan
    description: 'Reserved language keywords that direct control flow and type definitions.',
  },
  {
    tokenType: 'FLOAT',
    regex: '\\b[0-9]+\\.[0-9]+([eE][+-]?[0-9]+)?\\b',
    priority: 2,
    color: '#fbbf24', // amber
    description: 'Floating point numerical constants with optional scientific notation.',
  },
  {
    tokenType: 'INTEGER',
    regex: '\\b[0-9]+\\b',
    priority: 3,
    color: '#f59e0b', // orange
    description: 'Base-10 integer literal constants.',
  },
  {
    tokenType: 'IDENTIFIER',
    regex: '\\b[a-zA-Z_][a-zA-Z0-9_]*\\b',
    priority: 4,
    color: '#c084fc', // purple
    description: 'Variable, function, and type identifiers starting with a letter or underscore.',
  },
  {
    tokenType: 'STRING',
    regex: '"([^"\\\\]|\\\\.)*"',
    priority: 5,
    color: '#34d399', // emerald
    description: 'Double-quoted string literals with escape sequence support.',
  },
  {
    tokenType: 'OPERATOR',
    regex: '(==|!=|<=|>=|&&|\\|\\||\\+\\+|--|\\+|-|\\*|/|=|%|<|>|!)',
    priority: 6,
    color: '#f43f5e', // rose
    description: 'Arithmetic, logical, comparison, and assignment operators.',
  },
  {
    tokenType: 'DELIMITER',
    regex: '([;:,\\(\\)\\{\\}\\[\\]])',
    priority: 7,
    color: '#94a3b8', // slate
    description: 'Punctuation and grouping delimiters.',
  },
  {
    tokenType: 'COMMENT',
    regex: '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)',
    priority: 8,
    color: '#64748b', // muted slate
    description: 'Single-line (//) and multi-line (/* */) source comments.',
  },
  {
    tokenType: 'WHITESPACE',
    regex: '[ \\t\\r\\n]+',
    priority: 9,
    color: '#475569',
    description: 'Ignored whitespace separators.',
  },
];
