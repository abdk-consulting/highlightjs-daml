# highlightjs-daml

[![npm version](https://img.shields.io/npm/v/highlightjs-daml.svg)](https://www.npmjs.com/package/highlightjs-daml)
[![CI](https://github.com/abdk-consulting/highlightjs-daml/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/abdk-consulting/highlightjs-daml/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Highlight.js](https://highlightjs.org/) language plugin that adds rich
syntax highlighting for **[DAML](https://www.digitalasset.com/developers)** —
the smart contract language developed by Digital Asset for building
multi-party workflows on distributed ledgers.

---

## Features

- Full keyword coverage: `template`, `choice`, `interface`, `signatory`,
  `observer`, `controller`, `with`, `where`, `do`, and all standard
  Haskell-style keywords
- Template, interface, and exception declarations with class name highlighting
- Choice declarations highlighted as function titles
- Module and import directives highlighted as meta
- DAML/Haskell pragmas (`{-# OPTIONS_GHC … #-}`)
- Built-in types and functions: `Party`, `ContractId`, `Text`, `Decimal`,
  `create`, `exercise`, `fetch`, `archive`, and more
- Literals: `True`, `False`, `None`, `Some`
- Haskell-style line (`--`) and block (`{- … -}`) comments
- Numeric literals with underscore separators (`1_000_000`)
- Haskell-style character literals (`'a'`, `'\n'`)
- Type names highlighted as `type`
- Infix operators in backticks (`` `elem` ``)
- Standard and Haskell-specific operators (`->`, `<-`, `=>`, `::`, `\`, …)
- Correct auto-detection: DAML templates reliably identified via `highlightAuto`

---

## Installation

```bash
npm install highlightjs-daml
```

> `highlight.js` ≥ 11 is a peer dependency — install it separately if you
> haven't already:
>
> ```bash
> npm install highlight.js
> ```

---

## Usage

### CommonJS / Node.js

```js
const hljs = require("highlight.js");
const daml = require("highlightjs-daml");

hljs.registerLanguage("daml", daml.default ?? daml);

const code = `
template Iou
  with
    issuer : Party
    owner  : Party
    amount : Decimal
  where
    signatory issuer
    observer owner

    choice Transfer : ContractId Iou
      with newOwner : Party
      controller owner
      do
        create this with owner = newOwner
`.trim();

const html = hljs.highlight(code, { language: "daml" }).value;
console.log(html);
```

### ES Modules

```js
import hljs from "highlight.js";
import daml from "highlightjs-daml";

hljs.registerLanguage("daml", daml);

const result = hljs.highlight(code, { language: "daml" });
```

### Browser (CDN)

Load Highlight.js first, then load this plugin:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"></script>
<!-- highlightjs-daml -->
<script src="https://unpkg.com/highlightjs-daml/dist/index.js"></script>
<script>
  hljs.registerLanguage("daml", window.hljsDaml?.default ?? window.hljsDaml);
  hljs.highlightAll();
</script>
```

Then mark up your code blocks:

```html
<pre><code class="language-daml">
template Asset
  with
    issuer : Party
    owner  : Party
    name   : Text
  where
    signatory issuer
    observer owner

    choice Give : ContractId Asset
      with newOwner : Party
      controller owner
      do create this with owner = newOwner
</code></pre>
```

### Auto-detection

The plugin registers DAML with high-relevance rules on template/choice/signatory
constructs so `highlightAuto` correctly identifies DAML source files:

```js
const result = hljs.highlightAuto(unknownCode);
console.log(result.language); // "daml"
```

---

## Supported syntax elements

| Element | Highlight class |
|---------|----------------|
| `module`, `import` | `hljs-meta` |
| Pragmas `{-# … #-}` | `hljs-meta` |
| Keywords (`template`, `choice`, `signatory`, …) | `hljs-keyword` |
| Template / exception / data names | `hljs-title class_` |
| Choice names | `hljs-title function_` |
| Built-in types and functions | `hljs-built_in` |
| Type names (uppercase identifiers) | `hljs-type` |
| Literals (`True`, `False`, `None`, `Some`) | `hljs-literal` |
| String literals | `hljs-string` |
| Character literals | `hljs-string` |
| Numeric literals | `hljs-number` |
| Operators (`->`, `<-`, `::`, `=>`, …) | `hljs-operator` |
| Infix in backticks | `hljs-operator` |
| Comments (`--`, `{- … -}`) | `hljs-comment` |

---

## Example

```daml
module Finance where

import DA.List (sortOn)

template Iou
  with
    issuer : Party
    owner  : Party
    amount : Decimal
    currency : Text
  where
    signatory issuer
    observer owner

    ensure amount > 0.0

    choice Transfer : ContractId Iou
      with newOwner : Party
      controller owner
      do
        create this with owner = newOwner

    choice Settle : ()
      controller owner
      do
        archive self

interface Token where
  viewtype TokenView
  getOwner : Party
  getAmount : Decimal
```

---

## Compatibility

| highlight.js | highlightjs-daml |
|--------------|-----------------|
| ≥ 11.0.0 | ✓ |

---

## License

[MIT](LICENSE) © ABDK Consulting
