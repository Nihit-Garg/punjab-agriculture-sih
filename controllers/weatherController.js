const weatherClient = require('../models/weatherClient');

const weatherController = {
  // GET /api/weather?location=punjab&district=amritsar
  getCurrentWeather: async (req, res) => {
    try {
      const { location, district } = req.query;
      
      if (!location) {
        return res.status(400).json({
          error: 'Missing location parameter',
          message: 'location is required'
        });
      }

      // Get real weather data from OpenWeatherMap API
      const weatherData = await weatherClient.getCurrentWeather(location, district);

      res.json({
        success: true,
        data: weatherData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getCurrentWeather:', error);
      res.status(500).json({
        error: 'Failed to get weather data',
        message: error.message
      });
    }
  },

  // GET /api/weather/forecast?location=punjab&days=7
  getWeatherForecast: async (req, res) => {
    try {
      const { location, days = 5 } = req.query;
      
      if (!location) {
        return res.status(400).json({
          error: 'Missing location parameter',
          message: 'location is required'
        });
      }

      const numDays = Math.min(parseInt(days) || 5, 5); // OpenWeather free plan: max 5 days
      
      // Get real weather forecast from OpenWeatherMap API
      const forecastData = await weatherClient.getWeatherForecast(location, numDays);

      res.json({
        success: true,
        data: forecastData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getWeatherForecast:', error);
      res.status(500).json({
        error: 'Failed to get weather forecast',
        message: error.message
      });
    }
  },

  // GET /api/weather/historical?location=punjab&date=2024-01-01
  getHistoricalWeather: async (req, res) => {
    try {
      const { location, date } = req.query;
      
      if (!location || !date) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'location and date are required'
        });
      }

      // Get historical weather data (uses mock data as historical requires paid plan)
      const historicalData = await weatherClient.getHistoricalWeather(location, date);

      res.json({
        success: true,
        data: historicalData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getHistoricalWeather:', error);
      res.status(500).json({
        error: 'Failed to get historical weather data',
        message: error.message
      });
    }
  },

  // GET /api/weather/health - Check weather API status
  getWeatherAPIHealth: async (req, res) => {
    try {
      const healthStatus = await weatherClient.checkWeatherAPIHealth();
      
      res.json({
        success: true,
        data: healthStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getWeatherAPIHealth:', error);
      res.status(500).json({
        error: 'Failed to check weather API health',
        message: error.message
      });
    }
  }
};

module.exports = weatherController;
