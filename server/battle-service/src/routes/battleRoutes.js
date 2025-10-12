const express = require('express');
const router = express.Router();
const {
  startBattle,
  continueBattle,
  endBattle,
  getBattles,
  getBattleById,
  updateBattleScore,
  deleteBattle,
  getUserStats,
} = require('../controllers/battleController');
const { protect } = require('../middleware/authMiddleware');

// FIXED: Static routes BEFORE dynamic :id routes
router.post('/start', protect, startBattle);          // Start new battle
router.get('/stats/me', protect, getUserStats);        // User stats
router.get('/', protect, getBattles);                  // All battles

// Dynamic ID routes AFTER static routes
router.post('/:id/continue', protect, continueBattle); // Continue multi-turn
router.post('/:id/end', protect, endBattle);          // Manually end battle
router.get('/:id', protect, getBattleById);           // Single battle
router.put('/:id/score', protect, updateBattleScore); // Update score
router.delete('/:id', protect, deleteBattle);         // Delete battle

module.exports = router;
