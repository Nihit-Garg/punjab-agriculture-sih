const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { validateWeatherQuery } = require('../middleware/validation');

// GET /api/weather?location=punjab&district=amritsar - Get current weather data
router.get('/', validateWeatherQuery, weatherController.getCurrentWeather);

// GET /api/weather/forecast?location=punjab&days=7 - Get weather forecast
router.get('/forecast', validateWeatherQuery, weatherController.getWeatherForecast);

// GET /api/weather/historical?location=punjab&date=2024-01-01 - Get historical weather data
router.get('/historical', validateWeatherQuery, weatherController.getHistoricalWeather);

// GET /api/weather/health - Check weather API status
router.get('/health', weatherController.getWeatherAPIHealth);

module.exports = router;
