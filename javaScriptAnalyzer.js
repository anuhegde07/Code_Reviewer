async function waitForESLintReady() {
  return new Promise((resolve) => {
    (function check() {
      if (window.jsAnalyzer && typeof window.jsAnalyzer.analyzeJavaScript === 'function') {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    })();
  });
}

async function initialize() {
  loadingOverlay.style.display = 'flex';
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Loading analyzers...';

  // Wait for ESLint and Pyodide
  await waitForESLintReady();
  await window.pyAnalyzer.initializePyodide();

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = 'Analyze Code';
  loadingOverlay.style.display = 'none';
}

// JavaScript analyzer using ESLint

window.jsAnalyzer = (() => {
  // let eslint4b = null;
  const lintErrors=[];
  async function analyzeJavaScript(code) {
    const initialConfig = {
    env: {
    browser: true,
    es6: true
    },
    parserOptions: {
    ecmaVersion: 2020
    },
    rules: {
    semi: 2,
    "no-unused-vars": 1,
    "no-undef": 1
    }
  };

const fullConfig = {
  env: { browser: true, es6: true, node: true },
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  rules: {
    semi: ["warn", "always"],
    "no-unused-vars": ["warn"],
    "no-undef": "error",
    "no-debugger": "warn",
    "no-console": "off",
    eqeqeq: "warn",
    curly: "warn",
    "no-extra-bind": "warn",
    "no-func-assign": "error",
    "no-implied-eval": "warn",
    "no-empty-function": "warn",
    complexity: ["warn", { max: 8 }],
  },
};

const linter = new window.eslint.Linter();

// Step 1: Fix code
const { output: fixedCode } = linter.verifyAndFix(code, initialConfig);

// Step 2: Run full lint analysis on original code (or fixedCode)
const messages = linter.verify(code, fullConfig);

    const errors = [];
    const suggestions = [];

    messages.forEach((msg) => {
      const level = msg.severity === 2 ? "Error" : "Warning";
      const rule = msg.ruleId ? ` [${msg.ruleId}]` : "";
      errors.push(
        `${level} (Line ${msg.line}, Col ${msg.column}): ${msg.message}${rule}`
      );
      switch (msg.ruleId) {
        case "semi":
          suggestions.push("Add missing semicolons to terminate statements properly.");
          break;
        case "no-unused-vars":
          suggestions.push("Remove or use unused variables to clean code.");
          break;
        case "no-undef":
          suggestions.push("Define or import missing variables or functions.");
          break;
        case "no-debugger":
          suggestions.push("Remove 'debugger' statements for production.");
          break;
        case "eqeqeq":
          suggestions.push("Use strict equality (===) instead of == for better type safety.");
          break;
        case "curly":
          suggestions.push("Always use curly braces for blocks to avoid mistakes.");
          break;
        default:
          suggestions.push(`Check rule: ${msg.ruleId} for details.`);
          break;
      }
    });

    // Attempt auto-fix
    // try {
    //   const fixResult = linter.verifyAndFix(code, config);
    //   fixedCode = fixResult.output;
    // } catch {
    //   // no-op
    // }

    // Heuristic suggestions
    if (/for\s*\(var\s+\w+\s*=/.test(code)) {
      suggestions.push("Consider using 'let' instead of 'var' for block scoping in loops.");
    }
    if (/==/.test(code) && !/===/.test(code)) {
      suggestions.push("Use '===' instead of '==' to avoid unexpected type coercions.");
    }
    console.log(lintErrors);
    return { 
            errors:lintErrors? errors : ["No syntax or runtime errors detected."],
            suggestions,
            fixedCode,
    };
}

  return { analyzeJavaScript };
}) ();
