const mongoose = require('mongoose');

const soilTestSchema = new mongoose.Schema({
  ph: {
    type: Number,
    required: true,
    min: 0,
    max: 14,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 14;
      },
      message: 'pH must be between 0 and 14'
    }
  },
  nitrogen: {
    type: Number,
    required: true,
    min: 0,
    max: 500 // mg/kg
  },
  phosphorus: {
    type: Number,
    required: true,
    min: 0,
    max: 200 // mg/kg
  },
  potassium: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // mg/kg
  },
  organicCarbon: {
    type: Number,
    min: 0,
    max: 10 // percentage
  },
  conductivity: {
    type: Number,
    min: 0,
    max: 20 // dS/m
  },
  calcium: {
    type: Number,
    min: 0
  },
  magnesium: {
    type: Number,
    min: 0
  },
  sulfur: {
    type: Number,
    min: 0
  },
  iron: {
    type: Number,
    min: 0
  },
  manganese: {
    type: Number,
    min: 0
  },
  zinc: {
    type: Number,
    min: 0
  },
  copper: {
    type: Number,
    min: 0
  },
  boron: {
    type: Number,
    min: 0
  }
});

const soilDataSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    index: true
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    index: true
  },
  region: {
    type: String,
    trim: true,
    maxLength: 100
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  soilType: {
    type: String,
    required: true,
    enum: [
      'alluvial',
      'black-cotton',
      'red-laterite', 
      'desert',
      'mountain',
      'saline',
      'peaty-marshy',
      'forest',
      'mixed'
    ],
    index: true
  },
  soilTexture: {
    type: String,
    enum: ['clay', 'loam', 'sandy-clay', 'sandy-loam', 'silt', 'sand'],
    default: 'loam'
  },
  averageData: soilTestSchema,
  seasonalData: {
    kharif: soilTestSchema,
    rabi: soilTestSchema,
    zaid: soilTestSchema
  },
  recommendations: {
    suitableCrops: [{
      name: String,
      season: {
        type: String,
        enum: ['kharif', 'rabi', 'zaid', 'all']
      },
      suitabilityScore: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    fertilizers: [{
      type: String,
      quantity: String,
      timing: String,
      notes: String
    }],
    improvements: [String],
    warnings: [String]
  },
  climateData: {
    averageRainfall: Number, // mm per year
    averageTemperature: {
      min: Number,
      max: Number
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  dataSource: {
    type: String,
    required: true,
    enum: ['government-survey', 'lab-test', 'farmer-input', 'satellite', 'estimated']
  },
  collectionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  sampleCount: {
    type: Number,
    min: 1,
    default: 1
  },
  reliability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  metadata: {
    collectedBy: String,
    labName: String,
    methodology: String,
    notes: String,
    season: String,
    year: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
soilDataSchema.index({ district: 1, state: 1 });
soilDataSchema.index({ soilType: 1 });
soilDataSchema.index({ dataSource: 1 });
soilDataSchema.index({ reliability: 1 });
soilDataSchema.index({ location: '2dsphere' }); // Geospatial index

// Virtual for soil quality assessment
soilDataSchema.virtual('soilQuality').get(function() {
  if (!this.averageData) return null;
  
  const { ph, nitrogen, phosphorus, potassium, organicCarbon } = this.averageData;
  
  // Simple soil quality scoring (0-100)
  let score = 0;
  
  // pH scoring (optimal range 6.0-7.5)
  if (ph >= 6.0 && ph <= 7.5) score += 25;
  else if (ph >= 5.5 && ph <= 8.0) score += 20;
  else if (ph >= 5.0 && ph <= 8.5) score += 15;
  else score += 10;
  
  // Nutrient scoring (simplified)
  if (nitrogen > 280) score += 25;
  else if (nitrogen > 200) score += 20;
  else if (nitrogen > 120) score += 15;
  else score += 10;
  
  if (phosphorus > 25) score += 25;
  else if (phosphorus > 15) score += 20;
  else if (phosphorus > 10) score += 15;
  else score += 10;
  
  if (potassium > 300) score += 25;
  else if (potassium > 200) score += 20;
  else if (potassium > 120) score += 15;
  else score += 10;
  
  return Math.min(100, score);
});

// Static methods
soilDataSchema.statics.findByDistrict = function(district, state) {
  return this.findOne({ 
    district: new RegExp(district, 'i'),
    state: new RegExp(state, 'i')
  });
};

soilDataSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // meters
      }
    }
  });
};

soilDataSchema.statics.getSoilTypes = function() {
  return [
    'alluvial',
    'black-cotton',
    'red-laterite',
    'desert',
    'mountain',
    'saline',
    'peaty-marshy',
    'forest',
    'mixed'
  ];
};

soilDataSchema.statics.getBySoilType = function(soilType) {
  return this.find({ soilType: soilType });
};

// Instance methods
soilDataSchema.methods.updateSeasonalData = function(season, testData) {
  if (!['kharif', 'rabi', 'zaid'].includes(season)) {
    throw new Error('Invalid season. Must be kharif, rabi, or zaid');
  }
  
  this.seasonalData[season] = testData;
  this.lastUpdated = new Date();
  
  return this.save();
};

soilDataSchema.methods.addRecommendation = function(type, data) {
  if (!this.recommendations[type]) {
    throw new Error(`Invalid recommendation type: ${type}`);
  }
  
  if (Array.isArray(this.recommendations[type])) {
    this.recommendations[type].push(data);
  } else {
    this.recommendations[type] = data;
  }
  
  return this.save();
};

soilDataSchema.methods.getCropSuitability = function(cropName) {
  const crop = this.recommendations.suitableCrops.find(
    c => c.name.toLowerCase() === cropName.toLowerCase()
  );
  
  return crop ? crop.suitabilityScore : null;
};

// Middleware
soilDataSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const SoilData = mongoose.model('SoilData', soilDataSchema);

module.exports = SoilData;