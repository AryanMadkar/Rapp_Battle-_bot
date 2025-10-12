const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const generateRap = async (userRap, theme = 'freestyle') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a skilled battle rapper. The user just dropped this rap bar:

"${userRap}"

Theme: ${theme}

Now it's your turn! Drop a hard-hitting rap response that:
1. Responds directly to what they said
2. Uses clever wordplay and metaphors
3. Has good flow and rhythm
4. Is 4-8 lines long
5. Keeps it creative and fun

Your rap response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'Error generating rap';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate rap with Gemini');
  }  // ✅ Fixed: Added closing brace
};

module.exports = { generateRap };
