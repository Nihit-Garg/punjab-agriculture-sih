const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// POST /api/crops/recommend - Get crop recommendations
router.post('/recommend', cropController.recommendCrop);

// POST /api/crops/predict-yield - Predict crop yield
router.post('/predict-yield', cropController.predictYield);

// GET /api/crops/info/:cropName - Get crop information
router.get('/info/:cropName', cropController.getCropInfo);

module.exports = router;