const mlClient = require('../models/mlClient');
const CropAnalysis = require('../models/schemas/CropAnalysis');

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

      // Check for cached analysis
      const cacheKey = cropController.generateCacheKey({
        soil_data, weather_data, location, type: 'crop-recommendation'
      });
      
      let cachedAnalysis = await CropAnalysis.getCachedAnalysis(cacheKey);
      if (cachedAnalysis) {
        console.log('Using cached crop recommendation');
        return res.json({
          success: true,
          data: cachedAnalysis,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      const startTime = Date.now();
      
      // Call ML microservice for crop recommendation
      const recommendation = await mlClient.getCropRecommendation({
        soil_data,
        weather_data,
        location
      });

      const processingTime = Date.now() - startTime;
      
      // Store analysis in database
      try {
        const analysis = new CropAnalysis({
          soilData: soil_data,
          weatherData: weather_data,
          location: {
            name: location || 'Unknown',
            district: cropController.extractDistrict(location),
            state: cropController.extractState(location)
          },
          analysisType: 'crop-recommendation',
          recommendations: recommendation.recommendations?.map(rec => ({
            crop: rec.crop,
            confidence: rec.confidence / 100, // Convert percentage to decimal
            reasons: rec.reasons || [],
            suitabilityScore: Math.round(rec.confidence || 80)
          })) || [],
          overallScore: {
            soilSuitability: recommendation.analysis?.soil_suitability || 80,
            weatherSuitability: recommendation.analysis?.weather_suitability || 80,
            overallSuitability: recommendation.analysis?.overall_score || 80
          },
          mlService: {
            used: !recommendation.mock,
            responseTime: processingTime,
            source: recommendation.mock ? 'mock' : 'ml-microservice'
          },
          requestData: {
            sourceIP: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          }
        });
        
        analysis.generateCacheKey();
        await analysis.save();
        console.log('Crop recommendation analysis saved to database');
      } catch (dbError) {
        console.error('Error saving crop analysis to database:', dbError);
        // Continue with response even if database save fails
      }

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

      const startTime = Date.now();
      
      // Call ML microservice for yield prediction
      const prediction = await mlClient.getYieldPrediction({
        crop_type,
        soil_data,
        weather_data,
        area,
        location
      });

      const processingTime = Date.now() - startTime;
      
      // Store analysis in database
      try {
        const analysis = new CropAnalysis({
          soilData: soil_data,
          weatherData: weather_data,
          location: {
            name: location || 'Unknown',
            district: cropController.extractDistrict(location),
            state: cropController.extractState(location)
          },
          analysisType: 'yield-prediction',
          yieldPrediction: {
            cropType: crop_type,
            predictedYield: {
              value: prediction.prediction?.predicted_yield || 0,
              unit: prediction.prediction?.unit || 'kg/ha'
            },
            confidence: (prediction.prediction?.confidence || 80) / 100,
            area: area,
            totalProduction: prediction.prediction?.total_production || 0,
            factors: {
              soilImpact: prediction.factors?.soil_impact || 80,
              weatherImpact: prediction.factors?.weather_impact || 80,
              managementImpact: prediction.factors?.management_impact || 85
            },
            recommendations: prediction.recommendations || []
          },
          mlService: {
            used: !prediction.mock,
            responseTime: processingTime,
            source: prediction.mock ? 'mock' : 'ml-microservice'
          },
          requestData: {
            sourceIP: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          }
        });
        
        await analysis.save();
        console.log('Yield prediction analysis saved to database');
      } catch (dbError) {
        console.error('Error saving yield analysis to database:', dbError);
      }

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
  },
  
  // GET /api/crops/history - Get recent crop analyses
  getAnalysisHistory: async (req, res) => {
    try {
      const { limit = 10, district, analysisType } = req.query;
      
      let query = {};
      if (district) {
        query['location.district'] = new RegExp(district, 'i');
      }
      if (analysisType) {
        query.analysisType = analysisType;
      }
      
      const analyses = await CropAnalysis.getRecentAnalyses(parseInt(limit));
      
      res.json({
        success: true,
        data: {
          analyses: analyses,
          total: analyses.length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in getAnalysisHistory:', error);
      res.status(500).json({
        error: 'Failed to get analysis history',
        message: error.message
      });
    }
  },
  
  // Helper methods
  generateCacheKey: (data) => {
    return Buffer.from(JSON.stringify({
      soil: data.soil_data,
      weather: data.weather_data,
      location: data.location,
      type: data.type
    })).toString('base64').substring(0, 32);
  },
  
  extractDistrict: (location) => {
    if (!location) return null;
    const parts = location.split(',');
    return parts[0]?.trim() || null;
  },
  
  extractState: (location) => {
    if (!location) return null;
    const parts = location.split(',');
    return parts[1]?.trim() || null;
  }
};

module.exports = cropController;
