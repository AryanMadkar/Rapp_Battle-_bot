const express = require('express');
const router = express.Router();
const { generateRap, testAI,judgeRapBattle } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRap);
router.get('/test', protect, testAI);
router.post('/judge', protect, judgeRapBattle); // New route

module.exports = router;
