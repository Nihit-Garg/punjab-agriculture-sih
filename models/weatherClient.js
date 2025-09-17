const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_UNITS = process.env.WEATHER_UNITS || 'metric';
const WEATHER_LANGUAGE = process.env.WEATHER_LANGUAGE || 'en';

const weatherClient = {
  // Get current weather data
  getCurrentWeather: async (location, district = null) => {
    try {
      if (!OPENWEATHER_API_KEY) {
        console.warn('OpenWeather API key not configured, using mock data');
        return weatherClient.getMockCurrentWeather(location, district);
      }

      // Create query string for location
      const query = district ? `${district}, ${location}` : location;
      
      const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          q: query,
          appid: OPENWEATHER_API_KEY,
          units: WEATHER_UNITS,
          lang: WEATHER_LANGUAGE
        },
        timeout: 10000
      });

      const data = response.data;
      
      return {
        success: true,
        location: location,
        district: district || data.name,
        current: {
          temperature: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
          wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          wind_direction: data.wind.deg,
          conditions: data.weather[0].main,
          description: data.weather[0].description,
          visibility: data.visibility ? data.visibility / 1000 : null, // Convert to km
          uv_index: null // Not available in current weather endpoint
        },
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        },
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
        timestamp: new Date().toISOString(),
        last_updated: new Date(data.dt * 1000).toISOString(),
        source: 'OpenWeatherMap'
      };

    } catch (error) {
      console.error('OpenWeather API Error:', error.message);
      
      // Fallback to mock data if API fails
      if (error.response?.status === 404) {
        console.log('Location not found, using mock weather data');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log('Weather API unavailable, using mock weather data');
      }
      
      return weatherClient.getMockCurrentWeather(location, district);
    }
  },

  // Get weather forecast
  getWeatherForecast: async (location, days = 5) => {
    try {
      if (!OPENWEATHER_API_KEY) {
        console.warn('OpenWeather API key not configured, using mock data');
        return weatherClient.getMockForecast(location, days);
      }

      // OpenWeather free plan supports 5-day forecast
      const cnt = Math.min(days * 8, 40); // 8 forecasts per day (3-hour intervals), max 40

      const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
        params: {
          q: location,
          appid: OPENWEATHER_API_KEY,
          units: WEATHER_UNITS,
          lang: WEATHER_LANGUAGE,
          cnt: cnt
        },
        timeout: 10000
      });

      const data = response.data;
      
      // Group forecasts by day
      const dailyForecasts = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            date: date,
            temperatures: [],
            humidity: [],
            precipitation: 0,
            conditions: [],
            wind_speeds: []
          };
        }
        
        dailyForecasts[date].temperatures.push(item.main.temp);
        dailyForecasts[date].humidity.push(item.main.humidity);
        dailyForecasts[date].precipitation += item.rain ? (item.rain['3h'] || 0) : 0;
        dailyForecasts[date].conditions.push(item.weather[0].main);
        dailyForecasts[date].wind_speeds.push(item.wind.speed);
      });

      // Process daily summaries
      const forecast = Object.values(dailyForecasts).slice(0, days).map(day => ({
        date: day.date,
        temperature: {
          min: Math.round(Math.min(...day.temperatures)),
          max: Math.round(Math.max(...day.temperatures)),
          avg: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length)
        },
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        precipitation: Math.round(day.precipitation * 10) / 10, // Round to 1 decimal
        precipitation_chance: day.precipitation > 0 ? Math.min(100, Math.round(day.precipitation * 20)) : 0,
        wind_speed: Math.round((day.wind_speeds.reduce((a, b) => a + b, 0) / day.wind_speeds.length) * 3.6),
        conditions: weatherClient.getMostFrequentCondition(day.conditions)
      }));

      return {
        success: true,
        location: location,
        forecast: forecast,
        days_requested: days,
        days_available: forecast.length,
        timestamp: new Date().toISOString(),
        source: 'OpenWeatherMap'
      };

    } catch (error) {
      console.error('OpenWeather Forecast API Error:', error.message);
      return weatherClient.getMockForecast(location, days);
    }
  },

  // Get historical weather (Note: Requires paid OpenWeather plan)
  getHistoricalWeather: async (location, date) => {
    try {
      // Historical data requires paid plan, so we'll provide a helpful message
      console.log('Historical weather data requires OpenWeather paid plan, using mock data');
      return weatherClient.getMockHistoricalWeather(location, date);

    } catch (error) {
      console.error('OpenWeather Historical API Error:', error.message);
      return weatherClient.getMockHistoricalWeather(location, date);
    }
  },

  // Helper function to get most frequent weather condition
  getMostFrequentCondition: (conditions) => {
    const frequency = {};
    conditions.forEach(condition => {
      frequency[condition] = (frequency[condition] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  },

  // Mock data fallbacks (same as before but marked as mock)
  getMockCurrentWeather: (location, district) => {
    return {
      success: true,
      location: location,
      district: district || 'Not specified',
      current: {
        temperature: Math.round(Math.random() * 20 + 15), // 15-35°C
        feels_like: Math.round(Math.random() * 20 + 15),
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
        precipitation: Math.round(Math.random() * 10 * 10) / 10, // 0-10mm
        wind_speed: Math.round(Math.random() * 15 + 5), // 5-20 km/h
        wind_direction: Math.round(Math.random() * 360),
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        description: 'Mock weather data',
        visibility: Math.round(Math.random() * 10 + 5), // 5-15 km
        uv_index: Math.round(Math.random() * 10 + 1) // 1-10
      },
      coordinates: null,
      sunrise: null,
      sunset: null,
      timestamp: new Date().toISOString(),
      last_updated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      source: 'Mock Data',
      mock: true,
      message: 'Using mock weather data. Configure OPENWEATHER_API_KEY for real data.'
    };
  },

  getMockForecast: (location, days) => {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: Math.round(Math.random() * 10 + 10), // 10-20°C
          max: Math.round(Math.random() * 15 + 25), // 25-40°C
          avg: Math.round(Math.random() * 10 + 20)  // 20-30°C
        },
        humidity: Math.round(Math.random() * 30 + 45), // 45-75%
        precipitation: Math.round(Math.random() * 20 * 10) / 10, // 0-20mm
        precipitation_chance: Math.round(Math.random() * 100), // 0-100%
        wind_speed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)]
      });
    }

    return {
      success: true,
      location: location,
      forecast: forecast,
      days_requested: days,
      days_available: forecast.length,
      timestamp: new Date().toISOString(),
      source: 'Mock Data',
      mock: true,
      message: 'Using mock forecast data. Configure OPENWEATHER_API_KEY for real data.'
    };
  },

  getMockHistoricalWeather: (location, date) => {
    return {
      success: true,
      location: location,
      date: date,
      weather: {
        temperature: {
          min: Math.round(Math.random() * 10 + 5),  // 5-15°C
          max: Math.round(Math.random() * 20 + 20), // 20-40°C
          avg: Math.round(Math.random() * 15 + 15)  // 15-30°C
        },
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        precipitation: Math.round(Math.random() * 20 * 10) / 10, // 0-20mm
        wind_speed: Math.round(Math.random() * 15 + 5), // 5-20 km/h
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)],
        description: 'Mock historical data'
      },
      source: 'Mock Data',
      mock: true,
      message: 'Using mock historical data. Historical weather requires OpenWeather paid plan.'
    };
  },

  // Health check for weather API
  checkWeatherAPIHealth: async () => {
    try {
      if (!OPENWEATHER_API_KEY) {
        return {
          available: false,
          error: 'API key not configured'
        };
      }

      // Test with a simple API call
      const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          q: 'London',
          appid: OPENWEATHER_API_KEY,
          units: WEATHER_UNITS
        },
        timeout: 5000
      });

      return {
        available: true,
        status: 'Weather API is operational',
        api_calls_remaining: response.headers['x-ratelimit-remaining'] || 'unknown'
      };
    } catch (error) {
      return {
        available: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

module.exports = weatherClient;