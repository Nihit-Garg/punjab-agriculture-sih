const express = require('express');
const router = express.Router();
const soilDataController = require('../controllers/soilDataController');

// GET /api/soil-data?district=amritsar - Get soil nutrient info by district
router.get('/', soilDataController.getSoilData);

// GET /api/soil-data/districts - Get list of available districts
router.get('/districts', soilDataController.getAvailableDistricts);

// GET /api/soil-data/analysis?district=amritsar&crop=wheat - Get soil analysis for specific crop
router.get('/analysis', soilDataController.getSoilAnalysis);

module.exports = router;