const groqService = require('../services/groqService');
const geminiService = require('../services/geminiService');
const huggingfaceService = require('../services/huggingfaceService');
const judgeService = require('../services/judgeService');

// @desc Generate AI rap response
// @route POST /api/ai/generate
// @access Private

const judgeRapBattle = async (req, res) => {
  try {
    const { userRap, aiRap, theme } = req.body;

    if (!userRap || !aiRap) {
      return res.status(400).json({
        success: false,
        message: 'Both userRap and aiRap are required'
      });
    }

    const judgment = await judgeService.judgeRapBattle(userRap, aiRap, theme);

    res.json({
      success: true,
      data: judgment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const generateRap = async (req, res) => {
  try {
    const { userRap, theme, model } = req.body;

    if (!userRap) {
      return res.status(400).json({
        success: false,
        message: 'User rap is required'
      });
    }  // ✅ Fixed: Added closing brace

    let aiRap;
    const selectedModel = model || 'groq';

    // Route to appropriate AI service
    switch (selectedModel) {
      case 'gemini':
        aiRap = await geminiService.generateRap(userRap, theme);
        break;
      case 'huggingface':
        aiRap = await huggingfaceService.generateRap(userRap, theme);
        break;
      case 'groq':
      default:
        aiRap = await groqService.generateRap(userRap, theme);
        break;
    }  // ✅ Fixed: Added closing brace for switch

    res.json({
      success: true,
      data: {
        aiRap,
        model: selectedModel,
        theme: theme || 'freestyle',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI rap',
      error: error.message,
    });
  }
};

// @desc Test AI service
// @route GET /api/ai/test
// @access Private
const testAI = async (req, res) => {
  try {
    const testRap = "Yo I'm the best rapper in the game";
    const aiRap = await groqService.generateRap(testRap);

    res.json({
      success: true,
      message: 'AI service working!',
      data: {
        testInput: testRap,
        aiResponse: aiRap,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'AI service test failed',
      error: error.message,
    });
  }
};
const generateConversationalResponse = async (req, res) => {
  try {
    const { userRap, theme, model, conversationHistory, roundNumber } = req.body;

    if (!userRap) {
      return res.status(400).json({
        success: false,
        message: 'User rap is required'
      });
    }

    const selectedModel = model || 'groq';

    // Build context-aware prompt with conversation history
    let contextPrompt = `You are in a rap battle. Theme: ${theme || 'freestyle'}. This is round ${roundNumber || 1}.

`;

    if (conversationHistory && conversationHistory.length > 0) {
      contextPrompt += `Previous exchanges:\n`;
      conversationHistory.forEach((entry, index) => {
        contextPrompt += `Round ${entry.roundNumber} - ${entry.speaker === 'user' ? 'Opponent' : 'You'}: ${entry.text}\n`;
      });
      contextPrompt += `\n`;
    }

    contextPrompt += `Opponent's latest bars:\n${userRap}\n\nNow spit your response! Keep it sharp, aggressive, and no more than 8 bars. Make it hit hard!`;

    let aiRap;

    // Route to appropriate AI service with context
    switch (selectedModel) {
      case 'gemini':
        aiRap = await geminiService.generateRap(contextPrompt, theme);
        break;
      case 'huggingface':
        aiRap = await huggingfaceService.generateRap(contextPrompt, theme);
        break;
      case 'groq':
      default:
        aiRap = await groqService.generateRap(contextPrompt, theme);
        break;
    }

    res.json({
      success: true,
      data: {
        aiRap,
        model: selectedModel,
        theme: theme || 'freestyle',
        roundNumber: roundNumber || 1,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  generateRap,
  testAI,
  judgeRapBattle, // Export new function
  generateConversationalResponse
};
