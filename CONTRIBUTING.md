# Developer Guide — highlightjs-daml

A [Highlight.js](https://highlightjs.org/) language plugin that adds syntax
highlighting for [Daml](https://www.digitalasset.com/developers) — the
smart contract language developed by Digital Asset.

---

## Repository layout

```
highlightjs-daml/
├── src/
│   ├── index.ts            ← language definition (single source file)
│   └── test/
│       └── index.test.ts   ← test suite (Node.js built-in test runner)
├── dist/                   ← compiled output (git-ignored, npm-published)
│   ├── index.js
│   ├── index.d.ts
│   └── *.map
├── .github/
│   └── workflows/
│       └── ci.yml          ← GitHub Actions CI (build + test on every push/PR)
├── .gitignore
├── .npmignore              ← controls what's excluded from the npm tarball
├── package.json
├── tsconfig.json
├── LICENSE                 ← MIT
├── CONTRIBUTING.md         ← this file (developer docs)
└── README.md               ← public docs shown on npmjs.com
```

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 LTS |
| npm | 9 |

Install dependencies:

```bash
npm install
```

---

## Building

```bash
npm run build          # compile TypeScript → dist/
npm run build:watch    # watch mode
npm run clean          # remove dist/
```

The TypeScript compiler is configured via `tsconfig.json`:

- **`rootDir`** — `src/`  
- **`outDir`** — `dist/`  
- **`declaration`** — `true` → `.d.ts` files are emitted  
- **`declarationMap`** — `true` → source-map for `.d.ts` files  
- **`sourceMap`** — `true` → `.js.map` files for debugging  

---

## Testing

```bash
npm test
```

This first compiles the project and then runs the tests with the Node.js
built-in test runner (`node:test`) — no extra test-framework dependency.

The test suite lives in `src/test/index.test.ts` and covers:

| Area | What is tested |
|------|---------------|
| Comments | `-- …` line comments, `{- … -}` block comments |
| Pragma | `{-# … #-}` meta span |
| Module / import | `module` and `import` meta spans |
| Keywords | All language keywords in isolation |
| Built-ins | Types and functions (`Party`, `create`, `exercise`, …) |
| Literals | `True`, `False`, `None`, `Some` |
| Numeric literals | Integer, decimal, underscore-separated |
| String literals | Double-quoted strings |
| Operators | `->`, `<-`, `=>`, `::` |
| Full template snippet | End-to-end highlight of an `Iou` template |
| Auto-detection (positive) | Daml templates correctly identified by `highlightAuto` |
| Auto-detection (negative) | JS, Python, Rust not mis-identified as Daml |

---

## Linting / type checking

```bash
npm run lint    # runs tsc --noEmit (no output files written)
```

---

## Publishing to npm

The `prepublishOnly` script runs the full build and test suite automatically:

```bash
npm publish
```

To do a dry-run first:

```bash
npm pack --dry-run
```

---

## CI

GitHub Actions runs the build and test matrix (Node.js 18, 20, 22) on every
push and pull request via `.github/workflows/ci.yml`.
