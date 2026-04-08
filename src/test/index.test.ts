/**
 * Comprehensive test suite for highlightjs-daml.
 *
 * Uses Node.js built-in test runner (node:test) and assert — no extra
 * dependencies needed beyond highlight.js itself.
 *
 * Run:  npm test
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import hljs from "highlight.js";
import daml from "../index.js";

// Register the language once for all tests.
hljs.registerLanguage("daml", daml);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Decode the five standard HTML entities so that assertions can be written
 * against the original source characters instead of their escaped forms.
 */
function decodeEntities(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Highlight `code` with the given `language` and return the decoded HTML.
 */
function highlight(code: string, language: string): string {
  return decodeEntities(hljs.highlight(code, { language }).value);
}

/**
 * Auto-detect the language for `code` and return the detected language name.
 */
function detect(code: string): string {
  const result = hljs.highlightAuto(code);
  return result.language ?? "";
}

/**
 * Assert that `html` contains a span with the given CSS class that either:
 *  (a) directly wraps `text` as its ONLY content, OR
 *  (b) begins with the class and contains `text` as literal (unspanned) text
 *      directly inside it (the MODULE_IMPORT case where hljs wraps the
 *      entire directive in one outer meta-span).
 */
function assertSpan(html: string, cls: string, text: string): void {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Case (a): span wraps text directly — no child spans around it
  const directRe = new RegExp(`<span class="${cls}"[^>]*>${escaped}<\\/span>`);
  // Case (b): outer span contains text as raw (untagged) content somewhere inside
  const outerRe = new RegExp(
    `<span class="${cls}"[^>]*>[^<]*(?:<span[^>]*>[^<]*<\\/span>[^<]*)*${escaped}`
  );
  assert.ok(
    directRe.test(html) || outerRe.test(html),
    `Expected span.${cls} containing "${text}"\nActual HTML:\n${html}`
  );
}

// ---------------------------------------------------------------------------
// 1. Comments
// ---------------------------------------------------------------------------

describe("comments", () => {
  it("highlights single-line comment (--)", () => {
    const html = highlight("-- this is a comment", "daml");
    assertSpan(html, "hljs-comment", "-- this is a comment");
  });

  it("highlights block comment ({- ... -})", () => {
    const html = highlight("{- block -}", "daml");
    assertSpan(html, "hljs-comment", "{- block -}");
  });

  it("highlights multi-line block comment", () => {
    const html = highlight("{- line1\n   line2 -}", "daml");
    assert.match(
      html,
      /class="hljs-comment"/,
      "Block comment should be highlighted"
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Pragma
// ---------------------------------------------------------------------------

describe("pragma", () => {
  it("highlights pragma as meta (not comment)", () => {
    const html = highlight("{-# OPTIONS_GHC -Wall #-}", "daml");
    // The pragma should be meta, not comment
    assert.match(html, /class="hljs-meta"/, "pragma should be hljs-meta");
    assert.doesNotMatch(
      html,
      /class="hljs-comment"/,
      "pragma should not be hljs-comment"
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Module / import directives
// ---------------------------------------------------------------------------

describe("module and import directives", () => {
  it("highlights `module` as meta", () => {
    const html = highlight("module Main where", "daml");
    assertSpan(html, "hljs-meta", "module");
  });

  it("highlights `import` as meta", () => {
    const html = highlight("import DA.List", "daml");
    assertSpan(html, "hljs-meta", "import");
  });
});

// ---------------------------------------------------------------------------
// 4. Keywords
// ---------------------------------------------------------------------------

describe("keywords", () => {
  const kws = [
    // module/import intentionally omitted: they render as hljs-meta (not hljs-keyword)
    // when appearing in isolation, by design of the MODULE_IMPORT rule
    "qualified", "as", "hiding",
    "data", "newtype", "type", "class", "instance", "deriving", "where",
    "template", "choice", "interface", "viewtype", "requires", "implements",
    "nonconsuming", "preconsuming", "postconsuming",
    "with", "signatory", "observer", "controller", "ensure", "key",
    "maintainer", "agreement",
    "exception", "throw", "try", "catch",
    "do", "let", "in", "if", "then", "else", "case", "of",
    "forall", "infixl", "infixr", "infix",
  ];

  for (const kw of kws) {
    it(`highlights keyword \`${kw}\``, () => {
      const html = highlight(`${kw} `, "daml");
      assertSpan(html, "hljs-keyword", kw);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Built-ins
// ---------------------------------------------------------------------------

describe("built-ins", () => {
  const builtins = [
    "Party", "Text", "Bool", "Int", "Date", "Time",
    "ContractId", "Optional", "List",
    "create", "exercise", "fetch", "archive",
    "show", "error", "not",
  ];

  for (const bi of builtins) {
    it(`highlights built-in \`${bi}\``, () => {
      const html = highlight(`${bi} `, "daml");
      assertSpan(html, "hljs-built_in", bi);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. Literals
// ---------------------------------------------------------------------------

describe("literals", () => {
  it("highlights `True`", () => {
    const html = highlight("True", "daml");
    assertSpan(html, "hljs-literal", "True");
  });

  it("highlights `False`", () => {
    const html = highlight("False", "daml");
    assertSpan(html, "hljs-literal", "False");
  });

  it("highlights `None`", () => {
    const html = highlight("None", "daml");
    assertSpan(html, "hljs-literal", "None");
  });

  it("highlights `Some`", () => {
    const html = highlight("Some x", "daml");
    assertSpan(html, "hljs-literal", "Some");
  });
});

// ---------------------------------------------------------------------------
// 7. Numeric literals
// ---------------------------------------------------------------------------

describe("numeric literals", () => {
  it("highlights integer", () => {
    const html = highlight("42", "daml");
    assertSpan(html, "hljs-number", "42");
  });

  it("highlights decimal", () => {
    const html = highlight("3.14", "daml");
    assertSpan(html, "hljs-number", "3.14");
  });

  it("highlights integer with underscore separator", () => {
    const html = highlight("1_000_000", "daml");
    assertSpan(html, "hljs-number", "1_000_000");
  });
});

// ---------------------------------------------------------------------------
// 8. String literals
// ---------------------------------------------------------------------------

describe("string literals", () => {
  it("highlights double-quoted string", () => {
    const html = highlight('"hello world"', "daml");
    assertSpan(html, "hljs-string", '"hello world"');
  });
});

// ---------------------------------------------------------------------------
// 9. Operators
// ---------------------------------------------------------------------------

describe("operators", () => {
  it("highlights -> operator", () => {
    const html = highlight("->", "daml");
    assertSpan(html, "hljs-operator", "->");
  });

  it("highlights <- operator", () => {
    const html = highlight("<-", "daml");
    assertSpan(html, "hljs-operator", "<-");
  });

  it("highlights => operator", () => {
    const html = highlight("=>", "daml");
    assertSpan(html, "hljs-operator", "=>");
  });

  it("highlights :: operator", () => {
    const html = highlight("::", "daml");
    assertSpan(html, "hljs-operator", "::");
  });
});

// ---------------------------------------------------------------------------
// 10. Full template snippet
// ---------------------------------------------------------------------------

describe("full template snippet", () => {
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

  it("highlights template keyword", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-keyword", "template");
  });

  it("highlights with keyword", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-keyword", "with");
  });

  it("highlights where keyword", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-keyword", "where");
  });

  it("highlights signatory keyword", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-keyword", "signatory");
  });

  it("highlights choice keyword", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-keyword", "choice");
  });

  it("highlights Party built-in type", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-built_in", "Party");
  });

  it("highlights ContractId built-in type", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-built_in", "ContractId");
  });

  it("highlights create built-in", () => {
    const html = highlight(code, "daml");
    assertSpan(html, "hljs-built_in", "create");
  });
});

// ---------------------------------------------------------------------------
// 11. Auto-detection (positive)
// ---------------------------------------------------------------------------

describe("auto-detection (positive)", () => {
  it("detects DAML template as daml", () => {
    const code = `
template Asset
  with
    owner : Party
    name  : Text
  where
    signatory owner
    choice Archive : ()
      controller owner
      do return ()
`.trim();
    assert.equal(detect(code), "daml", "DAML template code should be auto-detected as daml");
  });
});

// ---------------------------------------------------------------------------
// 12. Auto-detection (negative — other languages not mis-detected as DAML)
// ---------------------------------------------------------------------------

describe("auto-detection (negative)", () => {
  it("does not detect JS as daml", () => {
    const code = `function greet(name) {\n  console.log("Hello, " + name);\n}\ngreet("world");`;
    assert.notEqual(detect(code), "daml");
  });

  it("does not detect Python as daml", () => {
    const code = `def greet(name):\n    print(f"Hello, {name}")\ngreet("world")`;
    assert.notEqual(detect(code), "daml");
  });

  it("does not detect Rust as daml", () => {
    const code = `fn main() {\n    let x: i32 = 42;\n    println!("{}", x);\n}`;
    assert.notEqual(detect(code), "daml");
  });
});
