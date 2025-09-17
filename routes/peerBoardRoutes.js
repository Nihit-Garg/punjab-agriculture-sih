const express = require('express');
const router = express.Router();
const peerBoardController = require('../controllers/peerBoardController');
const {
  validatePeerBoardQuery,
  validatePeerBoardPost,
  validatePeerBoardAnswer,
  validateSearchQuery,
  validatePostId,
  validateCategory
} = require('../middleware/validation');

// GET /api/peer-board/search - Search posts (must come before /:id route)
router.get('/search', validateSearchQuery, peerBoardController.searchPosts);

// GET /api/peer-board/category/:category - Get posts by category
router.get('/category/:category', validateCategory, peerBoardController.getByCategory);

// GET /api/peer-board - Get recent peer advisory questions and tips
router.get('/', validatePeerBoardQuery, peerBoardController.getPeerBoard);

// POST /api/peer-board - Add new question/tip to advisory board
router.post('/', validatePeerBoardPost, peerBoardController.addToPeerBoard);

// GET /api/peer-board/:id - Get specific question/tip by ID
router.get('/:id', validatePostId, peerBoardController.getPeerBoardItem);

// PUT /api/peer-board/:id/answer - Add answer to a question
router.put('/:id/answer', validatePostId, validatePeerBoardAnswer, peerBoardController.addAnswer);

module.exports = router;