const Battle = require('../models/Battle');
const axios = require('axios');
const config = require('../config/env');

// @desc Create new battle with AI generation and judging
// @route POST /api/battles
// @access Private
const createBattle = async (req, res) => {
  try {
    const { userRap, theme, aiModel } = req.body;

    // Validate user rap
    if (!userRap) {
      return res.status(400).json({
        success: false,
        message: 'User rap is required'
      });
    }

    if (userRap.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rap must be at least 10 characters'
      });
    }

    if (userRap.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Rap cannot exceed 1000 characters'
      });
    }

    console.log('🎤 Starting battle creation...');
    console.log(`User: ${req.user.username}`);
    console.log(`Theme: ${theme || 'freestyle'}`);
    console.log(`AI Model: ${aiModel || 'groq'}`);

    // Step 1: Generate AI rap response
    console.log('🤖 Calling AI service to generate response...');
    const aiResponse = await axios.post(
      `${config.aiServiceUrl}/api/ai/generate`,
      {
        userRap,
        theme: theme || 'freestyle',
        model: aiModel || 'groq',
      },
      {
        headers: {
          Authorization: req.headers.authorization,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!aiResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI rap response'
      });
    }

    const aiRap = aiResponse.data.data.aiRap;
    console.log('✅ AI rap generated successfully');

    // Step 2: Call AI judge to analyze and score both raps
    console.log('⚖️ Calling AI judge to score battle...');
    const judgmentResponse = await axios.post(
      `${config.aiServiceUrl}/api/ai/judge`,
      {
        userRap,
        aiRap,
        theme: theme || 'freestyle',
      },
      {
        headers: {
          Authorization: req.headers.authorization,
        },
        timeout: 45000, // 45 second timeout for judging
      }
    );

    if (!judgmentResponse.data.success) {
      console.error('❌ Failed to get judgment from AI');
      return res.status(500).json({
        success: false,
        message: 'Failed to judge battle'
      });
    }

    const judgment = judgmentResponse.data.data;
    console.log('✅ Battle judged successfully');
    console.log(`Winner: ${judgment.winner.toUpperCase()}`);
    console.log(`Scores - User: ${judgment.userScore}, AI: ${judgment.aiScore}`);

    // Step 3: Create battle record with all data
    const battle = await Battle.create({
      user: req.user._id,
      userRap: userRap.trim(),
      aiRap,
      theme: theme || 'freestyle',
      aiModel: aiModel || 'groq',
      winner: judgment.winner,
      scores: {
        user: judgment.userScore,
        ai: judgment.aiScore,
      },
      analysis: {
        user: judgment.userAnalysis,
        ai: judgment.aiAnalysis,
        winReason: judgment.winReason,
        overallAnalysis: judgment.overallAnalysis,
      }
    });

    console.log('💾 Battle saved to database');

    // Populate user data for response
    await battle.populate('user', 'username email');

    res.status(201).json({
      success: true,
      data: battle,
      message: `🏆 Battle complete! Winner: ${judgment.winner.toUpperCase()}`,
      stats: {
        scoreDifference: Math.abs(judgment.userScore - judgment.aiScore),
        isClose: Math.abs(judgment.userScore - judgment.aiScore) <= 1,
      }
    });
  } catch (error) {
    console.error('❌ Create battle error:', error.message);
    
    // Handle specific errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.'
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data.message || 'AI service error'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create battle'
    });
  }
};

// @desc Get user's battle history
// @route GET /api/battles
// @access Private
const getBattles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Battle.countDocuments({ user: req.user._id });

    // Get battles with pagination
    const battles = await Battle.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version key

    // Calculate stats
    const stats = {
      total,
      wins: battles.filter(b => b.winner === 'user').length,
      losses: battles.filter(b => b.winner === 'ai').length,
      draws: battles.filter(b => b.winner === 'draw').length,
    };

    res.json({
      success: true,
      count: battles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
      data: battles
    });
  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get single battle by ID
// @route GET /api/battles/:id
// @access Private
const getBattleById = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate('user', 'username email createdAt');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if battle belongs to user
    if (battle.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this battle'
      });
    }

    res.json({
      success: true,
      data: battle,
      stats: {
        isClose: battle.isCloseBattle(),
        scoreDifference: battle.scoreDifference,
      }
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid battle ID format'
      });
    }

    console.error('Get battle by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update battle score manually (admin/override feature)
// @route PUT /api/battles/:id/score
// @access Private
const updateBattleScore = async (req, res) => {
  try {
    const { userScore, aiScore } = req.body;

    // Validate scores
    if (userScore === undefined || aiScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Both user and AI scores are required'
      });
    }

    if (userScore < 0 || userScore > 10 || aiScore < 0 || aiScore > 10) {
      return res.status(400).json({
        success: false,
        message: 'Scores must be between 0 and 10'
      });
    }

    const battle = await Battle.findById(req.params.id);

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check ownership
    if (battle.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this battle'
      });
    }

    // Update scores
    battle.scores.user = parseFloat(userScore);
    battle.scores.ai = parseFloat(aiScore);

    // Recalculate winner
    if (userScore > aiScore) {
      battle.winner = 'user';
    } else if (aiScore > userScore) {
      battle.winner = 'ai';
    } else {
      battle.winner = 'draw';
    }

    await battle.save();

    res.json({
      success: true,
      data: battle,
      message: 'Battle scores updated successfully'
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid battle ID format'
      });
    }

    console.error('Update battle score error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Delete battle
// @route DELETE /api/battles/:id
// @access Private
const deleteBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check ownership
    if (battle.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this battle'
      });
    }

    await battle.deleteOne();

    res.json({
      success: true,
      message: 'Battle deleted successfully',
      data: {}
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid battle ID format'
      });
    }

    console.error('Delete battle error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get user statistics
// @route GET /api/battles/stats/me
// @access Private
const getUserStats = async (req, res) => {
  try {
    const battles = await Battle.find({ user: req.user._id });

    const stats = {
      totalBattles: battles.length,
      wins: battles.filter(b => b.winner === 'user').length,
      losses: battles.filter(b => b.winner === 'ai').length,
      draws: battles.filter(b => b.winner === 'draw').length,
      winRate: 0,
      averageUserScore: 0,
      averageAiScore: 0,
      highestScore: 0,
      lowestScore: 10,
      closeBattles: battles.filter(b => b.isCloseBattle()).length,
    };

    if (battles.length > 0) {
      stats.winRate = ((stats.wins / battles.length) * 100).toFixed(2);
      
      const validBattles = battles.filter(b => b.scores.user && b.scores.ai);
      if (validBattles.length > 0) {
        stats.averageUserScore = (
          validBattles.reduce((sum, b) => sum + b.scores.user, 0) / validBattles.length
        ).toFixed(2);
        
        stats.averageAiScore = (
          validBattles.reduce((sum, b) => sum + b.scores.ai, 0) / validBattles.length
        ).toFixed(2);
        
        stats.highestScore = Math.max(...validBattles.map(b => b.scores.user));
        stats.lowestScore = Math.min(...validBattles.map(b => b.scores.user));
      }
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBattle,
  getBattles,
  getBattleById,
  updateBattleScore,
  deleteBattle,
  getUserStats,
};
