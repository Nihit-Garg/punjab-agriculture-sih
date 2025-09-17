const mongoose = require('mongoose');

const weatherCache = new mongoose.Schema({
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
  current: {
    temperature: {
      type: Number,
      required: true
    },
    feelsLike: Number,
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    pressure: Number,
    precipitation: {
      type: Number,
      min: 0
    },
    windSpeed: Number,
    windDirection: Number,
    conditions: String,
    description: String,
    visibility: Number,
    uvIndex: Number
  },
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    temperature: {
      min: Number,
      max: Number,
      avg: Number
    },
    humidity: Number,
    precipitation: Number,
    precipitationChance: Number,
    windSpeed: Number,
    conditions: String
  }],
  historical: [{
    date: {
      type: Date,
      required: true
    },
    temperature: {
      min: Number,
      max: Number,
      avg: Number
    },
    humidity: Number,
    precipitation: Number,
    conditions: String
  }],
  sunrise: Date,
  sunset: Date,
  source: {
    type: String,
    required: true,
    enum: ['openweathermap', 'weatherapi', 'mock', 'manual']
  },
  dataType: {
    type: String,
    required: true,
    enum: ['current', 'forecast', 'historical']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: current data expires in 1 hour, forecast in 6 hours
      const hours = this.dataType === 'current' ? 1 : 6;
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
  },
  reliability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
weatherCache.index({ 'location.name': 1 });
weatherCache.index({ 'location.district': 1, 'location.state': 1 });
weatherCache.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
weatherCache.index({ dataType: 1 });
weatherCache.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
weatherCache.index({ lastUpdated: -1 });
weatherCache.index({ source: 1 });

// Static methods
weatherCache.statics.findByLocation = function(locationName, district = null) {
  let query = { 'location.name': new RegExp(locationName, 'i') };
  
  if (district) {
    query['location.district'] = new RegExp(district, 'i');
  }
  
  return this.find(query)
    .where('expiresAt').gt(new Date()) // Only non-expired data
    .sort({ lastUpdated: -1 });
};

weatherCache.statics.findByCoordinates = function(latitude, longitude, radius = 0.1) {
  return this.find({
    'location.coordinates.latitude': {
      $gte: latitude - radius,
      $lte: latitude + radius
    },
    'location.coordinates.longitude': {
      $gte: longitude - radius,
      $lte: longitude + radius
    },
    expiresAt: { $gt: new Date() }
  }).sort({ lastUpdated: -1 });
};

weatherCache.statics.getCurrent = function(locationName, district = null) {
  return this.findByLocation(locationName, district)
    .where('dataType').equals('current')
    .limit(1);
};

weatherCache.statics.getForecast = function(locationName, district = null) {
  return this.findByLocation(locationName, district)
    .where('dataType').equals('forecast')
    .limit(1);
};

weatherCache.statics.cleanExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Instance methods
weatherCache.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

weatherCache.methods.refresh = function(newData) {
  Object.assign(this, newData);
  this.lastUpdated = new Date();
  
  // Reset expiry
  const hours = this.dataType === 'current' ? 1 : 6;
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  
  return this.save();
};

const WeatherCache = mongoose.model('WeatherCache', weatherCache);

module.exports = WeatherCache;