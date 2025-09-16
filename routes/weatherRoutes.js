const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather?location=punjab&district=amritsar - Get current weather data
router.get('/', weatherController.getCurrentWeather);

// GET /api/weather/forecast?location=punjab&days=7 - Get weather forecast
router.get('/forecast', weatherController.getWeatherForecast);

// GET /api/weather/historical?location=punjab&date=2024-01-01 - Get historical weather data
router.get('/historical', weatherController.getHistoricalWeather);

module.exports = router;