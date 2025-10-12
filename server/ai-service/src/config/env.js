require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5003,
  jwtSecret: process.env.JWT_SECRET,
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
  defaultModel: process.env.DEFAULT_MODEL || 'groq',
  nodeEnv: process.env.NODE_ENV || 'development',
};
