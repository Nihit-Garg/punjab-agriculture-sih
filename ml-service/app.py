from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global variable to store loaded models
models = {}

def load_models():
    """Load ML models (or create mock models if files don't exist)"""
    try:
        # Try to load actual model files
        if os.path.exists('model.pkl'):
            with open('model.pkl', 'rb') as f:
                models['crop_recommendation'] = pickle.load(f)
                models['yield_prediction'] = pickle.load(f)
        else:
            # Create mock models for demonstration
            print("Model files not found. Using mock models for demonstration.")
            models['crop_recommendation'] = None
            models['yield_prediction'] = None
    except Exception as e:
        print(f"Error loading models: {e}")
        models['crop_recommendation'] = None
        models['yield_prediction'] = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Agriculture ML Microservice',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': len([m for m in models.values() if m is not None])
    })

@app.route('/predict/crop-recommendation', methods=['POST'])
def predict_crop_recommendation():
    """Predict crop recommendations based on soil and weather data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        soil_data = data.get('soil_data', {})
        weather_data = data.get('weather_data', {})
        location = data.get('location', 'Unknown')
        
        # Extract features from input data
        features = extract_crop_features(soil_data, weather_data)
        
        if models['crop_recommendation'] is None:
            # Use mock prediction logic
            recommendations = generate_mock_crop_recommendations(features, location)
        else:
            # Use actual ML model
            recommendations = predict_with_model(models['crop_recommendation'], features)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'location': location,
            'analysis': analyze_conditions(features),
            'timestamp': datetime.now().isoformat(),
            'model_version': 'v1.0.0'
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/predict/yield-prediction', methods=['POST'])
def predict_yield():
    """Predict crop yield based on input parameters"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        crop_type = data.get('crop_type', '')
        soil_data = data.get('soil_data', {})
        weather_data = data.get('weather_data', {})
        area = data.get('area', 1)
        location = data.get('location', 'Unknown')
        
        # Extract features
        features = extract_yield_features(crop_type, soil_data, weather_data, area)
        
        if models['yield_prediction'] is None:
            # Use mock prediction logic
            prediction = generate_mock_yield_prediction(crop_type, features, area)
        else:
            # Use actual ML model
            prediction = predict_yield_with_model(models['yield_prediction'], features)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'factors': analyze_yield_factors(features),
            'recommendations': generate_yield_recommendations(crop_type, features),
            'timestamp': datetime.now().isoformat(),
            'model_version': 'v1.0.0'
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Yield prediction failed',
            'message': str(e)
        }), 500

def extract_crop_features(soil_data, weather_data):
    """Extract and normalize features for crop recommendation"""
    features = {
        'ph': soil_data.get('ph', 7.0),
        'nitrogen': soil_data.get('nitrogen', 200),
        'phosphorus': soil_data.get('phosphorus', 40),
        'potassium': soil_data.get('potassium', 180),
        'temperature': weather_data.get('temperature', 25),
        'humidity': weather_data.get('humidity', 60),
        'rainfall': weather_data.get('rainfall', 100)
    }
    return features

def extract_yield_features(crop_type, soil_data, weather_data, area):
    """Extract features for yield prediction"""
    features = extract_crop_features(soil_data, weather_data)
    features.update({
        'crop_type': crop_type,
        'area': area,
        'organic_carbon': soil_data.get('organic_carbon', 0.6),
        'conductivity': soil_data.get('conductivity', 0.3)
    })
    return features

def generate_mock_crop_recommendations(features, location):
    """Generate mock crop recommendations"""
    crops = ['wheat', 'rice', 'maize', 'barley', 'sugarcane', 'cotton', 'mustard']
    
    # Simple rule-based mock logic
    recommendations = []
    
    # Rule 1: pH-based recommendations
    if features['ph'] > 6.5:
        suitable_crops = ['wheat', 'maize', 'barley']
    else:
        suitable_crops = ['rice', 'cotton']
    
    # Rule 2: Temperature-based filtering
    if features['temperature'] > 30:
        suitable_crops = [crop for crop in suitable_crops if crop in ['rice', 'cotton', 'sugarcane']]
    elif features['temperature'] < 20:
        suitable_crops = [crop for crop in suitable_crops if crop in ['wheat', 'barley']]
    
    # Select top 3 recommendations
    selected_crops = suitable_crops[:3] if len(suitable_crops) >= 3 else suitable_crops + crops[:3-len(suitable_crops)]
    
    for i, crop in enumerate(selected_crops):
        confidence = random.uniform(0.75, 0.95) - (i * 0.05)  # Decreasing confidence
        recommendations.append({
            'crop': crop,
            'confidence': round(confidence, 2),
            'reasons': generate_recommendation_reasons(crop, features)
        })
    
    return recommendations

def generate_mock_yield_prediction(crop_type, features, area):
    """Generate mock yield prediction"""
    base_yields = {
        'wheat': 4500,
        'rice': 6000,
        'maize': 5500,
        'barley': 3500,
        'sugarcane': 70000,
        'cotton': 500,
        'mustard': 1200
    }
    
    base_yield = base_yields.get(crop_type.lower(), 4000)
    
    # Apply feature-based modifications
    ph_factor = 1.0
    if features['ph'] < 6.0 or features['ph'] > 8.0:
        ph_factor = 0.9  # Reduce yield for extreme pH
    
    temperature_factor = 1.0
    if crop_type.lower() in ['wheat', 'barley'] and features['temperature'] > 30:
        temperature_factor = 0.8  # Heat stress
    elif crop_type.lower() in ['rice', 'sugarcane'] and features['temperature'] < 20:
        temperature_factor = 0.85  # Cold stress
    
    # Random variation
    random_factor = random.uniform(0.85, 1.15)
    
    predicted_yield = int(base_yield * ph_factor * temperature_factor * random_factor)
    
    return {
        'crop_type': crop_type,
        'predicted_yield': predicted_yield,
        'unit': 'kg/ha',
        'area': area,
        'total_production': predicted_yield * area,
        'confidence': round(random.uniform(0.70, 0.90), 2)
    }

def analyze_conditions(features):
    """Analyze soil and weather conditions"""
    return {
        'soil_suitability': calculate_soil_suitability(features),
        'weather_suitability': calculate_weather_suitability(features),
        'overall_score': calculate_overall_score(features)
    }

def calculate_soil_suitability(features):
    """Calculate soil suitability score (0-100)"""
    score = 100
    
    # pH scoring
    if 6.0 <= features['ph'] <= 7.5:
        ph_score = 100
    elif 5.5 <= features['ph'] < 6.0 or 7.5 < features['ph'] <= 8.0:
        ph_score = 80
    else:
        ph_score = 60
    
    # Nutrient scoring (simplified)
    nutrient_score = min(100, (features['nitrogen'] + features['phosphorus'] + features['potassium']) / 10)
    
    return int((ph_score + nutrient_score) / 2)

def calculate_weather_suitability(features):
    """Calculate weather suitability score (0-100)"""
    temp_score = 100 if 20 <= features['temperature'] <= 30 else 80
    humidity_score = 100 if 40 <= features['humidity'] <= 70 else 80
    return int((temp_score + humidity_score) / 2)

def calculate_overall_score(features):
    """Calculate overall suitability score"""
    soil_score = calculate_soil_suitability(features)
    weather_score = calculate_weather_suitability(features)
    return int((soil_score + weather_score) / 2)

def analyze_yield_factors(features):
    """Analyze factors affecting yield"""
    return {
        'soil_impact': calculate_soil_suitability(features),
        'weather_impact': calculate_weather_suitability(features),
        'management_impact': random.randint(80, 95)  # Mock management factor
    }

def generate_recommendation_reasons(crop, features):
    """Generate reasons for crop recommendation"""
    reasons = []
    
    if 6.0 <= features['ph'] <= 7.5:
        reasons.append(f"Optimal pH level ({features['ph']}) for {crop}")
    
    if features['nitrogen'] > 200:
        reasons.append("Good nitrogen availability in soil")
    
    if 20 <= features['temperature'] <= 30:
        reasons.append("Suitable temperature conditions")
    
    reasons.append("Historical performance data supports this crop")
    
    return reasons[:3]  # Return max 3 reasons

def generate_yield_recommendations(crop_type, features):
    """Generate recommendations to improve yield"""
    recommendations = [
        "Monitor soil moisture levels regularly",
        "Apply fertilizers based on soil test results",
        "Consider weather forecasts for irrigation planning"
    ]
    
    if features['ph'] < 6.0:
        recommendations.insert(0, "Apply lime to increase soil pH")
    elif features['ph'] > 8.0:
        recommendations.insert(0, "Apply gypsum to reduce soil pH")
    
    if features['nitrogen'] < 180:
        recommendations.insert(0, "Increase nitrogen fertilizer application")
    
    return recommendations[:4]  # Return max 4 recommendations

if __name__ == '__main__':
    print("Starting Agriculture ML Microservice...")
    load_models()
    app.run(host='0.0.0.0', port=5000, debug=True)