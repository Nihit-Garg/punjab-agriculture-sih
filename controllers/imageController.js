const fs = require('fs-extra');
const path = require('path');
const imageClient = require('../models/imageClient');

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
      const { image_path, crop_type } = req.body;
      
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

      // Call image analysis service
      const detection = await imageClient.detectPestDisease(image_path, crop_type);

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
  }
};

module.exports = imageController;