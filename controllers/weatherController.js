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

      // Mock weather data (in production, integrate with weather API)
      const mockWeatherData = {
        location: location,
        district: district || 'Not specified',
        current: {
          temperature: Math.round(Math.random() * 20 + 15), // 15-35°C
          humidity: Math.round(Math.random() * 40 + 40), // 40-80%
          precipitation: Math.round(Math.random() * 10), // 0-10mm
          wind_speed: Math.round(Math.random() * 15 + 5), // 5-20 km/h
          conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
        },
        timestamp: new Date().toISOString(),
        last_updated: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random time within last hour
      };

      res.json({
        success: true,
        data: mockWeatherData,
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
      const { location, days = 7 } = req.query;
      
      if (!location) {
        return res.status(400).json({
          error: 'Missing location parameter',
          message: 'location is required'
        });
      }

      const numDays = Math.min(parseInt(days) || 7, 14); // Max 14 days
      const forecast = [];

      for (let i = 0; i < numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          temperature: {
            min: Math.round(Math.random() * 10 + 10), // 10-20°C
            max: Math.round(Math.random() * 15 + 25)  // 25-40°C
          },
          humidity: Math.round(Math.random() * 30 + 45), // 45-75%
          precipitation_chance: Math.round(Math.random() * 100), // 0-100%
          conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)]
        });
      }

      res.json({
        success: true,
        data: {
          location: location,
          forecast: forecast,
          days_requested: numDays
        },
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

      // Mock historical weather data
      const historicalData = {
        location: location,
        date: date,
        weather: {
          temperature: {
            min: Math.round(Math.random() * 10 + 5),  // 5-15°C
            max: Math.round(Math.random() * 20 + 20), // 20-40°C
            avg: Math.round(Math.random() * 15 + 15)  // 15-30°C
          },
          humidity: Math.round(Math.random() * 40 + 40), // 40-80%
          precipitation: Math.round(Math.random() * 20), // 0-20mm
          conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)]
        }
      };

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
  }
};

module.exports = weatherController;