const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  authorLocation: {
    type: String,
    trim: true,
    maxLength: 100
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false // For expert-verified answers
  },
  verifiedBy: {
    type: String,
    trim: true,
    maxLength: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const peerBoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
    index: true // For search functionality
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fertilizers',
      'irrigation',
      'pest-control',
      'soil-management',
      'crop-selection',
      'weather',
      'market-prices',
      'equipment',
      'organic-farming',
      'general'
    ],
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  authorLocation: {
    type: String,
    trim: true,
    maxLength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['question', 'discussion', 'tip'],
    default: 'question'
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  cropType: {
    type: String,
    trim: true,
    maxLength: 50,
    index: true
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'all'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  answers: [answerSchema],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  isSticky: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metadata: {
    location: {
      district: String,
      state: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    language: {
      type: String,
      default: 'en',
      maxLength: 10
    },
    sourceIP: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
peerBoardSchema.index({ category: 1, status: 1 });
peerBoardSchema.index({ author: 1 });
peerBoardSchema.index({ createdAt: -1 });
peerBoardSchema.index({ upvotes: -1 });
peerBoardSchema.index({ views: -1 });
peerBoardSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Text search

// Virtual for answer count
peerBoardSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Virtual for latest answer
peerBoardSchema.virtual('latestAnswer').get(function() {
  if (this.answers.length === 0) return null;
  return this.answers.sort((a, b) => b.createdAt - a.createdAt)[0];
});

// Middleware to update updatedAt on answers
peerBoardSchema.pre('save', function(next) {
  if (this.isModified('answers')) {
    this.answers.forEach(answer => {
      if (answer.isModified() && !answer.isNew) {
        answer.updatedAt = new Date();
      }
    });
  }
  next();
});

// Static methods
peerBoardSchema.statics.getCategories = function() {
  return [
    'fertilizers',
    'irrigation', 
    'pest-control',
    'soil-management',
    'crop-selection',
    'weather',
    'market-prices',
    'equipment',
    'organic-farming',
    'general'
  ];
};

peerBoardSchema.statics.searchPosts = function(query, options = {}) {
  const {
    category,
    status = 'open',
    limit = 10,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  let searchQuery = {};

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (category && category !== 'all') {
    searchQuery.category = category;
  }

  // Status filter
  if (status !== 'all') {
    searchQuery.status = status;
  }

  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .select('-metadata.sourceIP -metadata.userAgent'); // Exclude sensitive data
};

// Instance methods
peerBoardSchema.methods.addAnswer = function(answerData) {
  this.answers.push(answerData);
  
  // Update status if this is the first answer
  if (this.status === 'open' && this.answers.length === 1) {
    this.status = 'answered';
  }
  
  return this.save();
};

peerBoardSchema.methods.upvote = function() {
  this.upvotes += 1;
  return this.save();
};

peerBoardSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const PeerBoard = mongoose.model('PeerBoard', peerBoardSchema);

module.exports = PeerBoard;