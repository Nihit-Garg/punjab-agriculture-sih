const SoilData = require('../models/schemas/SoilData');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const soilDataController = {

  // GET /api/soil-data?district=amritsar&state=punjab
  getSoilData: async (req, res) => {
    try {
      const { district, state = 'punjab', limit = 20, offset = 0 } = req.query;
      
      let query = {};
      if (district) {
        query.district = new RegExp(district, 'i');
      }
      if (state) {
        query.state = new RegExp(state, 'i');
      }
      
      const soilData = await SoilData.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .select('-metadata -__v');
      
      if (soilData.length === 0) {
        // If no data found, provide mock data for development
        console.log('No soil data found in database, returning mock data');
        const mockData = await soilDataController.getMockSoilDataForDistrict(district);
        
        if (!mockData) {
          return res.status(404).json({
            error: 'District not found',
            message: `No soil data available for district: ${district || 'any district'}`
          });
        }
        
        return res.json({
          success: true,
          data: {
            soil_data: [mockData],
            total_records: 1,
            source: 'mock',
            units: {
              ph: 'pH scale (0-14)',
              nitrogen: 'mg/kg',
              phosphorus: 'mg/kg', 
              potassium: 'mg/kg',
              organicCarbon: '%',
              conductivity: 'dS/m'
            }
          },
          timestamp: new Date().toISOString()
        });
      }
      
      const total = await SoilData.countDocuments(query);

      res.json({
        success: true,
        data: {
          soil_data: soilData,
          total_records: total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total,
          source: 'database',
          units: {
            ph: 'pH scale (0-14)',
            nitrogen: 'mg/kg',
            phosphorus: 'mg/kg',
            potassium: 'mg/kg',
            organicCarbon: '%',
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
  
  // Helper method for mock data (fallback when database is empty)
  getMockSoilDataForDistrict: async (district) => {
    if (!district) return null;
    
    const mockData = {
      'amritsar': {
        district: 'Amritsar',
        state: 'Punjab',
        soilType: 'alluvial',
        averageData: {
          ph: 7.2,
          nitrogen: 240,
          phosphorus: 45,
          potassium: 180,
          organicCarbon: 0.65,
          conductivity: 0.28
        },
        recommendations: {
          suitableCrops: [
            { name: 'wheat', season: 'rabi', suitabilityScore: 90 },
            { name: 'rice', season: 'kharif', suitabilityScore: 85 },
            { name: 'maize', season: 'kharif', suitabilityScore: 80 }
          ]
        },
        dataSource: 'estimated',
        reliability: 'medium'
      },
      'ludhiana': {
        district: 'Ludhiana',
        state: 'Punjab',
        soilType: 'alluvial',
        averageData: {
          ph: 6.8,
          nitrogen: 220,
          phosphorus: 38,
          potassium: 195,
          organicCarbon: 0.58,
          conductivity: 0.31
        },
        recommendations: {
          suitableCrops: [
            { name: 'wheat', season: 'rabi', suitabilityScore: 88 },
            { name: 'rice', season: 'kharif', suitabilityScore: 87 },
            { name: 'sugarcane', season: 'all', suitabilityScore: 82 }
          ]
        },
        dataSource: 'estimated',
        reliability: 'medium'
      }
    };
    
    return mockData[district.toLowerCase()] || null;
  },

  // GET /api/soil-data/districts
  getAvailableDistricts: async (req, res) => {
    try {
      const { state } = req.query;
      
      let query = {};
      if (state) {
        query.state = new RegExp(state, 'i');
      }
      
      // Get unique districts
      const districts = await SoilData.distinct('district', query);
      
      if (districts.length === 0) {
        // Return mock districts if database is empty
        const mockDistricts = ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda'];
        return res.json({
          success: true,
          data: {
            districts: mockDistricts,
            total_districts: mockDistricts.length,
            source: 'mock'
          },
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: {
          districts: districts.sort(),
          total_districts: districts.length,
          source: 'database'
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

  // GET /api/soil-data/analysis?district=amritsar&crop=wheat&state=punjab
  getSoilAnalysis: async (req, res) => {
    try {
      const { district, crop, state = 'punjab' } = req.query;
      
      if (!district || !crop) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'district and crop are required'
        });
      }

      // Find soil data for the district
      const districtData = await SoilData.findByDistrict(district, state);
      
      if (!districtData) {
        // Try mock data
        const mockData = await soilDataController.getMockSoilDataForDistrict(district);
        
        if (!mockData) {
          return res.status(404).json({
            error: 'District not found',
            message: `No soil data available for district: ${district}`
          });
        }
        
        // Use mock data for analysis
        const analysis = soilDataController.generateSoilAnalysis(mockData, crop);
        analysis.source = 'mock';
        
        return res.json({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString()
        });
      }

      // Generate analysis from database data
      const analysis = soilDataController.generateSoilAnalysis(districtData, crop);
      analysis.source = 'database';
      
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
  },
  
  // Helper method to generate soil analysis
  generateSoilAnalysis: (soilData, crop) => {
    const soilParams = soilData.averageData;
    
    // Get crop suitability from database or calculate it
    let cropSuitability = null;
    if (soilData.recommendations?.suitableCrops) {
      cropSuitability = soilData.recommendations.suitableCrops.find(
        c => c.name.toLowerCase() === crop.toLowerCase()
      );
    }
    
    const isSuitable = cropSuitability ? cropSuitability.suitabilityScore > 70 : false;
    const suitabilityScore = cropSuitability ? cropSuitability.suitabilityScore : 
                            (isSuitable ? Math.round(Math.random() * 20 + 75) : Math.round(Math.random() * 30 + 45));
    
    const analysis = {
      district: soilData.district,
      state: soilData.state,
      crop: crop,
      soil_parameters: soilParams,
      soil_quality_score: soilData.soilQuality || null, // Virtual field from schema
      suitability: {
        is_suitable: isSuitable,
        suitability_score: suitabilityScore,
        factors: []
      },
      recommendations: [],
      soil_type: soilData.soilType,
      reliability: soilData.reliability || 'medium'
    };

    // Add specific recommendations based on soil parameters
    if (soilParams.ph < 6.0) {
      analysis.recommendations.push('Apply lime to increase soil pH for better nutrient availability');
      analysis.suitability.factors.push('Low pH may limit nutrient uptake');
    } else if (soilParams.ph > 8.0) {
      analysis.recommendations.push('Apply gypsum or organic matter to reduce soil pH');
      analysis.suitability.factors.push('High pH may cause nutrient deficiencies');
    } else {
      analysis.suitability.factors.push('pH level is optimal for most crops');
    }

    if (soilParams.nitrogen < 200) {
      analysis.recommendations.push('Apply nitrogen fertilizers or organic compost to improve nitrogen levels');
      analysis.suitability.factors.push('Nitrogen levels below optimal range');
    } else if (soilParams.nitrogen > 300) {
      analysis.recommendations.push('Monitor nitrogen levels to prevent excessive vegetative growth');
    }

    if (soilParams.phosphorus < 25) {
      analysis.recommendations.push('Apply phosphorus fertilizers for better root development and flowering');
      analysis.suitability.factors.push('Low phosphorus may affect root growth');
    }
    
    if (soilParams.potassium < 200) {
      analysis.recommendations.push('Apply potassium fertilizers to improve disease resistance and water regulation');
      analysis.suitability.factors.push('Potassium levels below recommended range');
    }

    if (soilParams.organicCarbon && soilParams.organicCarbon < 0.5) {
      analysis.recommendations.push('Increase organic matter through compost, crop residue, or green manuring');
      analysis.suitability.factors.push('Low organic carbon affects soil structure and fertility');
    }
    
    if (soilParams.conductivity && soilParams.conductivity > 2.0) {
      analysis.recommendations.push('Improve drainage and consider salt-tolerant varieties due to high salinity');
      analysis.suitability.factors.push('High electrical conductivity indicates salinity issues');
    }

    // If no issues found, add positive feedback
    if (analysis.recommendations.length === 0) {
      analysis.recommendations.push('Soil parameters are within optimal range for this crop');
      analysis.recommendations.push('Continue current soil management practices');
      analysis.suitability.factors.push('All major soil parameters are within suitable ranges');
    }

    // Add crop-specific recommendations
    const cropSpecificRecommendations = soilDataController.getCropSpecificRecommendations(crop, soilParams);
    analysis.recommendations.push(...cropSpecificRecommendations);

    return analysis;
  },
  
  // Get crop-specific recommendations
  getCropSpecificRecommendations: (crop, soilParams) => {
    const recommendations = [];
    
    switch (crop.toLowerCase()) {
      case 'wheat':
        if (soilParams.ph < 6.5) recommendations.push('Wheat prefers slightly alkaline soil (pH 6.5-7.5)');
        if (soilParams.nitrogen < 250) recommendations.push('Wheat has high nitrogen requirements, especially during tillering');
        break;
      case 'rice':
        if (soilParams.ph > 7.0) recommendations.push('Rice grows best in slightly acidic to neutral soil (pH 5.5-7.0)');
        recommendations.push('Ensure proper water management for rice cultivation');
        break;
      case 'cotton':
        if (soilParams.ph < 5.8 || soilParams.ph > 8.0) recommendations.push('Cotton prefers pH between 5.8-8.0');
        if (soilParams.potassium < 250) recommendations.push('Cotton has high potassium requirements for fiber quality');
        break;
      case 'sugarcane':
        if (soilParams.ph < 6.0 || soilParams.ph > 7.5) recommendations.push('Sugarcane grows best in pH 6.0-7.5');
        recommendations.push('Ensure adequate organic matter for sustained sugarcane production');
        break;
    }
    
    return recommendations;
  },

  // Load soil data from CSV file
  loadSoilDataFromCSV: async () => {
    return new Promise((resolve, reject) => {
      const results = [];
      const csvPath = path.join(__dirname, '../data/soil_data_punjab.csv');
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          // Convert CSV data to proper format
          const processedData = {
            district: data.district,
            ph: parseFloat(data.ph),
            nitrogen: parseFloat(data.nitrogen),
            phosphorus: parseFloat(data.phosphorus),
            potassium: parseFloat(data.potassium),
            organic_carbon: parseFloat(data.organic_carbon),
            conductivity: parseFloat(data.conductivity),
            suitable_crops: data.suitable_crops ? data.suitable_crops.split(',').map(c => c.trim()) : []
          };
          results.push(processedData);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  },

  // POST /api/soil-data/analyze - Location-based soil analysis
  analyzeSoilByLocation: async (req, res) => {
    try {
      const { location, soil_data } = req.body;
      
      if (!location && !soil_data) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'Either location or soil_data is required'
        });
      }

      let soilAnalysis = null;

      // If location is provided, try to get regional soil data
      if (location) {
        try {
          const csvData = await soilDataController.loadSoilDataFromCSV();
          const locationData = csvData.find(d => 
            d.district.toLowerCase().includes(location.toLowerCase()) ||
            location.toLowerCase().includes(d.district.toLowerCase())
          );

          if (locationData) {
            // Use CSV data for analysis
            soilAnalysis = {
              location: locationData.district,
              soil_health: {
                ph: locationData.ph,
                nitrogen: locationData.nitrogen,
                phosphorus: locationData.phosphorus,
                potassium: locationData.potassium,
                organic_carbon: locationData.organic_carbon,
                conductivity: locationData.conductivity,
                health_status: soilDataController.calculateHealthStatus(locationData),
                total_nutrients: locationData.nitrogen + locationData.phosphorus + locationData.potassium,
                recommendations: soilDataController.generateHealthRecommendations(locationData)
              },
              suitable_crops: locationData.suitable_crops,
              data_source: 'regional_database'
            };
          }
        } catch (csvError) {
          console.log('Could not load CSV data, using provided soil data or defaults');
        }
      }

      // If no regional data found or location not provided, use provided soil_data
      if (!soilAnalysis && soil_data) {
        soilAnalysis = {
          location: location || 'Custom Location',
          soil_health: {
            ph: soil_data.ph,
            nitrogen: soil_data.nitrogen,
            phosphorus: soil_data.phosphorus,
            potassium: soil_data.potassium,
            organic_carbon: soil_data.organic_carbon || 0.5,
            conductivity: soil_data.conductivity || 0.3,
            health_status: soilDataController.calculateHealthStatus(soil_data),
            total_nutrients: soil_data.nitrogen + soil_data.phosphorus + soil_data.potassium,
            recommendations: soilDataController.generateHealthRecommendations(soil_data)
          },
          data_source: 'user_input'
        };
      }

      // Fallback to default analysis
      if (!soilAnalysis) {
        soilAnalysis = {
          location: location || 'Unknown',
          soil_health: {
            ph: 7.0,
            nitrogen: 220,
            phosphorus: 40,
            potassium: 175,
            organic_carbon: 0.6,
            conductivity: 0.3,
            health_status: 'Good',
            total_nutrients: 435,
            recommendations: ['Regular soil testing recommended', 'Maintain organic matter through composting']
          },
          suitable_crops: ['wheat', 'rice', 'maize'],
          data_source: 'default'
        };
      }

      res.json({
        success: true,
        data: soilAnalysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in analyzeSoilByLocation:', error);
      res.status(500).json({
        error: 'Failed to analyze soil',
        message: error.message
      });
    }
  },

  // Calculate health status based on soil parameters
  calculateHealthStatus: (soilData) => {
    let score = 0;
    let maxScore = 0;

    // pH scoring (0-20 points)
    maxScore += 20;
    if (soilData.ph >= 6.0 && soilData.ph <= 7.5) {
      score += 20;
    } else if (soilData.ph >= 5.5 && soilData.ph <= 8.0) {
      score += 15;
    } else {
      score += 5;
    }

    // Nitrogen scoring (0-25 points)
    maxScore += 25;
    if (soilData.nitrogen >= 200) {
      score += 25;
    } else if (soilData.nitrogen >= 150) {
      score += 20;
    } else if (soilData.nitrogen >= 100) {
      score += 15;
    } else {
      score += 5;
    }

    // Phosphorus scoring (0-20 points)
    maxScore += 20;
    if (soilData.phosphorus >= 30) {
      score += 20;
    } else if (soilData.phosphorus >= 20) {
      score += 15;
    } else if (soilData.phosphorus >= 10) {
      score += 10;
    } else {
      score += 5;
    }

    // Potassium scoring (0-20 points)
    maxScore += 20;
    if (soilData.potassium >= 150) {
      score += 20;
    } else if (soilData.potassium >= 100) {
      score += 15;
    } else if (soilData.potassium >= 50) {
      score += 10;
    } else {
      score += 5;
    }

    // Organic carbon scoring (0-15 points)
    if (soilData.organic_carbon !== undefined) {
      maxScore += 15;
      if (soilData.organic_carbon >= 0.75) {
        score += 15;
      } else if (soilData.organic_carbon >= 0.5) {
        score += 12;
      } else if (soilData.organic_carbon >= 0.25) {
        score += 8;
      } else {
        score += 3;
      }
    }

    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 55) return 'Fair';
    if (percentage >= 40) return 'Poor';
    return 'Very Poor';
  },

  // Generate health-based recommendations
  generateHealthRecommendations: (soilData) => {
    const recommendations = [];

    if (soilData.ph < 6.0) {
      recommendations.push('Apply lime to increase soil pH');
    } else if (soilData.ph > 8.0) {
      recommendations.push('Apply organic matter or sulfur to lower pH');
    }

    if (soilData.nitrogen < 150) {
      recommendations.push('Apply nitrogen-rich fertilizers or compost');
    }

    if (soilData.phosphorus < 25) {
      recommendations.push('Add phosphorus fertilizers for better root development');
    }

    if (soilData.potassium < 120) {
      recommendations.push('Apply potassium fertilizers to improve plant health');
    }

    if (soilData.organic_carbon && soilData.organic_carbon < 0.5) {
      recommendations.push('Increase organic matter through composting and crop residue');
    }

    if (soilData.conductivity && soilData.conductivity > 2.0) {
      recommendations.push('Improve drainage to reduce salinity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Soil health is good - maintain current practices');
      recommendations.push('Continue regular monitoring and testing');
    }

    return recommendations;
  }
};

module.exports = soilDataController;