const express = require('express');
const router = express.Router();
const soilDataController = require('../controllers/soilDataController');
const { validateSoilQuery, validateDistrictQuery } = require('../middleware/validation');

// GET /api/soil-data?district=amritsar - Get soil nutrient info by district
router.get('/', validateDistrictQuery, soilDataController.getSoilData);

// GET /api/soil-data/districts - Get list of available districts
router.get('/districts', soilDataController.getAvailableDistricts);

// GET /api/soil-data/analysis?district=amritsar&crop=wheat - Get soil analysis for specific crop
router.get('/analysis', validateSoilQuery, soilDataController.getSoilAnalysis);

// POST /api/soil-data/analyze - Location-based soil analysis using CSV data
router.post('/analyze', soilDataController.analyzeSoilByLocation);

module.exports = router;
