const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

(async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Testing gemini-pro...');
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const resPro = await modelPro.generateContent("Hello");
    console.log('gemini-pro OK');

    console.log('Testing gemini-1.5-flash...');
    try {
      const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      await modelFlash.generateContent("Hello");
      console.log('gemini-1.5-flash OK');
    } catch (e) {
      console.log('gemini-1.5-flash Failed:', e.message);
    }
  } catch (e) {
    console.error('Fatal Error:', e.message);
  }
  process.exit();
})();
