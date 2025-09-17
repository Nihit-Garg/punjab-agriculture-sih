const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const { 
  validateCropRecommendation,
  validateYieldPrediction,
  validateCropName
} = require('../middleware/validation');

// POST /api/crops/recommend - Get crop recommendations
router.post('/recommend', validateCropRecommendation, cropController.recommendCrop);

// POST /api/crops/predict-yield - Predict crop yield
router.post('/predict-yield', validateYieldPrediction, cropController.predictYield);

// GET /api/crops/info/:cropName - Get crop information
router.get('/info/:cropName', validateCropName, cropController.getCropInfo);

// GET /api/crops/history - Get recent crop analyses
router.get('/history', cropController.getAnalysisHistory);

module.exports = router;
