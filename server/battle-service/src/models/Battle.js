const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  theme: {
    type: String,
    default: 'freestyle',
    trim: true,
  },
  aiModel: {
    type: String,
    enum: ['groq', 'gemini', 'huggingface'],
    default: 'groq',
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  // Conversation history (multi-turn exchanges)
  conversation: [{
    speaker: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    roundNumber: {
      type: Number,
      required: true,
    }
  }],
  currentRound: {
    type: Number,
    default: 0,
  },
  maxRounds: {
    type: Number,
    default: 10,
  },
  winner: {
    type: String,
    enum: ['user', 'ai', 'draw'],
    default: null,
  },
  scores: {
    user: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    ai: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
  },
  analysis: {
    user: {
      scores: {
        flow: { type: Number, min: 0, max: 10 },
        rhyme: { type: Number, min: 0, max: 10 },
        wordplay: { type: Number, min: 0, max: 10 },
        content: { type: Number, min: 0, max: 10 },
        originality: { type: Number, min: 0, max: 10 },
        technical: { type: Number, min: 0, max: 10 },
        impact: { type: Number, min: 0, max: 10 },
        culture: { type: Number, min: 0, max: 10 },
      },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      bestLine: { type: String },
      feedback: { type: String },
    },
    ai: {
      scores: {
        flow: { type: Number, min: 0, max: 10 },
        rhyme: { type: Number, min: 0, max: 10 },
        wordplay: { type: Number, min: 0, max: 10 },
        content: { type: Number, min: 0, max: 10 },
        originality: { type: Number, min: 0, max: 10 },
        technical: { type: Number, min: 0, max: 10 },
        impact: { type: Number, min: 0, max: 10 },
        culture: { type: Number, min: 0, max: 10 },
      },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      bestLine: { type: String },
      feedback: { type: String },
    },
    winReason: { type: String },
    overallAnalysis: { type: String },
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
battleSchema.index({ user: 1, status: 1, createdAt: -1 });

// Virtual for total exchanges
battleSchema.virtual('totalExchanges').get(function() {
  return this.conversation.length;
});

// ✅ NEW: Virtual for score difference
battleSchema.virtual('scoreDifference').get(function() {
  if (this.scores && this.scores.user !== null && this.scores.ai !== null) {
    return Math.abs(this.scores.user - this.scores.ai);
  }
  return null;
});

// Method to check if battle should end
battleSchema.methods.shouldEnd = function() {
  return this.currentRound >= this.maxRounds || this.status === 'completed';
};

// ✅ NEW: Method to check if battle is close
battleSchema.methods.isCloseBattle = function() {
  if (this.scores && this.scores.user !== null && this.scores.ai !== null) {
    return Math.abs(this.scores.user - this.scores.ai) <= 1;
  }
  return false;
};

// Method to get conversation context for AI
battleSchema.methods.getConversationContext = function() {
  return this.conversation.map(entry => ({
    role: entry.speaker === 'user' ? 'user' : 'assistant',
    content: entry.text,
  }));
};

module.exports = mongoose.model('Battle', battleSchema);
