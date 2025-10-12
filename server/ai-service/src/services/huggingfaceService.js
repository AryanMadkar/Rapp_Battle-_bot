const { HfInference } = require('@huggingface/inference');
const config = require('../config/env');

const hf = new HfInference(config.huggingfaceApiKey);

const generateRap = async (userRap, theme = 'freestyle') => {
  try {
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

    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.9,
        top_p: 0.95,
      },
    });

    return response.generated_text || 'Error generating rap';
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    throw new Error('Failed to generate rap with Hugging Face');
  }  // ✅ Fixed: Added closing brace
};

module.exports = { generateRap };
