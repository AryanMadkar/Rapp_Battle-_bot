const express = require('express');
const router = express.Router();
const { 
  generateRap, 
  testAI, 
  judgeRapBattle,
  generateConversationalResponse 
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRap);
router.post('/generate-response', protect, generateConversationalResponse); // New multi-turn route
router.post('/judge', protect, judgeRapBattle);
router.get('/test', protect, testAI);

module.exports = router;
