const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const PeerBoard = require('../models/schemas/PeerBoard');
const SoilData = require('../models/schemas/SoilData');

// Connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-backend');
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Sample peer board data
const samplePeerBoardData = [
  {
    title: "Best fertilizer for wheat in winter?",
    content: "I'm planning to grow wheat this rabi season in Punjab. What fertilizer combination would give me the best yield? My soil has pH 7.2.",
    category: "fertilizers",
    author: "Gurdeep Singh",
    authorLocation: "Amritsar, Punjab",
    type: "question",
    tags: ["wheat", "fertilizer", "rabi", "punjab"],
    cropType: "wheat",
    season: "rabi",
    priority: "medium",
    answers: [
      {
        content: "For wheat with pH 7.2, I recommend DAP at sowing (100 kg/acre) and urea in 2 splits - first at tillering (50 kg/acre) and second at grain filling (25 kg/acre). Also add 25 kg/acre potash.",
        author: "Expert Farmer",
        authorLocation: "Ludhiana, Punjab",
        upvotes: 8,
        isVerified: true,
        verifiedBy: "Agricultural Expert"
      }
    ],
    upvotes: 12,
    views: 45,
    status: "answered"
  },
  {
    title: "White spots on cotton leaves - need help!",
    content: "I noticed white powdery spots on my cotton plants. The leaves are turning yellow. This started after recent rains. What could this be and how to treat it?",
    category: "pest-control",
    author: "Rajesh Kumar",
    authorLocation: "Bathinda, Punjab",
    type: "question",
    tags: ["cotton", "disease", "white-spots", "leaf-problem"],
    cropType: "cotton",
    season: "kharif",
    priority: "high",
    answers: [
      {
        content: "This sounds like powdery mildew. Spray with propiconazole 25% EC @ 1ml/liter water. Also improve air circulation and avoid overhead watering.",
        author: "Dr. Plant Pathologist",
        authorLocation: "PAU Ludhiana",
        upvotes: 15,
        isVerified: true,
        verifiedBy: "Plant Pathology Expert"
      },
      {
        content: "I had similar issue last year. Neem oil spray (5ml/liter) every 7 days worked well for me. Also remove affected leaves.",
        author: "Experienced Farmer",
        authorLocation: "Faridkot, Punjab",
        upvotes: 6
      }
    ],
    upvotes: 18,
    views: 67,
    status: "answered"
  },
  {
    title: "Organic farming tips for rice",
    content: "Sharing my 5-year experience with organic rice farming. Use cow dung compost (2 tons/acre), neem cake (100 kg/acre), and bio-fertilizers. Yield is 85% of chemical farming but price is 40% higher!",
    category: "organic-farming",
    author: "Organic Farmer",
    authorLocation: "Jalandhar, Punjab",
    type: "tip",
    tags: ["rice", "organic", "compost", "bio-fertilizer"],
    cropType: "rice",
    season: "kharif",
    priority: "medium",
    answers: [
      {
        content: "Great advice! Which bio-fertilizers do you use? I'm interested in starting organic farming next season.",
        author: "New Farmer",
        authorLocation: "Patiala, Punjab",
        upvotes: 3
      }
    ],
    upvotes: 25,
    views: 89,
    status: "open",
    isFeatured: true
  },
  {
    title: "Irrigation schedule for sugarcane",
    content: "What's the optimal irrigation schedule for sugarcane in Punjab climate? How much water per irrigation?",
    category: "irrigation",
    author: "Sugarcane Grower",
    authorLocation: "Gurdaspur, Punjab",
    type: "question",
    tags: ["sugarcane", "irrigation", "water-management"],
    cropType: "sugarcane",
    season: "all",
    priority: "medium",
    upvotes: 8,
    views: 34,
    status: "open"
  }
];

// Sample soil data
const sampleSoilData = [
  {
    district: "Amritsar",
    state: "Punjab",
    region: "Majha",
    location: {
      type: "Point",
      coordinates: [74.8723, 31.6340] // [longitude, latitude]
    },
    soilType: "alluvial",
    soilTexture: "loam",
    averageData: {
      ph: 7.2,
      nitrogen: 240,
      phosphorus: 45,
      potassium: 180,
      organicCarbon: 0.65,
      conductivity: 0.28,
      calcium: 1200,
      magnesium: 280,
      sulfur: 15,
      zinc: 0.8,
      iron: 18
    },
    seasonalData: {
      kharif: {
        ph: 7.0,
        nitrogen: 220,
        phosphorus: 42,
        potassium: 175,
        organicCarbon: 0.62,
        conductivity: 0.30
      },
      rabi: {
        ph: 7.4,
        nitrogen: 260,
        phosphorus: 48,
        potassium: 185,
        organicCarbon: 0.68,
        conductivity: 0.26
      }
    },
    recommendations: {
      suitableCrops: [
        { name: "wheat", season: "rabi", suitabilityScore: 92 },
        { name: "rice", season: "kharif", suitabilityScore: 88 },
        { name: "maize", season: "kharif", suitabilityScore: 85 },
        { name: "sugarcane", season: "all", suitabilityScore: 80 }
      ],
      fertilizers: [
        { type: "Urea", quantity: "100-120 kg/acre", timing: "Split application", notes: "For wheat and rice" },
        { type: "DAP", quantity: "50-60 kg/acre", timing: "At sowing", notes: "For phosphorus needs" },
        { type: "Potash", quantity: "25-30 kg/acre", timing: "At sowing", notes: "For potassium requirement" }
      ],
      improvements: [
        "Maintain organic matter through crop residue incorporation",
        "Practice crop rotation with legumes",
        "Use balanced fertilization"
      ],
      warnings: []
    },
    climateData: {
      averageRainfall: 650,
      averageTemperature: { min: 18, max: 35 },
      humidity: 65
    },
    dataSource: "government-survey",
    reliability: "high",
    sampleCount: 25,
    metadata: {
      collectedBy: "Punjab Agricultural University",
      methodology: "Grid sampling",
      season: "rabi",
      year: 2024
    }
  },
  {
    district: "Ludhiana",
    state: "Punjab", 
    region: "Malwa",
    location: {
      type: "Point",
      coordinates: [75.8573, 30.9010]
    },
    soilType: "alluvial",
    soilTexture: "sandy-loam",
    averageData: {
      ph: 6.8,
      nitrogen: 220,
      phosphorus: 38,
      potassium: 195,
      organicCarbon: 0.58,
      conductivity: 0.31,
      calcium: 1100,
      magnesium: 260,
      sulfur: 12,
      zinc: 0.6,
      iron: 22
    },
    seasonalData: {
      kharif: {
        ph: 6.6,
        nitrogen: 200,
        phosphorus: 35,
        potassium: 190,
        organicCarbon: 0.55,
        conductivity: 0.33
      },
      rabi: {
        ph: 7.0,
        nitrogen: 240,
        phosphorus: 41,
        potassium: 200,
        organicCarbon: 0.61,
        conductivity: 0.29
      }
    },
    recommendations: {
      suitableCrops: [
        { name: "wheat", season: "rabi", suitabilityScore: 90 },
        { name: "rice", season: "kharif", suitabilityScore: 86 },
        { name: "cotton", season: "kharif", suitabilityScore: 82 },
        { name: "sugarcane", season: "all", suitabilityScore: 88 }
      ],
      fertilizers: [
        { type: "Urea", quantity: "110-130 kg/acre", timing: "Split application", notes: "Higher N requirement" },
        { type: "SSP", quantity: "60-70 kg/acre", timing: "At sowing", notes: "For phosphorus and sulfur" },
        { type: "MOP", quantity: "30-35 kg/acre", timing: "At sowing", notes: "For potassium" }
      ],
      improvements: [
        "Increase organic matter content",
        "Consider lime application if pH drops further",
        "Zinc supplementation recommended"
      ],
      warnings: [
        "Monitor pH levels regularly",
        "Zinc deficiency may occur"
      ]
    },
    climateData: {
      averageRainfall: 750,
      averageTemperature: { min: 20, max: 38 },
      humidity: 68
    },
    dataSource: "lab-test",
    reliability: "high",
    sampleCount: 18,
    metadata: {
      collectedBy: "Department of Agriculture",
      labName: "Soil Testing Laboratory, Ludhiana",
      methodology: "Composite sampling",
      season: "kharif",
      year: 2024
    }
  },
  {
    district: "Bathinda",
    state: "Punjab",
    region: "Malwa",
    location: {
      type: "Point",
      coordinates: [74.9455, 30.2110]
    },
    soilType: "alluvial",
    soilTexture: "sandy-clay",
    averageData: {
      ph: 6.9,
      nitrogen: 200,
      phosphorus: 35,
      potassium: 185,
      organicCarbon: 0.51,
      conductivity: 0.33,
      calcium: 980,
      magnesium: 240,
      sulfur: 10,
      zinc: 0.5,
      iron: 25
    },
    recommendations: {
      suitableCrops: [
        { name: "cotton", season: "kharif", suitabilityScore: 88 },
        { name: "wheat", season: "rabi", suitabilityScore: 84 },
        { name: "mustard", season: "rabi", suitabilityScore: 86 },
        { name: "fodder", season: "all", suitabilityScore: 82 }
      ],
      fertilizers: [
        { type: "Urea", quantity: "100-120 kg/acre", timing: "Split application", notes: "Based on crop" },
        { type: "DAP", quantity: "50-60 kg/acre", timing: "At sowing", notes: "For phosphorus" }
      ],
      improvements: [
        "Increase organic carbon through FYM application",
        "Consider zinc sulfate application",
        "Improve drainage in some areas"
      ],
      warnings: [
        "Low organic carbon levels",
        "Zinc deficiency risk"
      ]
    },
    climateData: {
      averageRainfall: 450,
      averageTemperature: { min: 22, max: 42 },
      humidity: 58
    },
    dataSource: "government-survey",
    reliability: "medium",
    sampleCount: 12,
    metadata: {
      collectedBy: "Agriculture Department",
      methodology: "Random sampling",
      season: "rabi",
      year: 2023
    }
  }
];

// Seed functions
const seedPeerBoard = async () => {
  try {
    // Clear existing data
    await PeerBoard.deleteMany({});
    console.log('🧹 Cleared existing peer board data');
    
    // Insert sample data
    const insertedPosts = await PeerBoard.insertMany(samplePeerBoardData);
    console.log(`✅ Inserted ${insertedPosts.length} peer board posts`);
  } catch (error) {
    console.error('❌ Error seeding peer board data:', error);
  }
};

const seedSoilData = async () => {
  try {
    // Clear existing data
    await SoilData.deleteMany({});
    console.log('🧹 Cleared existing soil data');
    
    // Insert sample data
    const insertedData = await SoilData.insertMany(sampleSoilData);
    console.log(`✅ Inserted ${insertedData.length} soil data records`);
  } catch (error) {
    console.error('❌ Error seeding soil data:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    await connectDB();
    
    await seedPeerBoard();
    await seedSoilData();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedPeerBoard, seedSoilData };