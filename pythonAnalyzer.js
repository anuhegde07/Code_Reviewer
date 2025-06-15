// js/pythonAnalyzer.js
// Python analyzer using Pyodide

window.pyAnalyzer = (() => {
  let pyodide = null;

  async function initializePyodide() {
    if (pyodide) return;
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    });
  }

  async function analyzePython(code) {
    if (!pyodide) throw new Error("Pyodide not initialized.");
    const errors = [];
    const suggestions = [];
    let fixedCode = code;

    if (/\t/.test(code)) {
      suggestions.push('Avoid tabs; use spaces for indentation.');
    }

    // Compile to check errors
    try {
      pyodide.runPython(`
      import sys
      sys.modules["__main__"].__dict__.clear()
      `);

      pyodide.runPython(`
compile_code = compile(${JSON.stringify(code)}, "<input>", "exec")
`);
    } catch (err) {
      errors.push(`SyntaxError: ${err.message}`);
      return { errors, suggestions, fixedCode };
    }

    try {
      await pyodide.runPythonAsync(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

f_stdout = io.StringIO()
f_stderr = io.StringIO()
with redirect_stdout(f_stdout), redirect_stderr(f_stderr):
    exec(compile_code)
`);
    } catch (err) {
      errors.push(`RuntimeError: ${err.message}`);
    }

    if (/range$len$.*$$/.test(code)) {
      suggestions.push("Prefer directly iterating over items instead of using 'for i in range(len(...))' for better readability.");
    }
    if (/== None/.test(code)) {
      suggestions.push("Use 'is None' instead of '== None' for None comparisons.");
    }
    if (/print [^(\n]/.test(code)) {
      suggestions.push("Use print() function with parentheses for Python 3 compatibility.");
    }

    fixedCode = fixedCode.replace(/\t/g, "  ");
    fixedCode = fixedCode.replace(/^(\s*)print\s+(['"].*['"])\s*$/gm, "$1print($2)");

    return {
      errors: errors.length ? errors : ["No syntax or runtime errors detected."],
      suggestions,
      fixedCode,
    };
  }

  return { initializePyodide, analyzePython };
})();