const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');


const app = express();
const PORT = 3000;

// WARNING: Don't expose real API keys in production
const OPENAI_API_KEY = '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';
app.use(cors());
//   origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // allow only your frontend
//   methods: ['GET', 'POST'],
// }));
app.use(express.json());
// app.use(bodyParser.json());

app.post('/api/analyze', async (req, res) => {
  const { code, language } = req.body;

  const systemPrompt = {
    java: "You are a Java code reviewer. Suggest improvements in the code.",
    javascript: "You are a JavaScript code reviewer. Suggest improvements.",
    python: "You are a Python code reviewer. Suggest improvements.",
  }[language?.toLowerCase()] || "You are a helpful code reviewer.";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "openai/gpt-3.5-turbo",  // or other models like mistralai/mistral-7b
    messages: [
      { role: "system", content: "You are a code reviewer..." },
      { role: "user", content: code }
    ]
  })
});

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(429).json({ error: data.error.message });
    }

    res.json({ suggestions: data.choices[0].message.content });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
