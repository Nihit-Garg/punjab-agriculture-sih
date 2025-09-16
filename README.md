# Agriculture Advisory Backend

A comprehensive backend system for agricultural advisory services built with Node.js/Express and Python Flask ML microservice. This system provides crop recommendations, yield predictions, pest/disease detection, weather information, soil data analysis, and a peer advisory community platform.

## 🌾 Features

- **Crop Recommendation**: ML-powered crop suggestions based on soil and weather data
- **Yield Prediction**: Predict expected crop yields using machine learning
- **Pest/Disease Detection**: Image-based plant disease and pest identification
- **Weather Integration**: Current weather, forecasts, and historical data
- **Soil Data Analysis**: Comprehensive soil analysis and recommendations  
- **Peer Advisory Board**: Q&A community platform for farmers
- **RESTful API**: Clean, documented REST endpoints
- **Microservice Architecture**: Scalable Node.js + Python Flask design

## 🏗 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Node.js API     │    │  Python ML      │
│   (Client)      │◄──►│   (Express)      │◄──►│  Microservice   │
│                 │    │                  │    │   (Flask)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────▼──────┐
                       │   Data      │
                       │ (JSON/CSV)  │
                       └─────────────┘
```

## 📁 Project Structure

```
agri-backend/
├── app.js                      # Main Express application
├── package.json                # Node.js dependencies and scripts
├── models/                     # Service layer
│   ├── mlClient.js            # ML microservice client
│   └── imageClient.js         # Image processing service
├── routes/                     # API route definitions
│   ├── cropRoutes.js          # Crop recommendation & yield endpoints
│   ├── imageRoutes.js         # Image upload & analysis endpoints
│   ├── weatherRoutes.js       # Weather data endpoints
│   ├── peerBoardRoutes.js     # Community Q&A endpoints
│   └── soilDataRoutes.js      # Soil data endpoints
├── controllers/                # Business logic
│   ├── cropController.js
│   ├── imageController.js
│   ├── weatherController.js
│   ├── peerBoardController.js
│   └── soilDataController.js
├── data/                       # Data storage
│   ├── peer_board.json        # Community posts & answers
│   └── soil_data_punjab.csv   # Soil data for Punjab districts
├── uploads/                    # Image upload directory
├── ml-service/                 # Python ML microservice
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── model_training.py      # ML model training script
│   └── model.pkl             # Trained ML models (generated)
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Installation

1. **Clone and setup the main backend:**
```bash
cd ~/projects/agri-backend
npm install
```

2. **Setup the ML microservice:**
```bash
cd ml-service
pip install -r requirements.txt
```

3. **Optional: Train ML models (or use mock predictions):**
```bash
cd ml-service
python model_training.py
```

### Running the Services

1. **Start the ML microservice:**
```bash
cd ml-service
python app.py
# Runs on http://localhost:5000
```

2. **Start the main API server:**
```bash
npm start
# Runs on http://localhost:3000
```

3. **For development with auto-restart:**
```bash
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/crops/recommend` | POST | Get crop recommendations |
| `/crops/predict-yield` | POST | Predict crop yield |
| `/crops/info/:cropName` | GET | Get crop information |
| `/images/upload` | POST | Upload crop image |
| `/images/detect` | POST | Detect pests/diseases |
| `/weather` | GET | Current weather data |
| `/weather/forecast` | GET | Weather forecast |
| `/peer-board` | GET/POST | Community Q&A |
| `/soil-data` | GET | Soil data by district |

### Detailed API Examples

#### 1. Crop Recommendation

**POST** `/api/crops/recommend`

```json
{
  "soil_data": {
    "ph": 7.2,
    "nitrogen": 240,
    "phosphorus": 45,
    "potassium": 180,
    "organic_carbon": 0.65
  },
  "weather_data": {
    "temperature": 25,
    "humidity": 65,
    "rainfall": 150
  },
  "location": "Amritsar, Punjab"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "crop": "wheat",
        "confidence": 0.89,
        "reasons": ["Optimal pH for wheat", "Good nitrogen availability"]
      }
    ],
    "analysis": {
      "soil_suitability": 85,
      "weather_suitability": 78,
      "overall_score": 82
    }
  }
}
```

#### 2. Yield Prediction

**POST** `/api/crops/predict-yield`

```json
{
  "crop_type": "wheat",
  "soil_data": {
    "ph": 7.2,
    "nitrogen": 240,
    "phosphorus": 45,
    "potassium": 180
  },
  "weather_data": {
    "temperature": 22,
    "humidity": 60,
    "rainfall": 120
  },
  "area": 2.5,
  "location": "Punjab"
}
```

#### 3. Image Upload & Analysis

**POST** `/api/images/upload` (multipart/form-data)
```
image: [file]
```

**POST** `/api/images/detect`
```json
{
  "image_path": "uploads/image-123456789.jpg",
  "crop_type": "wheat"
}
```

#### 4. Weather Data

**GET** `/api/weather?location=punjab&district=amritsar`

**GET** `/api/weather/forecast?location=punjab&days=7`

#### 5. Peer Board Community

**GET** `/api/peer-board?limit=10&category=fertilizers`

**POST** `/api/peer-board`
```json
{
  "title": "Best irrigation schedule for rice?",
  "content": "Looking for advice on optimal irrigation timing...",
  "category": "irrigation",
  "author": "FarmerName",
  "type": "question"
}
```

#### 6. Soil Data

**GET** `/api/soil-data?district=amritsar`

**GET** `/api/soil-data/analysis?district=amritsar&crop=wheat`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
ML_SERVICE_URL=http://localhost:5000
NODE_ENV=development
```

### ML Service Configuration

The Python Flask service runs on port 5000 by default. Update `ML_SERVICE_URL` if running on different host/port.

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get crop recommendations
curl -X POST http://localhost:3000/api/crops/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "soil_data": {"ph": 7.2, "nitrogen": 240, "phosphorus": 45, "potassium": 180},
    "weather_data": {"temperature": 25, "humidity": 65, "rainfall": 150},
    "location": "Punjab"
  }'

# Get weather data
curl "http://localhost:3000/api/weather?location=punjab&district=amritsar"

# Get soil data
curl "http://localhost:3000/api/soil-data?district=amritsar"
```

### Using Postman

Import the following as a Postman collection or test individual endpoints with the examples above.

## 🎯 ML Models

The system includes two main ML components:

1. **Crop Recommendation Model**: Suggests optimal crops based on soil and weather conditions
2. **Yield Prediction Model**: Predicts expected yield for specified crops

### Model Training

Run the training script to create your own models:

```bash
cd ml-service
python model_training.py
```

This creates `model.pkl` with trained models. Without this file, the system uses intelligent mock predictions.

### Model Features

**Input Features:**
- Soil: pH, Nitrogen, Phosphorus, Potassium, Organic Carbon, Conductivity
- Weather: Temperature, Humidity, Rainfall
- Crop: Type, Area (for yield prediction)
- Location: Geographic context

## 🗃 Data Management

### Soil Data
- Stored in: `data/soil_data_punjab.csv`
- Contains district-wise soil parameters for Punjab
- Easily extendable to other regions

### Community Data
- Stored in: `data/peer_board.json`
- Contains questions, answers, and community interactions
- Automatically managed through API endpoints

### Image Storage
- Uploaded images stored in: `uploads/`
- Automatic cleanup available
- Supports: JPG, PNG, BMP (max 5MB)

## 🛠 Development

### Adding New Endpoints

1. Create route in appropriate `routes/*.js` file
2. Add controller logic in `controllers/*.js`
3. Add service logic in `models/*.js` if needed
4. Update this README

### Adding New ML Models

1. Update `ml-service/model_training.py` with your training logic
2. Modify `ml-service/app.py` to handle new prediction endpoints
3. Update `models/mlClient.js` to call new ML endpoints

### Database Integration

Currently uses JSON/CSV for simplicity. For production:

1. Replace JSON storage with MongoDB/PostgreSQL
2. Update controller methods to use database queries
3. Add proper data validation and relationships

## 🚀 Deployment

### Docker Deployment (Recommended)

Create `Dockerfile` for Node.js service:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Create `ml-service/Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Manual Deployment

1. **Prepare the server** with Node.js and Python
2. **Clone the repository**
3. **Install dependencies** for both services
4. **Set up process manager** (PM2 for Node.js, Gunicorn for Flask)
5. **Configure reverse proxy** (Nginx)
6. **Set environment variables**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Agricultural domain experts for guidance
- Open source ML libraries and frameworks
- Punjab Agricultural University for data insights

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the API documentation above
- Review the example requests in this README

---

**Happy Farming! 🌾**