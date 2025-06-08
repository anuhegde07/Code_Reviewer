// Main orchestrator for analyzing input code
const languageSelect = document.getElementById('language-select');
const codeInput = document.getElementById('code-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsOutput = document.getElementById('result-output');
const errorsOutput = document.getElementById('errors-output');
const suggestionsOutput = document.getElementById('suggestions-output');
const correctedCodeOutput = document.getElementById('corrected-code-output');
const loadingOverlay = document.getElementById('loadingOverlay');

async function initialize() {
  loadingOverlay.style.display = 'flex';
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Loading analyzers...';

  // Wait for pyodide to initialize
  // await window.jsAnalyzer.initializeEslint();
  await window.pyAnalyzer.initializePyodide();

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = 'Analyze Code';
  loadingOverlay.style.display = 'none';
}

function clearOutputs() {
    resultsOutput.textContent = '';
  errorsOutput.textContent = '';
  suggestionsOutput.textContent = '';
  correctedCodeOutput.textContent = '';
}
function displayResult({ result, errors, aisuggestions, fixedCode }) {
  resultsOutput.textContent = result  || 'No results.';
  errorsOutput.textContent = errors  || 'No errors detected.';
  suggestionsOutput.textContent = aisuggestions ||  'No suggestions.';
  correctedCodeOutput.textContent = fixedCode || codeInput.value;
}

analyzeBtn.addEventListener('click', async () => {
  clearOutputs();

  const lang = languageSelect.value;
  const code = codeInput.value.trim();

  if (!code) {
    errorsOutput.textContent = 'Please enter some code to analyze.';
    return;
  }

  resultsOutput.textContent = 'Analyzing...';
  errorsOutput.textContent = 'Analyzing...';
  suggestionsOutput.textContent = 'Analyzing...';
  correctedCodeOutput.textContent = 'Analyzing...';

  try {
    let result;

    if (lang === 'javascript') {
      result = await window.jsAnalyzer.analyzeJavaScript(code);
      aisuggestions= await getAISuggestionsFrontendOnly(code, lang)
    } else if (lang === 'python') {
      result = await window.pyAnalyzer.analyzePython(code);
      aisuggestions= await getAISuggestionsFrontendOnly(code, lang)
    } else if (lang === 'java') {
      result = window.javaAnalyzer.analyzeJava(code);
      aisuggestions= await getAISuggestionsFrontendOnly(code, lang)
    } 
    else {
      result = {
        results:[],
        errors: ['Unsupported language selected.'],
        aisuggestions: [],
        fixedCode: code,
      };
    }
    displayResult(result);
  } catch(e) {
    resultsOutput.textContent = '';
    errorsOutput.textContent = `Analysis error: ${e.message}`;
    suggestionsOutput.textContent = '';
    correctedCodeOutput.textContent = '';
  }
});

window.addEventListener('load', () => {
  initialize();
});