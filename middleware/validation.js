const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request data',
        details: errors
      });
    }
    
    // Replace request data with validated/sanitized data
    req[property] = value;
    next();
  };
};

// Common schemas
const commonSchemas = {
  soilData: Joi.object({
    ph: Joi.number().min(0).max(14).required(),
    nitrogen: Joi.number().min(0).max(500).required(),
    phosphorus: Joi.number().min(0).max(200).required(), 
    potassium: Joi.number().min(0).max(1000).required(),
    organicCarbon: Joi.number().min(0).max(10).optional(),
    conductivity: Joi.number().min(0).max(20).optional(),
    soilType: Joi.string().valid(
      'alluvial', 'black-cotton', 'red-laterite', 'desert', 
      'mountain', 'saline', 'peaty-marshy', 'forest', 'mixed'
    ).optional(),
    soilTexture: Joi.string().valid(
      'clay', 'loam', 'sandy-clay', 'sandy-loam', 'silt', 'sand'
    ).optional()
  }),
  
  weatherData: Joi.object({
    temperature: Joi.number().min(-50).max(60).required(),
    humidity: Joi.number().min(0).max(100).required(),
    rainfall: Joi.number().min(0).max(10000).required(),
    season: Joi.string().valid('kharif', 'rabi', 'zaid').optional(),
    windSpeed: Joi.number().min(0).max(200).optional(),
    pressure: Joi.number().min(800).max(1200).optional()
  }),
  
  location: Joi.string().min(2).max(200).optional(),
  
  paginationQuery: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).optional()
  }),
  
  cropName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s-]+$/),
  
  district: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s-]+$/),
  
  category: Joi.string().valid(
    'fertilizers', 'irrigation', 'pest-control', 'soil-management',
    'crop-selection', 'weather', 'market-prices', 'equipment',
    'organic-farming', 'general', 'all'
  )
};

// Validation schemas for different endpoints

// Crop recommendation validation
const cropRecommendationSchema = Joi.object({
  soil_data: commonSchemas.soilData.required(),
  weather_data: commonSchemas.weatherData.required(),
  location: commonSchemas.location
});

// Yield prediction validation
const yieldPredictionSchema = Joi.object({
  crop_type: commonSchemas.cropName.required(),
  soil_data: commonSchemas.soilData.required(),
  weather_data: commonSchemas.weatherData.required(),
  area: Joi.number().min(0.1).max(10000).required(),
  location: commonSchemas.location
});

// Peer board post validation
const peerBoardPostSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().trim(),
  content: Joi.string().min(10).max(2000).required().trim(),
  category: Joi.string().valid(
    'fertilizers', 'irrigation', 'pest-control', 'soil-management',
    'crop-selection', 'weather', 'market-prices', 'equipment',
    'organic-farming', 'general'
  ).default('general'),
  author: Joi.string().min(2).max(100).required().trim(),
  authorLocation: Joi.string().min(2).max(100).optional().trim(),
  type: Joi.string().valid('question', 'discussion', 'tip').default('question'),
  tags: Joi.array().items(Joi.string().min(2).max(50).trim()).max(10).default([]),
  cropType: commonSchemas.cropName.optional(),
  season: Joi.string().valid('kharif', 'rabi', 'zaid', 'all').default('all'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

// Peer board answer validation
const peerBoardAnswerSchema = Joi.object({
  content: Joi.string().min(5).max(2000).required().trim(),
  author: Joi.string().min(2).max(100).required().trim(),
  authorLocation: Joi.string().min(2).max(100).optional().trim()
});

// Image detection validation
const imageDetectionSchema = Joi.object({
  image_path: Joi.string().required(),
  crop_type: commonSchemas.cropName.optional(),
  location: commonSchemas.location,
  growth_stage: Joi.string().valid(
    'seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'
  ).optional()
});

// Query parameter validations
const peerBoardQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  category: commonSchemas.category.optional(),
  status: Joi.string().valid('open', 'answered', 'resolved', 'closed', 'all').default('open'),
  sortBy: Joi.string().valid('createdAt', 'upvotes', 'views', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const soilDataQuerySchema = Joi.object({
  district: commonSchemas.district.optional(),
  state: Joi.string().min(2).max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

const soilAnalysisQuerySchema = Joi.object({
  district: commonSchemas.district.required(),
  crop: commonSchemas.cropName.required(),
  state: Joi.string().min(2).max(100).default('punjab')
});

const weatherQuerySchema = Joi.object({
  location: Joi.string().min(2).max(200).required(),
  district: Joi.string().min(2).max(100).optional()
});

const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(200).required().trim(),
  category: commonSchemas.category.optional(),
  status: Joi.string().valid('open', 'answered', 'resolved', 'closed', 'all').default('open'),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0)
});

// Export validation middleware functions
module.exports = {
  validate,
  commonSchemas,
  
  // Request body validations
  validateCropRecommendation: validate(cropRecommendationSchema),
  validateYieldPrediction: validate(yieldPredictionSchema),
  validatePeerBoardPost: validate(peerBoardPostSchema),
  validatePeerBoardAnswer: validate(peerBoardAnswerSchema),
  validateImageDetection: validate(imageDetectionSchema),
  
  // Query parameter validations
  validatePeerBoardQuery: validate(peerBoardQuerySchema, 'query'),
  validateSoilDataQuery: validate(soilDataQuerySchema, 'query'),
  validateSoilAnalysisQuery: validate(soilAnalysisQuerySchema, 'query'),
  validateWeatherQuery: validate(weatherQuerySchema, 'query'),
  validateSearchQuery: validate(searchQuerySchema, 'query'),
  
  // Parameter validations
  validateCropName: validate(Joi.object({ cropName: commonSchemas.cropName.required() }), 'params'),
  validatePostId: validate(Joi.object({ id: Joi.string().required() }), 'params'),
  validateCategory: validate(Joi.object({ category: commonSchemas.category.required() }), 'params'),
  validateFilename: validate(Joi.object({ 
    filename: Joi.string().pattern(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|bmp)$/i).required() 
  }), 'params'),
  
  // Generic query params validation
  validateQueryParams: validate(Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
    crop_type: Joi.string().min(2).max(100).optional(),
    health_status: Joi.string().valid('healthy', 'minor-issues', 'moderate-issues', 'needs-immediate-attention', 'critical').optional(),
    days: Joi.number().integer().min(1).max(365).default(30)
  }), 'query'),
  
  // District query validation
  validateDistrictQuery: validate(Joi.object({
    district: commonSchemas.district.optional(),
    state: Joi.string().min(2).max(100).optional()
  }), 'query'),
  
// Soil query validation
  validateSoilQuery: validate(soilAnalysisQuerySchema, 'query'),
  
  // Language preference validation
  validateLanguagePreference: validate(Joi.object({
    language: Joi.string().valid('en', 'hi', 'pa').required(),
    userId: Joi.string().min(3).max(100).optional(),
    sessionId: Joi.string().min(3).max(100).optional()
  })),
  
  // Session ID validation
  validateSessionId: validate(Joi.object({ 
    sessionId: Joi.string().min(3).max(100).required() 
  }), 'params')
};