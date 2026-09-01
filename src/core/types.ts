export type AutomatonType = 'DFA' | 'NFA' | 'ENFA';

export interface Transition {
  from: string;
  to: string;
  symbol: string; // 'e' or 'e' for epsilon
}

export interface StateMetadata {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  isStart?: boolean;
  isAccept?: boolean;
}

export interface Automaton {
  type: AutomatonType;
  states: string[];
  alphabet: string[];
  startState: string;
  acceptStates: string[];
  transitions: Transition[];
  description?: string;
}

export interface SimulationStep {
  stepIndex: number;
  currentStates: string[];
  symbolRead: string | null;
  remainingInput: string;
  nextStates: string[];
  activeTransitions: Transition[];
  explanation: string;
}

export interface SimulationResult {
  accepted: boolean;
  steps: SimulationStep[];
  inputString: string;
  finalStates: string[];
  pathFound?: string[];
}

export interface BatchTestResult {
  input: string;
  expected?: boolean;
  actual: boolean;
  stepsCount: number;
  passed?: boolean;
}

export interface SubsetConstructionStep {
  stepIndex: number;
  dfaStateName: string;
  nfaSubset: string[];
  symbol: string;
  targetNfaSubset: string[];
  targetDfaStateName: string;
  isNewState: boolean;
  explanation: string;
  moveSet: string[];
  epsilonClosureSet: string[];
}

export interface SubsetConstructionResult {
  originalAutomaton: Automaton;
  dfa: Automaton;
  steps: SubsetConstructionStep[];
  stateMapping: Record<string, string[]>;
  reachableSubsets: string[][];
}

export interface PartitionGroup {
  name: string;
  states: string[];
}

export interface MinimizationStep {
  stepIndex: number;
  title: string;
  partitions: string[][];
  distinguishedReason?: string;
  explanation: string;
  tableSnapshot?: { state: string; transitions: Record<string, string> }[];
  /** Semantic animation data for the minimization laboratory. */
  phase?: 'REACHABILITY' | 'INITIAL_PARTITION' | 'CHECK_TRANSITION' | 'SPLIT' | 'STABLE' | 'MERGE' | 'BUILD_STATE' | 'BUILD_TRANSITION' | 'VERIFY';
  activeStateIds?: string[];
  activeTransitions?: Transition[];
  activeSymbol?: string;
  destinationState?: string;
}

export interface MinimizationResult {
  originalDfa: Automaton;
  minimalDfa: Automaton;
  unreachableRemoved: string[];
  initialPartitions: string[][];
  finalPartitions: string[][];
  equivalenceClasses: Record<string, string[]>;
  steps: MinimizationStep[];
}

export type ASTNodeType = 'LITERAL' | 'EPSILON' | 'EMPTY' | 'UNION' | 'CONCAT' | 'STAR' | 'PLUS';

export interface BaseASTNode {
  type: ASTNodeType;
}

export interface LiteralNode extends BaseASTNode {
  type: 'LITERAL';
  value: string;
}

export interface EpsilonNode extends BaseASTNode {
  type: 'EPSILON';
}

export interface EmptyNode extends BaseASTNode {
  type: 'EMPTY';
}

export interface UnionNode extends BaseASTNode {
  type: 'UNION';
  left: ASTNode;
  right: ASTNode;
}

export interface ConcatNode extends BaseASTNode {
  type: 'CONCAT';
  left: ASTNode;
  right: ASTNode;
}

export interface StarNode extends BaseASTNode {
  type: 'STAR';
  child: ASTNode;
}

export interface PlusNode extends BaseASTNode {
  type: 'PLUS';
  child: ASTNode;
}

export type ASTNode = LiteralNode | EpsilonNode | EmptyNode | UnionNode | ConcatNode | StarNode | PlusNode;

export interface ThompsonFragment {
  startState: string;
  acceptState: string;
  states: string[];
  transitions: Transition[];
}

export interface ThompsonStep {
  stepIndex: number;
  subExpression: string;
  nodeType: ASTNodeType;
  fragment: ThompsonFragment;
  explanation: string;
}

export interface ThompsonResult {
  ast: ASTNode;
  automaton: Automaton;
  steps: ThompsonStep[];
}

export interface GNFAStep {
  stepIndex: number;
  eliminatedState: string;
  intermediateRegexes: Record<string, Record<string, string>>;
  formulaApplied: string;
  explanation: string;
}

export interface GNFAResult {
  rawRegex: string;
  simplifiedRegex: string;
  latexRegex: string;
  steps: GNFAStep[];
}

export interface EquivalenceResult {
  areEquivalent: boolean;
  shortestCounterexample?: string;
  acceptedByA?: boolean;
  acceptedByB?: boolean;
  divergencePair?: { stateA: string; stateB: string };
  stateCountA: number;
  stateCountB: number;
  explanation: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  stateId?: string;
  symbol?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface PumpingProofStep {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  prompt: string;
  description: string;
  mathSnippet: string;
  adversaryChoice?: string;
  userOptions?: string[];
  userSelected?: string;
  validationResult?: {
    isValid: boolean;
    message: string;
    contradictionDerived?: boolean;
  };
}

export interface PumpingLanguage {
  id: string;
  name: string;
  latex: string;
  description: string;
  alphabet: string[];
  isRegular: boolean;
  defaultP?: number;
  defaultW?: string;
  explanation: string;
  adversaryCases: {
    caseName: string;
    yConstraint: string;
    chosenI: number;
    pumpedResult: string;
    contradictionReason: string;
  }[];
}

export interface LexerToken {
  type: string;
  value: string;
  line: number;
  col: number;
  start: number;
  end: number;
  dfaPath?: string[];
}

export interface LexerRule {
  tokenType: string;
  regex: string;
  priority: number;
  color: string;
  description?: string;
}

export interface LexerResult {
  tokens: LexerToken[];
  errors: { message: string; line: number; col: number; char: string }[];
}

export interface GATEQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  type: 'MCQ' | 'MSQ' | 'NAT' | 'TRACE';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'GATE-Level' | 'GATE-Trap';
  questionText: string;
  questionLatex?: string;
  automaton?: Automaton;
  options?: { id: string; text: string; latex?: string }[];
  correctAnswers: string[];
  natRange?: [number, number];
  explanation: string;
  whyOtherWrong?: Record<string, string>;
  gateTrapAlert?: string;
  examTip?: string;
  conceptTested: string;
  beginnerExplanation?: string;
  examShortcut?: string;
  similarQuestionPrompt?: string;
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  questionId?: string;
  topic: string;
  questionSummary: string;
  userMistake: string;
  correctReasoning: string;
  trapType: string;
  counterexample?: string;
}

export interface StudentAnalytics {
  topicMastery: Record<string, number>;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTimeSeconds: number;
  history: {
    timestamp: number;
    questionId: string;
    correct: boolean;
    topic: string;
    timeSpentSeconds: number;
  }[];
}
