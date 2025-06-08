async function getAISuggestionsFrontendOnly(code, language) {
  const response = await fetch("http://localhost:3000/api/analyze", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language })
  });

  const data = await response.json();

  if (data.error) {
    console.error("Error from API:", data.error);
    return "Error: " + data.error;
  }

  return data.suggestions;
}
