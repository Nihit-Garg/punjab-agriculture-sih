const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

const mlClient = {
  // Get crop recommendation from ML microservice
  getCropRecommendation: async (data) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/crop-recommendation`, {
        soil_data: data.soil_data,
        weather_data: data.weather_data,
        location: data.location
      }, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.error('ML Service Error (Crop Recommendation):', error.message);
      
      // If ML service is unavailable, return mock response
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log('ML Service unavailable, returning mock recommendation');
        return mlClient.getMockCropRecommendation(data);
      }
      
      throw new Error(`ML Service Error: ${error.message}`);
    }
  },

  // Get yield prediction from ML microservice
  getYieldPrediction: async (data) => {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/yield-prediction`, {
        crop_type: data.crop_type,
        soil_data: data.soil_data,
        weather_data: data.weather_data,
        area: data.area,
        location: data.location
      }, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.error('ML Service Error (Yield Prediction):', error.message);
      
      // If ML service is unavailable, return mock response
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log('ML Service unavailable, returning mock prediction');
        return mlClient.getMockYieldPrediction(data);
      }
      
      throw new Error(`ML Service Error: ${error.message}`);
    }
  },

  // Mock crop recommendation (fallback when ML service is unavailable)
  getMockCropRecommendation: (data) => {
    const crops = ['wheat', 'rice', 'maize', 'barley', 'sugarcane'];
    const recommendedCrops = crops
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((crop, index) => ({
        crop: crop,
        confidence: Math.round((90 - index * 10) + Math.random() * 10), // 90%, 80%, 70% with variation
        reasons: [
          'Soil conditions are favorable',
          'Climate is suitable for growth',
          'Historical yield data is positive'
        ]
      }));

    return {
      success: true,
      recommendations: recommendedCrops,
      location: data.location,
      analysis: {
        soil_suitability: Math.round(Math.random() * 20 + 70), // 70-90%
        weather_suitability: Math.round(Math.random() * 20 + 70), // 70-90%
        overall_score: Math.round(Math.random() * 20 + 70) // 70-90%
      },
      mock: true,
      message: 'This is a mock response. ML service is currently unavailable.'
    };
  },

  // Mock yield prediction (fallback when ML service is unavailable)
  getMockYieldPrediction: (data) => {
    const baseYield = {
      wheat: 4500,
      rice: 6000,
      maize: 5500,
      barley: 3500,
      sugarcane: 70000
    };

    const cropYield = baseYield[data.crop_type.toLowerCase()] || 4000;
    const variation = Math.random() * 0.4 - 0.2; // ±20% variation
    const predictedYield = Math.round(cropYield * (1 + variation));

    return {
      success: true,
      prediction: {
        crop_type: data.crop_type,
        predicted_yield: predictedYield,
        unit: data.crop_type.toLowerCase() === 'sugarcane' ? 'kg/ha' : 'kg/ha',
        area: data.area,
        total_production: Math.round(predictedYield * data.area),
        confidence: Math.round(Math.random() * 20 + 70) // 70-90%
      },
      factors: {
        soil_impact: Math.round(Math.random() * 30 + 70), // 70-100%
        weather_impact: Math.round(Math.random() * 30 + 70), // 70-100%
        management_impact: Math.round(Math.random() * 20 + 80) // 80-100%
      },
      recommendations: [
        'Monitor soil moisture levels regularly',
        'Apply fertilizers based on soil test results',
        'Consider weather forecasts for irrigation planning'
      ],
      mock: true,
      message: 'This is a mock response. ML service is currently unavailable.'
    };
  },

  // Health check for ML service
  checkMLServiceHealth: async () => {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return {
        available: true,
        status: response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
};

module.exports = mlClient;