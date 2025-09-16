const fs = require('fs-extra');
const path = require('path');

const imageClient = {
  // Detect pest/disease from uploaded image
  detectPestDisease: async (imagePath, cropType = 'unknown') => {
    try {
      // In a real implementation, this would call an ML service or use a pre-trained model
      // For now, we'll return mock detection results
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDetections = {
        wheat: [
          { name: 'Leaf Rust', probability: 0.85, severity: 'Moderate' },
          { name: 'Powdery Mildew', probability: 0.72, severity: 'Low' },
          { name: 'Aphids', probability: 0.68, severity: 'Low' }
        ],
        rice: [
          { name: 'Bacterial Leaf Blight', probability: 0.78, severity: 'High' },
          { name: 'Brown Spot', probability: 0.71, severity: 'Moderate' },
          { name: 'Stem Borer', probability: 0.65, severity: 'Moderate' }
        ],
        maize: [
          { name: 'Northern Corn Leaf Blight', probability: 0.82, severity: 'High' },
          { name: 'Corn Earworm', probability: 0.75, severity: 'Moderate' },
          { name: 'Fall Armyworm', probability: 0.69, severity: 'Moderate' }
        ],
        cotton: [
          { name: 'Bollworm', probability: 0.89, severity: 'High' },
          { name: 'Bacterial Blight', probability: 0.76, severity: 'Moderate' },
          { name: 'Aphids', probability: 0.70, severity: 'Low' }
        ]
      };

      const cropDetections = mockDetections[cropType.toLowerCase()] || mockDetections.wheat;
      
      // Randomly select 1-3 detections
      const numDetections = Math.floor(Math.random() * 3) + 1;
      const selectedDetections = cropDetections
        .sort(() => Math.random() - 0.5)
        .slice(0, numDetections)
        .map(detection => ({
          ...detection,
          probability: Math.round(detection.probability * 100) / 100, // Round to 2 decimals
          treatment_suggestions: imageClient.getTreatmentSuggestions(detection.name, detection.severity)
        }));

      // Determine overall health status
      const highSeverityCount = selectedDetections.filter(d => d.severity === 'High').length;
      const moderateSeverityCount = selectedDetections.filter(d => d.severity === 'Moderate').length;
      
      let healthStatus = 'Healthy';
      let confidenceScore = 85;
      
      if (highSeverityCount > 0) {
        healthStatus = 'Needs Immediate Attention';
        confidenceScore = Math.round(Math.random() * 20 + 75); // 75-95%
      } else if (moderateSeverityCount > 0) {
        healthStatus = 'Moderate Issues Detected';
        confidenceScore = Math.round(Math.random() * 15 + 70); // 70-85%
      } else if (selectedDetections.length > 0) {
        healthStatus = 'Minor Issues Detected';
        confidenceScore = Math.round(Math.random() * 15 + 65); // 65-80%
      }

      return {
        success: true,
        analysis: {
          image_path: imagePath,
          crop_type: cropType,
          health_status: healthStatus,
          confidence_score: confidenceScore,
          detections: selectedDetections,
          total_issues_found: selectedDetections.length
        },
        general_recommendations: [
          'Monitor crop regularly for early detection of issues',
          'Maintain proper field hygiene and crop rotation',
          'Consult with agricultural extension officer if issues persist'
        ],
        processing_info: {
          model_version: 'v1.2.3-mock',
          processing_time: '1.2s',
          timestamp: new Date().toISOString()
        },
        mock: true,
        message: 'This is a mock response. Real ML-based detection service is not implemented yet.'
      };

    } catch (error) {
      console.error('Error in pest/disease detection:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  },

  // Get treatment suggestions for detected pest/disease
  getTreatmentSuggestions: (pestDiseaseName, severity) => {
    const treatments = {
      'Leaf Rust': [
        'Apply fungicide spray (Propiconazole)',
        'Remove infected leaves',
        'Improve air circulation around plants'
      ],
      'Powdery Mildew': [
        'Use sulfur-based fungicides',
        'Reduce humidity around plants',
        'Apply neem oil spray'
      ],
      'Aphids': [
        'Use insecticidal soap spray',
        'Introduce beneficial insects like ladybugs',
        'Apply neem oil treatment'
      ],
      'Bacterial Leaf Blight': [
        'Apply copper-based bactericides',
        'Remove infected plant parts',
        'Improve drainage and reduce humidity'
      ],
      'Brown Spot': [
        'Apply appropriate fungicides',
        'Maintain proper field drainage',
        'Use resistant varieties if available'
      ],
      'Stem Borer': [
        'Use pheromone traps',
        'Apply targeted insecticides',
        'Practice crop rotation'
      ],
      'Northern Corn Leaf Blight': [
        'Apply fungicide treatments',
        'Use resistant hybrid varieties',
        'Manage crop residue properly'
      ],
      'Corn Earworm': [
        'Apply Bt-based insecticides',
        'Use pheromone traps for monitoring',
        'Plant trap crops around field borders'
      ],
      'Fall Armyworm': [
        'Use targeted insecticides during early stages',
        'Apply biological control agents',
        'Monitor regularly with pheromone traps'
      ],
      'Bollworm': [
        'Apply appropriate insecticides',
        'Use pheromone traps for monitoring',
        'Practice integrated pest management'
      ],
      'Bacterial Blight': [
        'Apply copper-based treatments',
        'Improve field sanitation',
        'Use pathogen-free seeds'
      ]
    };

    const baseTreatments = treatments[pestDiseaseName] || [
      'Consult with agricultural extension officer',
      'Apply appropriate pesticide or fungicide',
      'Monitor crop regularly'
    ];

    // Add severity-based additional recommendations
    if (severity === 'High') {
      baseTreatments.unshift('Immediate treatment required');
    } else if (severity === 'Moderate') {
      baseTreatments.unshift('Apply treatment within 2-3 days');
    }

    return baseTreatments.slice(0, 4); // Return max 4 suggestions
  },

  // Validate image file
  validateImageFile: async (filePath) => {
    try {
      const stats = await fs.stat(filePath);
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.bmp'];
      const fileExtension = path.extname(filePath).toLowerCase();
      
      return {
        valid: allowedExtensions.includes(fileExtension) && stats.size <= 5 * 1024 * 1024, // 5MB max
        size: stats.size,
        extension: fileExtension
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
};

module.exports = imageClient;