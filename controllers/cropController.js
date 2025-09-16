const mlClient = require('../models/mlClient');

const cropController = {
  // POST /api/crops/recommend
  recommendCrop: async (req, res) => {
    try {
      const { soil_data, weather_data, location } = req.body;
      
      if (!soil_data || !weather_data) {
        return res.status(400).json({
          error: 'Missing required data',
          message: 'soil_data and weather_data are required'
        });
      }

      // Call ML microservice for crop recommendation
      const recommendation = await mlClient.getCropRecommendation({
        soil_data,
        weather_data,
        location
      });

      res.json({
        success: true,
        data: recommendation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in recommendCrop:', error);
      res.status(500).json({
        error: 'Failed to get crop recommendation',
        message: error.message
      });
    }
  },

  // POST /api/crops/predict-yield
  predictYield: async (req, res) => {
    try {
      const { crop_type, soil_data, weather_data, area, location } = req.body;
      
      if (!crop_type || !soil_data || !weather_data || !area) {
        return res.status(400).json({
          error: 'Missing required data',
          message: 'crop_type, soil_data, weather_data, and area are required'
        });
      }

      // Call ML microservice for yield prediction
      const prediction = await mlClient.getYieldPrediction({
        crop_type,
        soil_data,
        weather_data,
        area,
        location
      });

      res.json({
        success: true,
        data: prediction,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in predictYield:', error);
      res.status(500).json({
        error: 'Failed to predict yield',
        message: error.message
      });
    }
  },

  // GET /api/crops/info/:cropName
  getCropInfo: async (req, res) => {
    try {
      const { cropName } = req.params;
      
      // Mock crop information (can be expanded with real database)
      const cropInfo = {
        wheat: {
          name: 'Wheat',
          growing_season: 'Rabi (Winter)',
          ideal_temperature: '15-25°C',
          soil_ph: '6.0-7.5',
          water_requirement: 'Medium',
          nutrients: ['Nitrogen', 'Phosphorus', 'Potassium']
        },
        rice: {
          name: 'Rice',
          growing_season: 'Kharif (Summer)',
          ideal_temperature: '20-35°C',
          soil_ph: '5.5-6.5',
          water_requirement: 'High',
          nutrients: ['Nitrogen', 'Phosphorus', 'Potassium']
        },
        maize: {
          name: 'Maize',
          growing_season: 'Kharif (Summer)',
          ideal_temperature: '18-27°C',
          soil_ph: '6.0-7.0',
          water_requirement: 'Medium',
          nutrients: ['Nitrogen', 'Phosphorus', 'Potassium']
        }
      };

      const info = cropInfo[cropName.toLowerCase()];
      
      if (!info) {
        return res.status(404).json({
          error: 'Crop not found',
          message: `Information for ${cropName} is not available`
        });
      }

      res.json({
        success: true,
        data: info,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getCropInfo:', error);
      res.status(500).json({
        error: 'Failed to get crop information',
        message: error.message
      });
    }
  }
};

module.exports = cropController;