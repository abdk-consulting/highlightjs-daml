import { HLJSApi, Language } from "highlight.js";

export default function daml(hljs: HLJSApi): Language {
  // Daml uses Haskell-style line comments starting with --
  const LINE_COMMENT = hljs.COMMENT('--', '$');

  // Daml uses Haskell-style block comments {- ... -}
  const BLOCK_COMMENT = hljs.COMMENT(/\{-/, /-\}/, { contains: ['self'] });

  // Pragma / language extension: {-# OPTIONS_GHC ... #-}
  const PRAGMA = {
    className: 'meta',
    begin: /\{-#/,
    end: /#-\}/,
    relevance: 10
  };

  // module ModuleName where
  // import qualified DA.List as L hiding (sort)
  const MODULE_IMPORT = {
    className: 'meta',
    begin: /^\s*(?:module|import)\b/,
    end: /$/,
    contains: [
      LINE_COMMENT,
      // qualified / as / hiding sub-keywords
      {
        className: 'keyword',
        begin: /\b(?:qualified|as|hiding)\b/
      },
      // module/package name: starts with uppercase
      {
        className: 'title.class',
        begin: /[A-Z][\w.]*/
      },
      // import hiding/explicit list  (...)
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          { className: 'title', begin: /[A-Za-z_]\w*/ }
        ]
      }
    ]
  };

  // template TemplateName
  const TEMPLATE_DEF = {
    begin: /\btemplate\b/,
    className: 'keyword',
    relevance: 5,
    starts: {
      end: /(?=\bwith\b|\bwhere\b|\n\s*\n)/,
      contains: [
        { className: 'title.class', begin: /[A-Z]\w*/, relevance: 0 }
      ]
    }
  };

  // interface InterfaceName  /  interface instance I for T
  const INTERFACE_DEF = {
    begin: /\binterface\b/,
    className: 'keyword',
    starts: {
      end: /(?=\bwith\b|\bwhere\b|\bfor\b|\n)/,
      keywords: { keyword: 'instance for' },
      contains: [
        { className: 'title.class', begin: /[A-Z]\w*/, relevance: 0 }
      ]
    }
  };

  // choice [nonconsuming|preconsuming|postconsuming] ChoiceName
  const CHOICE_DEF = {
    begin: /\b(?:nonconsuming|preconsuming|postconsuming)?\s*choice\b/,
    className: 'keyword',
    starts: {
      end: /(?=:|\bwith\b|\bcontroller\b)/,
      contains: [
        { className: 'title.function', begin: /[A-Z]\w*/, relevance: 0 }
      ]
    }
  };

  // exception ExceptionName
  const EXCEPTION_DEF = {
    begin: /\bexception\b/,
    className: 'keyword',
    starts: {
      end: /(?=\bwith\b|\bwhere\b|\n)/,
      contains: [
        { className: 'title.class', begin: /[A-Z]\w*/, relevance: 0 }
      ]
    }
  };

  // data / newtype / type declarations
  const DATA_DEF = {
    begin: /\b(?:data|newtype|type)\b/,
    className: 'keyword',
    starts: {
      end: /(?==|\bwhere\b|\bderiving\b|\n)/,
      contains: [
        { className: 'title.class', begin: /[A-Z]\w*/, relevance: 0 },
        // type variable (lowercase)
        { className: 'type', begin: /\b[a-z]\w*/, relevance: 0 }
      ]
    }
  };

  // class / instance declarations
  const CLASS_DEF = {
    begin: /\b(?:class|instance)\b/,
    className: 'keyword',
    starts: {
      end: /\bwhere\b/,
      returnEnd: true,
      contains: [
        { className: 'title.class', begin: /[A-Z]\w*/, relevance: 0 }
      ]
    }
  };

  // Type annotations: anything starting with an uppercase letter is treated as a
  // type name (Party, ContractId, Text, Optional, …).  Low relevance so it
  // doesn't interfere with constructor pattern use.
  const TYPE_NAME = {
    className: 'type',
    begin: /\b[A-Z]\w*/,
    relevance: 0
  };

  // Numeric literals:
  //   integer  42  -1  1_000_000
  //   decimal  3.14  1.0  -0.5
  const NUMBER = {
    className: 'number',
    variants: [
      // decimal / floating-point
      { begin: /\b\d[\d_]*\.\d[\d_]*(?:[eE][+-]?\d+)?\b/ },
      // integer (including underscore separators)
      { begin: /\b\d[\d_]*\b/ }
    ],
    relevance: 0
  };

  // Haskell-style character literals  'a'  '\n'  '\\'
  const CHAR_LITERAL = {
    className: 'string',
    begin: /'/,
    end: /'/,
    contains: [{ begin: /\\[\s\S]/ }],
    relevance: 0
  };

  // Infix operator in backticks  `elem`  `notElem`
  const BACKTICK_INFIX = {
    className: 'operator',
    begin: /`[A-Za-z_]\w*`/,
    relevance: 0
  };

  // Explicit rule for uppercase built-in identifiers so they are not
  // shadowed by the generic TYPE_NAME rule that also matches [A-Z]\w*.
  const BUILT_IN_TYPES = {
    className: 'built_in',
    begin: /\b(?:Int|Decimal|Numeric|BigNumeric|Text|Bool|Party|Date|Time|RelTime|ContractId|Optional|List|Map|Set|Enum|Update|Script|Scenario|Action)\b/,
    relevance: 0
  };

  // Uppercase literals must also be caught before TYPE_NAME.
  const LITERAL_NAMES = {
    className: 'literal',
    begin: /\b(?:True|False|None|Some)\b/,
    relevance: 0
  };

  // Daml-specific template-clause keywords: these are highly distinctive and
  // boost auto-detection relevance so `highlightAuto` identifies Daml reliably.
  const DAML_CLAUSES = {
    className: 'keyword',
    begin: /\b(?:signatory|controller|maintainer|observer)\b/,
    relevance: 3
  };

  // Daml / Haskell operators
  const OPERATOR = {
    className: 'operator',
    begin: /->|<-|=>|::|\\|[+\-*/%&|^~!<>=?@#$:.]+/,
    relevance: 0
  };

  return {
    name: 'Daml',
    aliases: ['daml'],
    keywords: {
      keyword:
        // module system
        'module import qualified as hiding ' +
        // type declarations
        'data newtype type class instance deriving where ' +
        // template / choice / interface
        'template choice interface viewtype requires implements ' +
        'nonconsuming preconsuming postconsuming ' +
        // template clauses
        'with signatory observer controller ensure key maintainer ' +
        'agreement ' +
        // exceptions
        'exception throw try catch ' +
        // do-notation / control flow
        'do let in if then else case of return ' +
        // misc Haskell-style
        'forall infixl infixr infix',
      built_in:
        // primitive types
        'Int Decimal Numeric BigNumeric Text Bool Party Date Time RelTime ' +
        // container / common types
        'ContractId Optional List Map Set Enum ' +
        // action types
        'Update Script Scenario Action ' +
        // Update primitives
        'create exercise exerciseByKey fetch fetchByKey lookupByKey ' +
        'visibleByKey archive abort assert getTime ' +
        // Script primitives
        'submit submitMustFail allocateParty getParty ' +
        'passTime passToDate ' +
        // common stdlib
        'show error debug trace not and or',
      literal: 'True False None Some'
    },
    contains: [
      // ── comments ──────────────────────────────────────────────────────────
      LINE_COMMENT,
      // PRAGMA must precede BLOCK_COMMENT: both start with {- but {-# is more specific
      PRAGMA,
      BLOCK_COMMENT,

      // ── module / import directives ─────────────────────────────────────────
      MODULE_IMPORT,

      // ── string literals ───────────────────────────────────────────────────
      hljs.QUOTE_STRING_MODE,

      // ── character literals ───────────────────────────────────────────────
      CHAR_LITERAL,

      // ── numeric literals ─────────────────────────────────────────────────
      NUMBER,

      // ── declaration openers (give high relevance for auto-detect) ─────────
      TEMPLATE_DEF,
      INTERFACE_DEF,
      CHOICE_DEF,
      EXCEPTION_DEF,
      DATA_DEF,
      CLASS_DEF,

      // ── infix in backticks ────────────────────────────────────────────────
      BACKTICK_INFIX,

      // ── operators ────────────────────────────────────────────────────────
      OPERATOR,

      // ── uppercase built-in identifiers (before generic TYPE_NAME) ────────
      BUILT_IN_TYPES,

      // ── uppercase literals (before generic TYPE_NAME) ─────────────────────
      LITERAL_NAMES,

      // ── Daml-specific clause keywords (high relevance for auto-detect) ─────
      DAML_CLAUSES,

      // ── type names ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
      TYPE_NAME
    ]
  };
}
