const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

(async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels in the client-side SDK usually, 
    // but we can try to hit a known model or check error suggestions.
    // Let's try gemini-1.5-flash again but with different naming.
    
    const testModels = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
    
    for (const m of testModels) {
      try {
        console.log(`Checking ${m}...`);
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ ${m} is AVAILABLE`);
      } catch (e) {
        console.log(`❌ ${m} error: ${e.message}`);
      }
    }
  } catch (e) {
    console.error('Fatal:', e.message);
  }
  process.exit();
})();
