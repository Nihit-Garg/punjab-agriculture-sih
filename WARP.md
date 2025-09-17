# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a dual-stack agriculture advisory backend system that combines Node.js/Express REST API with Python Flask ML microservice. The system provides intelligent crop recommendations, yield predictions, pest/disease detection, weather integration, soil analysis, and peer advisory community features for farmers.

## Architecture

The system follows a microservices pattern with two main components:

- **Node.js API Server** (port 3000): Express-based REST API handling business logic, routing, and data management
- **Python ML Microservice** (port 5000): Flask-based service providing machine learning predictions for crops and yield

Key architectural patterns:
- **Service Layer**: `models/` directory contains service clients (`mlClient.js`, `imageClient.js`)
- **Controller-Route Pattern**: Each domain has dedicated routes (`routes/`) and controllers (`controllers/`)
- **Graceful ML Fallback**: When ML service is unavailable, Node.js API provides intelligent mock responses
- **Microservice Communication**: HTTP-based communication between services using axios client

## Development Commands

### Setup and Installation
```bash
# Install Node.js dependencies
npm install

# Setup ML microservice
cd ml-service && pip install -r requirements.txt

# Return to root
cd ..
```

### Running Services

```bash
# Start both services in separate terminals:

# Terminal 1: Start ML microservice
cd ml-service && python app.py

# Terminal 2: Start Node.js API
npm start

# For development with auto-restart
npm run dev

# Quick ML service start from root
npm run ml-service
```

### ML Model Management

```bash
# Train ML models (creates model.pkl)
cd ml-service && python model_training.py

# Note: Without model.pkl, system uses intelligent mock predictions
```

## Service Communication

The Node.js API communicates with the Python ML service via HTTP:
- ML Service URL: `http://localhost:5000` (configurable via `ML_SERVICE_URL` env var)
- Automatic fallback to mock predictions when ML service is unavailable
- Health check endpoint: `/health` on both services

## Key File Patterns

### Adding New API Endpoints
1. Create route handler in `routes/{domain}Routes.js`
2. Implement business logic in `controllers/{domain}Controller.js`
3. Add service layer logic in `models/` if external service communication needed
4. Follow existing error handling patterns with try/catch and proper HTTP status codes

### ML Service Integration
- Use `mlClient.js` for all ML service communication
- Client includes automatic retry logic and mock fallbacks
- All ML endpoints return consistent JSON structure with `success`, `data`, and `timestamp` fields

### Data Management
- Static data stored in `data/` directory (JSON/CSV files)
- Image uploads handled in `uploads/` directory
- Environment variables in `.env` (not tracked in git)

## API Structure

All endpoints are prefixed with `/api/`:
- `/api/crops/*` - Crop recommendations and yield predictions
- `/api/images/*` - Image upload and pest/disease detection
- `/api/weather/*` - Weather data and forecasts
- `/api/peer-board/*` - Community Q&A functionality
- `/api/soil-data/*` - Soil analysis and district data

## Database Integration

The system now uses MongoDB for data persistence instead of JSON files:
- **Models**: Complete Mongoose schemas in `models/schemas/`
- **Connection**: Automatic database connection with health monitoring
- **Collections**: PeerBoard, SoilData, WeatherCache, CropAnalysis, ImageAnalysis
- **Features**: Geospatial indexing, text search, TTL expiration, data validation

## Environment Configuration

Required environment variables:
```bash
PORT=3000
ML_SERVICE_URL=http://localhost:5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agri-backend
MONGODB_URI_TEST=mongodb://localhost:27017/agri-backend-test

# Weather API Configuration
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

## Development Notes

- No testing framework currently configured
- Uses file-based data storage (JSON/CSV) rather than databases
- ML models (*.pkl) are gitignored due to size
- Both services include health check endpoints for monitoring
- CORS enabled for all origins in development
- File uploads limited to 10MB with multer middleware

## Error Handling

The system uses consistent error response patterns:
- HTTP status codes with JSON error messages
- Global error middleware in Express app
- Graceful degradation when ML service is unavailable
- Timeout handling for ML service requests (10 seconds)