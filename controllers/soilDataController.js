const fs = require('fs-extra');
const path = require('path');

const SOIL_DATA_FILE = path.join(__dirname, '..', 'data', 'soil_data_punjab.csv');

const soilDataController = {
  // Mock soil data (in production, this would read from actual CSV file)
  getMockSoilData() {
    return [
      {
        district: 'Amritsar',
        ph: 7.2,
        nitrogen: 240,
        phosphorus: 45,
        potassium: 180,
        organic_carbon: 0.65,
        conductivity: 0.28,
        suitable_crops: ['wheat', 'rice', 'maize']
      },
      {
        district: 'Ludhiana',
        ph: 6.8,
        nitrogen: 220,
        phosphorus: 38,
        potassium: 195,
        organic_carbon: 0.58,
        conductivity: 0.31,
        suitable_crops: ['wheat', 'rice', 'sugarcane']
      },
      {
        district: 'Jalandhar',
        ph: 7.0,
        nitrogen: 235,
        phosphorus: 42,
        potassium: 175,
        organic_carbon: 0.62,
        conductivity: 0.26,
        suitable_crops: ['wheat', 'rice', 'cotton']
      },
      {
        district: 'Patiala',
        ph: 7.1,
        nitrogen: 210,
        phosphorus: 40,
        potassium: 160,
        organic_carbon: 0.55,
        conductivity: 0.29,
        suitable_crops: ['wheat', 'rice', 'barley']
      },
      {
        district: 'Bathinda',
        ph: 6.9,
        nitrogen: 200,
        phosphorus: 35,
        potassium: 185,
        organic_carbon: 0.51,
        conductivity: 0.33,
        suitable_crops: ['wheat', 'cotton', 'mustard']
      }
    ];
  },

  // GET /api/soil-data?district=amritsar
  getSoilData: async (req, res) => {
    try {
      const { district } = req.query;
      const soilData = soilDataController.getMockSoilData();
      
      let filteredData = soilData;
      
      if (district) {
        filteredData = soilData.filter(data => 
          data.district.toLowerCase() === district.toLowerCase()
        );
        
        if (filteredData.length === 0) {
          return res.status(404).json({
            error: 'District not found',
            message: `No soil data available for district: ${district}`
          });
        }
      }

      res.json({
        success: true,
        data: {
          soil_data: filteredData,
          total_records: filteredData.length,
          units: {
            ph: 'pH scale',
            nitrogen: 'kg/ha',
            phosphorus: 'kg/ha',
            potassium: 'kg/ha',
            organic_carbon: '%',
            conductivity: 'dS/m'
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getSoilData:', error);
      res.status(500).json({
        error: 'Failed to get soil data',
        message: error.message
      });
    }
  },

  // GET /api/soil-data/districts
  getAvailableDistricts: async (req, res) => {
    try {
      const soilData = soilDataController.getMockSoilData();
      const districts = soilData.map(data => data.district);

      res.json({
        success: true,
        data: {
          districts: districts,
          total_districts: districts.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getAvailableDistricts:', error);
      res.status(500).json({
        error: 'Failed to get available districts',
        message: error.message
      });
    }
  },

  // GET /api/soil-data/analysis?district=amritsar&crop=wheat
  getSoilAnalysis: async (req, res) => {
    try {
      const { district, crop } = req.query;
      
      if (!district || !crop) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'district and crop are required'
        });
      }

      const soilData = soilDataController.getMockSoilData();
      const districtData = soilData.find(data => 
        data.district.toLowerCase() === district.toLowerCase()
      );
      
      if (!districtData) {
        return res.status(404).json({
          error: 'District not found',
          message: `No soil data available for district: ${district}`
        });
      }

      // Check if crop is suitable for the district
      const isSuitable = districtData.suitable_crops.includes(crop.toLowerCase());
      
      // Generate soil analysis and recommendations
      const analysis = {
        district: districtData.district,
        crop: crop,
        soil_parameters: {
          ph: districtData.ph,
          nitrogen: districtData.nitrogen,
          phosphorus: districtData.phosphorus,
          potassium: districtData.potassium,
          organic_carbon: districtData.organic_carbon,
          conductivity: districtData.conductivity
        },
        suitability: {
          is_suitable: isSuitable,
          suitability_score: isSuitable ? Math.round(Math.random() * 20 + 75) : Math.round(Math.random() * 30 + 45), // 75-95 if suitable, 45-75 if not
          factors: []
        },
        recommendations: []
      };

      // Add specific recommendations based on soil parameters
      if (districtData.ph < 6.0) {
        analysis.recommendations.push('Consider lime application to increase soil pH');
        analysis.suitability.factors.push('Low pH may affect nutrient availability');
      } else if (districtData.ph > 8.0) {
        analysis.recommendations.push('Consider gypsum application to reduce soil pH');
        analysis.suitability.factors.push('High pH may affect nutrient availability');
      }

      if (districtData.nitrogen < 200) {
        analysis.recommendations.push('Apply nitrogen-rich fertilizers or organic compost');
        analysis.suitability.factors.push('Low nitrogen levels detected');
      }

      if (districtData.phosphorus < 40) {
        analysis.recommendations.push('Apply phosphorus fertilizers for better root development');
        analysis.suitability.factors.push('Low phosphorus levels detected');
      }

      if (districtData.organic_carbon < 0.5) {
        analysis.recommendations.push('Increase organic matter through compost or crop residue incorporation');
        analysis.suitability.factors.push('Low organic carbon content');
      }

      // If no issues found, add general recommendations
      if (analysis.recommendations.length === 0) {
        analysis.recommendations.push('Soil parameters are within optimal range for this crop');
        analysis.recommendations.push('Continue current soil management practices');
        analysis.suitability.factors.push('All soil parameters are within suitable ranges');
      }

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getSoilAnalysis:', error);
      res.status(500).json({
        error: 'Failed to get soil analysis',
        message: error.message
      });
    }
  }
};

module.exports = soilDataController;