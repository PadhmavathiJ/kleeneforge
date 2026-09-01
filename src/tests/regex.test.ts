import { describe, it, expect } from 'vitest';
import { parseRegex } from '../core/regex/parser';
import { regexToENFA } from '../core/regex/thompson';
import { convertAutomatonToRegex } from '../core/regex/gnfa';
import { simulateAutomaton } from '../core/simulation';
import { AUTOMATON_PRESETS } from '../core/presets';

describe('Regex Engine (Tokenizer, Parser, Thompson, GNFA)', () => {
  it('should parse complex regex with correct precedence', () => {
    const ast = parseRegex('(a|b)*abb');
    expect(ast.type).toBe('CONCAT');
  });

  it('should construct e-NFA via Thompson and accept matching strings', () => {
    const res = regexToENFA('(0|1)*01');
    const enfa = res.automaton;

    expect(simulateAutomaton(enfa, '01').accepted).toBe(true);
    expect(simulateAutomaton(enfa, '001').accepted).toBe(true);
    expect(simulateAutomaton(enfa, '101').accepted).toBe(true);
    expect(simulateAutomaton(enfa, '11001').accepted).toBe(true);
    expect(simulateAutomaton(enfa, '0').accepted).toBe(false);
    expect(simulateAutomaton(enfa, '10').accepted).toBe(false);
  });

  it('should convert DFA to regex via GNFA state elimination', () => {
    const dfa01 = AUTOMATON_PRESETS.find(p => p.id === 'dfa_ends_with_01')!.automaton;
    const gnfaRes = convertAutomatonToRegex(dfa01);
    expect(gnfaRes.simplifiedRegex).toBeTruthy();
    expect(gnfaRes.steps.length).toBe(dfa01.states.length);
  });
});
