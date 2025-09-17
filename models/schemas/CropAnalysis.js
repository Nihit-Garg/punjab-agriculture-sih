const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  suitabilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  reasons: [String],
  expectedYield: {
    value: Number,
    unit: {
      type: String,
      default: 'kg/ha'
    },
    range: {
      min: Number,
      max: Number
    }
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'all'],
    default: 'all'
  },
  growthDuration: {
    type: Number, // days
    min: 30,
    max: 365
  },
  waterRequirement: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
});

const yieldPredictionSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  predictedYield: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'kg/ha'
    }
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  area: {
    type: Number,
    required: true,
    min: 0.1
  },
  totalProduction: {
    type: Number,
    min: 0
  },
  factors: {
    soilImpact: {
      type: Number,
      min: 0,
      max: 100
    },
    weatherImpact: {
      type: Number,
      min: 0,
      max: 100
    },
    managementImpact: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  recommendations: [String],
  riskFactors: [String]
});

const cropAnalysisSchema = new mongoose.Schema({
  // Input data
  soilData: {
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    nitrogen: {
      type: Number,
      required: true,
      min: 0
    },
    phosphorus: {
      type: Number,
      required: true,
      min: 0
    },
    potassium: {
      type: Number,
      required: true,
      min: 0
    },
    organicCarbon: Number,
    conductivity: Number,
    soilType: String,
    soilTexture: String
  },
  weatherData: {
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    rainfall: {
      type: Number,
      required: true,
      min: 0
    },
    season: String,
    windSpeed: Number,
    pressure: Number
  },
  location: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    district: {
      type: String,
      trim: true,
      maxLength: 100
    },
    state: {
      type: String,
      trim: true,
      maxLength: 100
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Analysis results
  recommendations: [cropRecommendationSchema],
  yieldPrediction: yieldPredictionSchema,
  
  // Analysis metadata
  analysisType: {
    type: String,
    required: true,
    enum: ['crop-recommendation', 'yield-prediction', 'combined']
  },
  modelVersion: {
    type: String,
    required: true,
    default: 'v1.0.0'
  },
  mlService: {
    used: {
      type: Boolean,
      default: true
    },
    responseTime: Number, // milliseconds
    source: {
      type: String,
      enum: ['ml-microservice', 'mock', 'cached'],
      default: 'ml-microservice'
    }
  },
  overallScore: {
    soilSuitability: {
      type: Number,
      min: 0,
      max: 100
    },
    weatherSuitability: {
      type: Number,
      min: 0,
      max: 100
    },
    overallSuitability: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // User context
  requestData: {
    userAgent: String,
    sourceIP: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  // Caching and performance
  cached: {
    type: Boolean,
    default: false
  },
  cacheKey: String,
  expiresAt: {
    type: Date,
    default: function() {
      // Cache for 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cropAnalysisSchema.index({ 'location.district': 1, 'location.state': 1 });
cropAnalysisSchema.index({ analysisType: 1 });
cropAnalysisSchema.index({ createdAt: -1 });
cropAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
cropAnalysisSchema.index({ cached: 1 });
cropAnalysisSchema.index({ cacheKey: 1 });

// Compound indexes for common queries
cropAnalysisSchema.index({ 
  'location.district': 1, 
  analysisType: 1, 
  createdAt: -1 
});

// Virtual for top recommendation
cropAnalysisSchema.virtual('topRecommendation').get(function() {
  if (!this.recommendations || this.recommendations.length === 0) return null;
  return this.recommendations.sort((a, b) => b.confidence - a.confidence)[0];
});

// Virtual for analysis summary
cropAnalysisSchema.virtual('summary').get(function() {
  return {
    location: this.location.name,
    topCrop: this.topRecommendation?.crop,
    overallScore: this.overallScore?.overallSuitability,
    analysisDate: this.createdAt,
    source: this.mlService?.source
  };
});

// Static methods
cropAnalysisSchema.statics.findByLocation = function(district, state = null) {
  let query = { 'location.district': new RegExp(district, 'i') };
  
  if (state) {
    query['location.state'] = new RegExp(state, 'i');
  }
  
  return this.find(query)
    .where('expiresAt').gt(new Date())
    .sort({ createdAt: -1 });
};

cropAnalysisSchema.statics.getCachedAnalysis = function(cacheKey) {
  return this.findOne({ 
    cacheKey: cacheKey,
    cached: true,
    expiresAt: { $gt: new Date() }
  });
};

cropAnalysisSchema.statics.getRecentAnalyses = function(limit = 10) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('location analysisType overallScore createdAt topRecommendation');
};

cropAnalysisSchema.statics.getAnalyticsByDistrict = function(district, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        'location.district': new RegExp(district, 'i'),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$analysisType',
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore.overallSuitability' },
        topCrops: { $push: '$recommendations.crop' }
      }
    }
  ]);
};

// Instance methods
cropAnalysisSchema.methods.generateCacheKey = function() {
  const data = {
    soilData: this.soilData,
    weatherData: this.weatherData,
    location: this.location.district + '_' + this.location.state,
    analysisType: this.analysisType
  };
  
  // Simple hash of input data
  const hash = Buffer.from(JSON.stringify(data)).toString('base64');
  this.cacheKey = hash.substring(0, 32);
  
  return this.cacheKey;
};

cropAnalysisSchema.methods.addRecommendation = function(cropData) {
  this.recommendations.push(cropData);
  
  // Sort recommendations by confidence
  this.recommendations.sort((a, b) => b.confidence - a.confidence);
  
  return this;
};

cropAnalysisSchema.methods.setYieldPrediction = function(yieldData) {
  this.yieldPrediction = yieldData;
  return this;
};

cropAnalysisSchema.methods.markCached = function() {
  this.cached = true;
  this.generateCacheKey();
  return this.save();
};

// Middleware
cropAnalysisSchema.pre('save', function(next) {
  // Calculate overall suitability if not set
  if (!this.overallScore?.overallSuitability && 
      this.overallScore?.soilSuitability && 
      this.overallScore?.weatherSuitability) {
    this.overallScore.overallSuitability = Math.round(
      (this.overallScore.soilSuitability + this.overallScore.weatherSuitability) / 2
    );
  }
  
  // Calculate total production if yield prediction exists
  if (this.yieldPrediction?.predictedYield?.value && this.yieldPrediction?.area) {
    this.yieldPrediction.totalProduction = 
      this.yieldPrediction.predictedYield.value * this.yieldPrediction.area;
  }
  
  next();
});

const CropAnalysis = mongoose.model('CropAnalysis', cropAnalysisSchema);

module.exports = CropAnalysis;