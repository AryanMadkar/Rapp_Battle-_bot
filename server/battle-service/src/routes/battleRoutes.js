const express = require('express');
const router = express.Router();
const {
    createBattle,
    getBattles,
    getBattleById,
    updateBattleScore,
} = require('../controllers/battleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBattle);
router.get('/', protect, getBattles);
router.get('/:id', protect, getBattleById);
router.put('/:id/score', protect, updateBattleScore);

module.exports = router;
