const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST 
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-backend';

    console.log(`🔗 Connecting to MongoDB: ${mongoURI}`);

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB connection options
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Log database name
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB shutdown:', error);
        process.exit(1);
      }
    });

    return conn;

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // In development, exit the process if database connection fails
    if (process.env.NODE_ENV !== 'production') {
      console.log('💡 Make sure MongoDB is running locally or update MONGODB_URI');
      console.log('💡 Install MongoDB: https://docs.mongodb.com/manual/installation/');
      console.log('💡 Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    }
    
    process.exit(1);
  }
};

// Health check function
const checkDBHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Test database connection with a simple operation
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState,
        collections: Object.keys(mongoose.connection.collections)
      };
    } else {
      return {
        status: 'disconnected',
        readyState: mongoose.connection.readyState,
        error: 'Database connection not ready'
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

// Clean database function (for testing)
const cleanDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Database cleaning is only allowed in test environment');
  }

  try {
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('🧹 Test database cleaned');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  cleanDatabase
};