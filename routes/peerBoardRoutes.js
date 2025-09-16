const express = require('express');
const router = express.Router();
const peerBoardController = require('../controllers/peerBoardController');

// GET /api/peer-board - Get recent peer advisory questions and tips
router.get('/', peerBoardController.getPeerBoard);

// POST /api/peer-board - Add new question/tip to advisory board
router.post('/', peerBoardController.addToPeerBoard);

// GET /api/peer-board/:id - Get specific question/tip by ID
router.get('/:id', peerBoardController.getPeerBoardItem);

// PUT /api/peer-board/:id/answer - Add answer to a question
router.put('/:id/answer', peerBoardController.addAnswer);

// GET /api/peer-board/category/:category - Get posts by category
router.get('/category/:category', peerBoardController.getByCategory);

module.exports = router;