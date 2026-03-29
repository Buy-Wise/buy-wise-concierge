const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

(async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI key');
      process.exit(1);
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 5
    });
    console.log('OpenAI OK:', response.choices[0].message.content);
  } catch (e) {
    console.log('OpenAI Failed:', e.message);
  }
  process.exit();
})();
