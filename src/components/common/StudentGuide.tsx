import type { AppView } from '../../store/appStore';

const guides: Partial<Record<AppView, { what: string; do: string; how: string; mistake: string; tip: string }>> = {
  CONVERT: { what: 'Turn one equivalent automaton representation into another.', do: 'Choose the source and target, load an example or edit the input diagram, then follow the numbered steps.', how: 'Subset states such as {q0,q1} mean the NFA could be in either state after reading the same input.', mistake: 'Do not forget epsilon-closure before and after an NFA move.', tip: 'Only construct reachable subset states in an exam.' },
  MINIMIZE: { what: 'Make a DFA as small as possible without changing its language.', do: 'Load a DFA, inspect each partition step, and test a string against both machines.', how: 'States merge only when no future string can tell them apart.', mistake: 'Unreachable states must be removed before comparing states.', tip: 'Start by separating final and non-final states.' },
  BUILDER: { what: 'Draw and test your own DFA, NFA, or epsilon-NFA.', do: 'Add states → select one as start/final → add transitions → enter a test string.', how: 'The trace slider highlights the active states and transitions for each input symbol.', mistake: 'A DFA cannot have two transitions on the same symbol from one state.', tip: 'Use ε only for spontaneous moves in an ε-NFA.' },
  REGEX_LAB: { what: 'See how a regular expression becomes an automaton.', do: 'Enter a regex or choose an example, then move through the AST, ε-NFA, DFA, and minimized DFA tabs.', how: 'Precedence is star (*) first, then concatenation, then union (|).', mistake: 'Use parentheses when you want union to happen before concatenation.', tip: 'Read the token chips first when debugging a regex.' },
  PUMPING: { what: 'Practice a rigorous proof that a language is not regular.', do: 'Follow the stages in order and use the proof checker to validate a decomposition.', how: 'Your strategy must defeat every valid adversarial decomposition, not just a convenient one.', mistake: 'One bad decomposition alone never proves non-regularity.', tip: 'Choose w in terms of p so y is forced into a controlled block.' },
  CHECK_ANSWER: { what: 'Compare your automaton with the required language formally.', do: 'Edit the student diagram, then press CHECK MY ANSWER and inspect any counterexample.', how: 'The checker explores the product automaton and returns the shortest string on which answers differ.', mistake: 'Passing a few sample strings is not a proof of equivalence.', tip: 'Trace the returned counterexample one symbol at a time.' },
  LEXICAL_LAB: { what: 'Learn how a lexer turns source code into tokens.', do: 'Edit the code sample and click a token to inspect its rule and automaton.', how: 'A regex describes a token pattern; a finite automaton recognizes the next longest matching lexeme.', mistake: 'Keywords and identifiers can look similar but are classified by ordered rules.', tip: 'Check the token position when diagnosing a lexer error.' },
  LANGUAGE_LAB: { what: 'Explore supported regular-language examples and their membership behavior.', do: 'Choose a language card, inspect accepted/rejected examples, then open the recommended construction or proof.', how: 'Only the listed templates have automatic constructions; arbitrary English descriptions need formalization first.', mistake: 'The pumping lemma can disprove regularity but cannot prove a language is regular.', tip: 'Use closure operations only after identifying the source machines.' },
  GATE_ARENA: { what: 'Practice Theory of Computation questions with explanations.', do: 'Pick a topic, answer deliberately, then read the solution and record the concept to revise.', how: 'Use the explanation to understand the rule, not only the final option.', mistake: 'Do not treat generated practice as an official previous-year question.', tip: 'Eliminate options using a counterexample when possible.' },
};

export function StudentGuide({ view }: { view: AppView }) {
  const guide = guides[view];
  if (!guide) return null;
  const items = [
    { label: 'What is this?', text: guide.what, tone: 'text-teal-800' },
    { label: 'What to do', text: guide.do, tone: 'text-blue-800' },
    { label: 'How it works', text: guide.how, tone: 'text-indigo-800' },
    { label: 'Common mistake', text: guide.mistake, tone: 'text-amber-800' },
    { label: 'Exam tip', text: guide.tip, tone: 'text-emerald-800' },
  ];
  return <section className="max-w-7xl mx-auto px-4 pt-4"><div className="rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{items.map(item => <div key={item.label} className="min-w-0"><b className={`block mb-1 text-xs font-semibold ${item.tone}`}>{item.label}</b><p className="text-xs leading-relaxed text-slate-700">{item.text}</p></div>)}</div></div></section>;
}
