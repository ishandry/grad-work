
import Groq from 'groq';
const express = require('express');

const app = express();
const port = process.env.PORT || 3500;

app.use(express.json());

app.post('/callback', (req, res) => {
  const payload = req.body;
  console.log('Received callback payload:', JSON.stringify(payload, null, 2));
  res.json({ status: 'received' });
});

app.post('/exttract', async (req, res) => {
  const { lectureText } = req.body;
  if (!lectureText || !lectureText.trim()) {
    return res.status(400).json({ error: 'lectureText is required' });
  }
  console.log('Received lecture text:', lectureText);
  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      messages: [
        { role: 'system',  content: SYSTEM_PROMPT },
        { role: 'user',    content: lectureText },
      ],
    });

    const text = completion.choices[0].message.content.trim();
    return res.status(200).json({ keyTerms: text });

  } catch (err) {
    console.error('Groq Chat error:', err);
    return res.status(500).json({ error: 'Failed to extract key terms' });
  }
  console.log('Received callback payload:', JSON.stringify(payload, null, 2));
  res.json({ status: 'received' });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const handleSubmit = async (text) => {
    try {
      const res = await fetch('/api/extract-key-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureText: text }),
      });
      const result = await res.json();
      console.log('Extracted key terms:', result);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = ` `.trim();



