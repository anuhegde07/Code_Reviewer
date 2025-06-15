// js/analyzer.js
// Main orchestrator for analyzing input code

const languageSelect = document.getElementById('language-select');
const codeInput = document.getElementById('code-input');
const analyzeBtn = document.getElementById('analyze-btn');
const errorsOutput = document.getElementById('errors-output');
const suggestionsOutput = document.getElementById('suggestions-output');
const correctedCodeOutput = document.getElementById('corrected-code-output');
const loadingOverlay = document.getElementById('loadingOverlay');

async function initialize() {
  loadingOverlay.style.display = 'flex';
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Loading analyzers...';

  // Wait for pyodide to initialize
  await window.pyAnalyzer.initializePyodide();

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = 'Analyze Code';
  loadingOverlay.style.display = 'none';
}

function clearOutputs() {
  errorsOutput.textContent = '';
  suggestionsOutput.textContent = '';
  correctedCodeOutput.textContent = '';
}

function displayResult(errors, suggestions, fixedCode ) {
  errorsOutput.textContent = Array.isArray(errors) ? errors.join('\n\n') : 'No errors detected.';
  suggestionsOutput.textContent = Array.isArray(suggestions) ? suggestions.join('\n\n') : 'No suggestions.';
  correctedCodeOutput.textContent = fixedCode;
}

analyzeBtn.addEventListener('click', async () => {
  clearOutputs();

  const lang = languageSelect.value;
  const code = codeInput.value.trim();

  if (!code) {
    errorsOutput.textContent = 'Please enter some code to analyze.';
    return;
  }

  errorsOutput.textContent = 'Analyzing...';
  suggestionsOutput.textContent = 'Analyzing...';
  correctedCodeOutput.textContent = 'Analyzing...';

  try {
    let result;

    if (lang === 'javascript') {
      result = await window.jsAnalyzer.analyzeJavaScript(code);
    } else if (lang === 'python') {
      result = await window.pyAnalyzer.analyzePython(code);
    } else if (lang === 'java') {
      result = window.javaAnalyzer.analyzeJava(code);
    } else {
      result = {
        errors: ['Unsupported language selected.'],
        suggestions: [],
        fixedCode: code,
      };
    }
    displayResult(result.errors,result.suggestions,result.fixedCode);
  } catch(e) {
    errorsOutput.textContent = `Analysis error: ${e.message}`;
    suggestionsOutput.textContent = '';
    correctedCodeOutput.textContent = '';
  }
});

window.addEventListener('load', () => {
  initialize();
});