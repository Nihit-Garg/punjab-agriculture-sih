const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['pest', 'disease', 'nutrient-deficiency', 'normal', 'unknown']
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'moderate', 'high', 'critical']
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  treatmentSuggestions: [String],
  preventiveMeasures: [String],
  affectedArea: {
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    location: String // e.g., "leaves", "stem", "root", "fruit"
  }
});

const imageAnalysisSchema = new mongoose.Schema({
  // Image information
  image: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    url: String,
    path: String,
    dimensions: {
      width: Number,
      height: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Analysis input
  cropType: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    index: true
  },
  
  // Analysis results
  healthStatus: {
    type: String,
    required: true,
    enum: ['healthy', 'minor-issues', 'moderate-issues', 'needs-immediate-attention', 'critical'],
    index: true
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  detections: [detectionSchema],
  totalIssuesFound: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Recommendations
  generalRecommendations: [String],
  urgentActions: [String],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDays: Number,
  
  // Analysis metadata
  analysisMethod: {
    type: String,
    enum: ['ml-model', 'computer-vision-api', 'expert-review', 'mock'],
    default: 'ml-model'
  },
  modelVersion: {
    type: String,
    default: 'v1.0.0'
  },
  processingTime: Number, // milliseconds
  analysisDate: {
    type: Date,
    default: Date.now
  },
  
  // Location and context
  location: {
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
  
  // Farming context
  farmingContext: {
    growthStage: {
      type: String,
      enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest']
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid']
    },
    plantAge: Number, // days
    fieldConditions: String,
    weatherConditions: String,
    irrigationStatus: String,
    recentTreatments: [String]
  },
  
  // Quality and validation
  imageQuality: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    issues: [String], // e.g., "blurry", "poor lighting", "too far"
    suitable: {
      type: Boolean,
      default: true
    }
  },
  
  // User and request info
  requestInfo: {
    userAgent: String,
    sourceIP: String,
    sessionId: String
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'requires-review'],
    default: 'completed'
  },
  reviewed: {
    by: String, // expert name
    at: Date,
    notes: String,
    verified: Boolean
  },
  
  // Performance tracking
  feedback: {
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    providedBy: String,
    providedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
imageAnalysisSchema.index({ cropType: 1 });
imageAnalysisSchema.index({ healthStatus: 1 });
imageAnalysisSchema.index({ analysisDate: -1 });
imageAnalysisSchema.index({ 'location.district': 1, 'location.state': 1 });
imageAnalysisSchema.index({ status: 1 });
imageAnalysisSchema.index({ 'image.filename': 1 });
imageAnalysisSchema.index({ createdAt: -1 });

// Compound indexes
imageAnalysisSchema.index({ 
  cropType: 1, 
  healthStatus: 1, 
  analysisDate: -1 
});

imageAnalysisSchema.index({ 
  'location.district': 1, 
  cropType: 1,
  createdAt: -1 
});

// Virtual for severity assessment
imageAnalysisSchema.virtual('severityLevel').get(function() {
  if (!this.detections || this.detections.length === 0) return 'none';
  
  const severities = this.detections.map(d => d.severity);
  
  if (severities.includes('critical')) return 'critical';
  if (severities.includes('high')) return 'high';
  if (severities.includes('moderate')) return 'moderate';
  if (severities.includes('low')) return 'low';
  
  return 'none';
});

// Virtual for dominant issue type
imageAnalysisSchema.virtual('dominantIssueType').get(function() {
  if (!this.detections || this.detections.length === 0) return null;
  
  const typeCount = {};
  this.detections.forEach(detection => {
    typeCount[detection.type] = (typeCount[detection.type] || 0) + 1;
  });
  
  return Object.keys(typeCount).reduce((a, b) => 
    typeCount[a] > typeCount[b] ? a : b
  );
});

// Static methods
imageAnalysisSchema.statics.findByCrop = function(cropType, limit = 10) {
  return this.find({ cropType: new RegExp(cropType, 'i') })
    .sort({ analysisDate: -1 })
    .limit(limit);
};

imageAnalysisSchema.statics.findByLocation = function(district, state = null) {
  let query = { 'location.district': new RegExp(district, 'i') };
  
  if (state) {
    query['location.state'] = new RegExp(state, 'i');
  }
  
  return this.find(query)
    .sort({ analysisDate: -1 });
};

imageAnalysisSchema.statics.getHealthStatistics = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        analysisDate: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$healthStatus',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidenceScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

imageAnalysisSchema.statics.getCropIssues = function(cropType, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        cropType: new RegExp(cropType, 'i'),
        analysisDate: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $unwind: '$detections'
    },
    {
      $group: {
        _id: '$detections.name',
        count: { $sum: 1 },
        avgSeverity: { $avg: { $cond: [
          { $eq: ['$detections.severity', 'low'] }, 1,
          { $cond: [
            { $eq: ['$detections.severity', 'moderate'] }, 2,
            { $cond: [
              { $eq: ['$detections.severity', 'high'] }, 3, 4
            ]}
          ]}
        ]}},
        type: { $first: '$detections.type' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance methods
imageAnalysisSchema.methods.addDetection = function(detectionData) {
  this.detections.push(detectionData);
  this.totalIssuesFound = this.detections.length;
  
  // Update health status based on detections
  this.updateHealthStatus();
  
  return this;
};

imageAnalysisSchema.methods.updateHealthStatus = function() {
  if (this.detections.length === 0) {
    this.healthStatus = 'healthy';
    return this;
  }
  
  const severities = this.detections.map(d => d.severity);
  
  if (severities.includes('critical')) {
    this.healthStatus = 'critical';
  } else if (severities.includes('high')) {
    this.healthStatus = 'needs-immediate-attention';
  } else if (severities.includes('moderate')) {
    this.healthStatus = 'moderate-issues';
  } else {
    this.healthStatus = 'minor-issues';
  }
  
  return this;
};

imageAnalysisSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    providedAt: new Date()
  };
  
  return this.save();
};

imageAnalysisSchema.methods.markForReview = function(reason) {
  this.status = 'requires-review';
  if (reason) {
    this.generalRecommendations.push(`Review required: ${reason}`);
  }
  
  return this.save();
};

// Middleware
imageAnalysisSchema.pre('save', function(next) {
  // Update totalIssuesFound
  this.totalIssuesFound = this.detections.length;
  
  // Set follow-up requirements based on health status
  if (['needs-immediate-attention', 'critical'].includes(this.healthStatus)) {
    this.followUpRequired = true;
    this.followUpDays = this.followUpDays || 3;
  } else if (this.healthStatus === 'moderate-issues') {
    this.followUpRequired = true;
    this.followUpDays = this.followUpDays || 7;
  }
  
  next();
});

const ImageAnalysis = mongoose.model('ImageAnalysis', imageAnalysisSchema);

module.exports = ImageAnalysis;