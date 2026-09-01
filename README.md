# KLEENEFORGE — The Intelligent Automata Reasoning Lab

> **“Build it. Convert it. Prove it. Master it.”**

**KleeneForge** is an advanced interactive learning laboratory and reasoning platform for Formal Languages & Automata Theory. Built for university students, professors, and GATE Computer Science aspirants, it pairs a **100% deterministic, mathematically verified automata & regex core computation engine** with an interactive **Reasoning Pipeline**, visual state diagram editor, step-by-step interactive derivations, automated counterexample generator, Pumping Lemma proof lab, Lexical Analysis studio, GATE exam simulator, and an AI-guided Socratic mentor ("Kleene Mentor").

---

## ⚡ Key Highlights & Core Differentiators

1. **Zero Mathematical Hallucinations**:
   - All conversions ($NFA \to DFA$, $\varepsilon\text{-closure}$, $DFA \text{ Minimization}$, $GNFA \to Regular Expression$, $Thompson's Construction$, $Product Automaton Equivalence$, $Shortest Counterexample BFS$) are calculated **100% deterministically** by tested algorithms rather than an LLM.
2. **Interactive Reasoning Pipeline**:
   - Every transformation visually reveals: `QUESTION` $\to$ `UNDERSTAND` $\to$ `BUILD` $\to$ `CONVERT` $\to$ `VERIFY` $\to$ `EXPLAIN` $\to$ `PRACTICE`.
3. **Check My Answer & Counterexample Pinpointer**:
   - Test custom drawn automata against target language specifications. If incorrect, the engine searches the state space for the **shortest distinguishing counterexample string** and highlights the exact divergence state.
4. **Interactive Pumping Lemma Proof Lab**:
   - 5-stage adversarial proof laboratory respecting formal quantifiers. Includes a deterministic "Check My Proof" analyzer.
5. **Lexical Analysis & Program Constructs Studio**:
   - Real-time compiler scanner mapping source code tokens directly to DFA paths using Maximal-Munch (Longest Match).
6. **GATE Practice Arena & Trap Detector**:
   - MCQ, MSQ, NAT, and string trace drills with conceptual trap alerts and 30-minute timed mock exams.
7. **AI Kleene Mentor**:
   - Socratic avatar tutor with textbook/handwritten diagram vision OCR and student confirmation safeguards.

---

## 📚 Complete Syllabus Coverage (19/19 Topics)

1. Deterministic Finite Automata (DFA)
2. Non-Deterministic Finite Automata (NFA)
3. $\varepsilon$-NFA / Epsilon Transitions
4. NFA $\to$ DFA Conversion (Subset Construction)
5. $\varepsilon$-NFA $\to$ DFA Conversion ($\varepsilon$-closure tracking)
6. DFA Minimization (Partition Refinement / Hopcroft's Algorithm)
7. Regular Expressions
8. DFA $\to$ Regular Expression (GNFA / State Elimination)
9. NFA $\to$ Regular Expression
10. $\varepsilon$-NFA $\to$ Regular Expression
11. Regular Expression $\to$ $\varepsilon$-NFA (Thompson's Construction)
12. Regular Expression $\to$ DFA
13. Equivalence of Finite Automata and Regular Expressions
14. Regular Languages & Closure Properties
15. Pumping Lemma for Regular Languages
16. Lexical Analysis using Finite Automata
17. Lexical Analysis using Regular Expressions
18. Program Constructs using Regular Expressions
19. GATE-Style Problems & Trap Analysis

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (or yarn / pnpm)

### Setup & Run Locally

```bash
# 1. Navigate to project root
cd kleeneforge

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Run Automated Tests

```bash
# Run unit & property-based test suite (Vitest)
npm run test
# or
npx vitest run
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🏗️ Architecture & Project Structure

```
kleeneforge/
├── src/
│   ├── core/                        # Deterministic Math & Automata Engine
│   │   ├── types.ts                 # Formal types for Automata, AST, Proofs
│   │   ├── simulation.ts            # DFA, NFA, ε-NFA execution traces & batch tester
│   │   ├── epsilonClosure.ts        # ε-closure computation with step tracking
│   │   ├── subsetConstruction.ts    # NFA/ε-NFA → DFA with detailed step-by-step reasoning
│   │   ├── minimization.ts          # Hopcroft / Partition Refinement with partition history
│   │   ├── equivalence.ts           # Product automaton, language equivalence & shortest counterexample BFS
│   │   ├── validation.ts            # Automata error/warning detector (missing transitions, unreachable, etc.)
│   │   ├── regex/
│   │   │   ├── tokenizer.ts         # Precedence-aware regex lexer
│   │   │   ├── parser.ts            # Recursive descent AST parser
│   │   │   ├── thompson.ts          # Thompson's construction (Regex → ε-NFA)
│   │   │   ├── gnfa.ts              # State elimination (DFA/NFA → GNFA → Regex)
│   │   │   └── simplifier.ts        # Algebraic regex simplification rules
│   │   ├── pumping/
│   │   │   ├── languages.ts         # Catalog of regular & non-regular languages
│   │   │   └── proofChecker.ts      # 5-stage adversarial proof validator for Pumping Lemma
│   │   ├── lexer/
│   │   │   ├── lexerEngine.ts       # Lexer generator from regex tokens
│   │   │   └── programConstructs.ts # Real-world language constructs (ident, number, comment, etc.)
│   │   ├── presets.ts               # Curated library of famous automata and textbook problems
│   │   └── gateQuestions.ts         # High-yield GATE question bank with traps & tips
│   ├── components/
│   │   ├── canvas/                  # Interactive Graph Editor (@xyflow/react)
│   │   ├── pipeline/                # Reasoning Pipeline, Table View, Explanations
│   │   ├── conversion/              # Conversion Lab
│   │   ├── regexLab/                # Regex Studio & AST Visualizer
│   │   ├── pumpingLab/              # Pumping Lemma Lab & Proof Checker
│   │   ├── gateArena/               # GATE Exam & Practice Arena
│   │   ├── lexicalLab/              # Lexical Analysis Studio
│   │   ├── languageLab/             # Language Explorer & Decider
│   │   ├── verification/            # Check My Answer & Equivalence Checker
│   │   ├── aiTutor/                 # AI Kleene Mentor (Avatar & OCR)
│   │   ├── analytics/               # Learning Analytics & Mistake Notebook
│   │   └── common/                  # Navbar, Hero, MathDisplay, ModeSelector
│   ├── store/                       # Application & Analytics state stores
│   └── tests/                       # Automated Vitest unit & property tests
```

---

## 🌐 Production Deployment Guide

### Deploying on Vercel

1. Push your repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Vercel automatically detects the Vite framework settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in the Vercel dashboard:
   - `VITE_GEMINI_API_KEY`: *(Your secure API key)*
5. Click **Deploy**.

---

## 🛡️ License

Academic and Educational Use License. Built for rigorous Computer Science and Automata Theory instruction.
