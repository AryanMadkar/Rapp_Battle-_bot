const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userRap: {
        type: String,
        required: [true, 'User rap is required'],
        trim: true,
        minlength: [10, 'Rap must be at least 10 characters'],
        maxlength: [1000, 'Rap cannot exceed 1000 characters'],
    },
    aiRap: {
        type: String,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
battleSchema.index({ user: 1, createdAt: -1 });

// Virtual for calculating score difference
battleSchema.virtual('scoreDifference').get(function () {
    if (this.scores.user && this.scores.ai) {
        return Math.abs(this.scores.user - this.scores.ai);
    }
    return null;
});

// Method to determine if battle was close
battleSchema.methods.isCloseBattle = function () {
    if (this.scores.user && this.scores.ai) {
        return Math.abs(this.scores.user - this.scores.ai) <= 1;
    }
    return false;
};

module.exports = mongoose.model('Battle', battleSchema);
