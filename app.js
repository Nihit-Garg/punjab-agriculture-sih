const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Database connection
const { connectDB, checkDBHealth } = require('./config/database');

// Import route modules
const cropRoutes = require('./routes/cropRoutes');
const imageRoutes = require('./routes/imageRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const peerBoardRoutes = require('./routes/peerBoardRoutes');
const soilDataRoutes = require('./routes/soilDataRoutes');
const languageRoutes = require('./routes/languageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Serve React frontend (development mode)
if (process.env.NODE_ENV !== 'production') {
  console.log('🚀 Development mode: Frontend will run on separate port');
} else {
  // In production, serve built React files
  app.use(express.static(path.join(__dirname, 'frontend/out')));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDBHealth();
  
  res.json({ 
    status: 'OK', 
    message: 'Agri Advisory Backend is running',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// API Routes
app.use('/api/crops', cropRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/peer-board', peerBoardRoutes);
app.use('/api/soil-data', soilDataRoutes);
app.use('/api/language', languageRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Agri Advisory Backend',
    version: '1.0.0',
    endpoints: {
      language: '/api/language',
      crops: '/api/crops',
      images: '/api/images', 
      weather: '/api/weather',
      peerBoard: '/api/peer-board',
      soilData: '/api/soil-data'
    },
    note: 'Start with /api/language/welcome for language selection'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Initialize server without database
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🌾 Agri Advisory Backend server is running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📊 Database: MongoDB connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
