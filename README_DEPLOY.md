# 🌾 Punjab Agriculture Advisory System

## 🚀 Live Demo
**🌍 Location-based agricultural advisory platform providing real-time insights for Punjab farmers**

### ✨ Key Features
- 🗺️ **GPS Location Detection** - Automatic location detection or manual input
- 🌡️ **Real-time Weather** - Live weather data via OpenWeatherMap API
- 🧪 **Soil Analysis** - Punjab district-wise soil data (22+ districts)
- 🌾 **Crop Recommendations** - Location-based crop suggestions
- 📊 **Yield Predictions** - Intelligent yield forecasting
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌐 **Multi-language** - English, Hindi, Punjabi support

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, MongoDB
- **APIs**: OpenWeatherMap, Geolocation API
- **Data**: Real Punjab agricultural district data
- **AI/ML**: Trained models for crop recommendations (optional)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenWeatherMap API key

### Installation
```bash
# Clone repository
git clone <your-repo-url>
cd agri-backend

# Install dependencies
npm install
cd frontend && npm install

# Setup environment variables
cp .env.example .env
# Add your OPENWEATHER_API_KEY

# Start development servers
npm run dev:web
```

### Environment Variables
```bash
# Required
OPENWEATHER_API_KEY=your_openweathermap_api_key
MONGODB_URI=mongodb://localhost:27017/agri-backend

# Optional
PORT=8000
NODE_ENV=development
```

## 🌐 Deployment

### Frontend (Vercel)
1. Fork/clone this repository
2. Connect to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy automatically

### Backend (Railway/Render)
1. Connect repository to hosting platform
2. Set environment variables
3. Deploy with automatic builds

## 📊 Features Demo

### 1. Location-Based Predictions
```
✅ Enter location (GPS or manual)
✅ Get district-specific soil data
✅ Receive tailored recommendations
```

### 2. Real Weather Integration
```
✅ Current temperature, humidity
✅ Weather conditions for farming
✅ Location-based weather alerts
```

### 3. Soil Health Analysis
```
✅ NPK analysis by district
✅ pH and conductivity data
✅ Soil improvement recommendations
```

### 4. Crop Recommendations
```
✅ Location-suitable crops
✅ Seasonal recommendations
✅ Confidence scoring
```

## 🗂️ Project Structure
```
agri-backend/
├── frontend/           # Next.js frontend application
├── controllers/        # API route controllers
├── models/            # Database schemas
├── routes/            # Express routes
├── data/              # Punjab agricultural data (CSV)
├── ml-service/        # Python ML microservice (optional)
└── migrations/        # Database seed scripts
```

## 🎯 API Endpoints
```bash
# Weather
GET  /api/weather?location=Amritsar

# Soil Analysis  
POST /api/soil-data/analyze
Body: {"location": "Amritsar"}

# Crop Recommendations
POST /api/crops/recommend
Body: {"location": "Amritsar", "soil_data": {...}}

# Yield Predictions
POST /api/crops/predict-yield
Body: {"crop_type": "wheat", "location": "Amritsar"}
```

## 📈 Data Sources
- **Soil Data**: Punjab Agricultural Department district-wise data
- **Weather**: OpenWeatherMap real-time API
- **Crop Info**: Agricultural research data
- **ML Models**: Custom trained models for Punjab agriculture

## 🚀 Production Features
- ✅ Real-time weather integration
- ✅ Location-based data processing
- ✅ Mobile-responsive design
- ✅ Professional UI/UX
- ✅ Multi-language support
- ✅ Scalable architecture
- ✅ API documentation

## 🔮 Future Enhancements
- Real-time ML model integration
- Image-based pest detection
- Market price integration
- Community features
- Government scheme integration

## 📝 License
MIT License - Feel free to use for educational and commercial purposes

---
**Built with ❤️ for Punjab farmers using modern web technologies**