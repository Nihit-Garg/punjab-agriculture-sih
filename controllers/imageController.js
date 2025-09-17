const fs = require('fs-extra');
const path = require('path');
const imageClient = require('../models/imageClient');
// const ImageAnalysis = require('../models/schemas/ImageAnalysis');

const imageController = {
  // POST /api/images/upload
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No image file provided',
          message: 'Please upload an image file'
        });
      }

      const imageInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadPath: req.file.path,
        url: `/uploads/${req.file.filename}`
      };

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: imageInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in uploadImage:', error);
      res.status(500).json({
        error: 'Failed to upload image',
        message: error.message
      });
    }
  },

  // POST /api/images/detect
  detectPestDisease: async (req, res) => {
    try {
      const { image_path, crop_type, location, growth_stage } = req.body;
      
      if (!image_path) {
        return res.status(400).json({
          error: 'Missing image path',
          message: 'image_path is required'
        });
      }

      // Check if image file exists
      const fullImagePath = path.join(__dirname, '..', image_path);
      if (!await fs.pathExists(fullImagePath)) {
        return res.status(404).json({
          error: 'Image not found',
          message: 'The specified image file does not exist'
        });
      }

      const startTime = Date.now();
      
      // Call image analysis service
      const detection = await imageClient.detectPestDisease(image_path, crop_type);
      
      const processingTime = Date.now() - startTime;

      // Note: Database storage disabled, using mock data only
      console.log('Image analysis completed (database storage disabled)');
      console.log('Analysis details:', {
        image_path,
        crop_type,
        location,
        processing_time: processingTime + 'ms'
      });

      res.json({
        success: true,
        data: detection,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in detectPestDisease:', error);
      res.status(500).json({
        error: 'Failed to analyze image',
        message: error.message
      });
    }
  },

  // DELETE /api/images/:filename
  deleteImage: async (req, res) => {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '..', 'uploads', filename);

      if (!await fs.pathExists(imagePath)) {
        return res.status(404).json({
          error: 'Image not found',
          message: 'The specified image file does not exist'
        });
      }

      await fs.remove(imagePath);

      res.json({
        success: true,
        message: 'Image deleted successfully',
        filename: filename,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in deleteImage:', error);
      res.status(500).json({
        error: 'Failed to delete image',
        message: error.message
      });
    }
  },
  
  // GET /api/images/history - Get recent image analyses
  getAnalysisHistory: async (req, res) => {
    try {
      const { limit = 10, crop_type, health_status } = req.query;
      
      // Mock analysis history data
      const mockAnalyses = [
        {
          id: '1',
          cropType: 'wheat',
          healthStatus: 'moderate-issues',
          confidenceScore: 85,
          analysisDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          detections: [{ name: 'Leaf Rust', type: 'disease', confidence: 85 }]
        },
        {
          id: '2', 
          cropType: 'cotton',
          healthStatus: 'healthy',
          confidenceScore: 92,
          analysisDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          detections: []
        }
      ];
      
      let filteredAnalyses = mockAnalyses;
      if (crop_type) {
        filteredAnalyses = filteredAnalyses.filter(a => a.cropType.toLowerCase().includes(crop_type.toLowerCase()));
      }
      if (health_status) {
        filteredAnalyses = filteredAnalyses.filter(a => a.healthStatus === health_status);
      }
      
      res.json({
        success: true,
        data: {
          analyses: filteredAnalyses.slice(0, parseInt(limit)),
          total: filteredAnalyses.length
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
  
  // GET /api/images/statistics - Get analysis statistics
  getAnalysisStatistics: async (req, res) => {
    try {
      const { days = 30 } = req.query;
      
      // Mock statistics data
      const mockStatistics = {
        totalAnalyses: 245,
        healthDistribution: {
          healthy: 125,
          'minor-issues': 67,
          'moderate-issues': 38,
          'needs-immediate-attention': 12,
          critical: 3
        },
        cropTypeDistribution: {
          wheat: 98,
          cotton: 76,
          rice: 45,
          corn: 26
        },
        averageConfidenceScore: 82.5,
        trendData: {
          last7Days: 23,
          last30Days: 89,
          growthRate: 15.2
        }
      };
      
      res.json({
        success: true,
        data: {
          statistics: mockStatistics,
          period_days: parseInt(days)
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in getAnalysisStatistics:', error);
      res.status(500).json({
        error: 'Failed to get analysis statistics',
        message: error.message
      });
    }
  },
  
  // Helper methods
  mapHealthStatus: (status) => {
    const statusMap = {
      'Healthy': 'healthy',
      'Minor Issues Detected': 'minor-issues',
      'Moderate Issues Detected': 'moderate-issues',
      'Needs Immediate Attention': 'needs-immediate-attention',
      'Critical': 'critical'
    };
    return statusMap[status] || 'moderate-issues';
  },
  
  mapDetectionType: (name) => {
    const diseaseKeywords = ['blight', 'rust', 'mildew', 'spot', 'rot', 'wilt'];
    const pestKeywords = ['borer', 'worm', 'aphid', 'thrips', 'mite'];
    const nutrientKeywords = ['deficiency', 'chlorosis', 'necrosis'];
    
    const lowerName = name.toLowerCase();
    
    if (diseaseKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'disease';
    }
    if (pestKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'pest';
    }
    if (nutrientKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'nutrient-deficiency';
    }
    
    return 'unknown';
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

module.exports = imageController;
