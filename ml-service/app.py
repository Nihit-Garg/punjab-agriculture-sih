from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
from datetime import datetime
from models import PunjabCropPredictor

app = Flask(__name__)
CORS(app)

# Global variables
predictor = None
model_loaded = False

def load_models():
    """Load trained ML models"""
    global predictor, model_loaded
    
    try:
        if os.path.exists('./model/crop_recommender.pkl'):
            print("📂 Loading trained Punjab crop models...")
            predictor = PunjabCropPredictor()
            predictor.load_models('./model')
            model_loaded = True
            print("✅ Models loaded successfully!")
        else:
            print("⚠️ Model files not found. Using mock predictions.")
            predictor = None
            model_loaded = False
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        predictor = None
        model_loaded = False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Punjab Agriculture ML Microservice',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': model_loaded,
        'model_type': 'PunjabCropPredictor' if model_loaded else 'Mock'
    })

@app.route('/predict/crop-recommendation', methods=['POST'])
def predict_crop_recommendation():
    """Predict crop recommendations based on soil and weather data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract input data
        soil_data = data.get('soil_data', {})
        weather_data = data.get('weather_data', {})
        location = data.get('location', 'Unknown')
        
        # Prepare soil data with defaults
        processed_soil_data = {
            'nitrogen': soil_data.get('nitrogen', 150),
            'phosphorus': soil_data.get('phosphorus', 40),
            'potassium': soil_data.get('potassium', 100),
            'rainfall': weather_data.get('rainfall', 700),
            'temperature': weather_data.get('temperature', 25),
            'soil_type': soil_data.get('soil_type', 'loamy')
        }
        
        if predictor and model_loaded:
            # Use trained ML model
            recommendations = predictor.get_crop_recommendations(processed_soil_data, location)
            
            # Get fertilizer recommendations for top crop
            top_crop = recommendations[0]['crop'] if recommendations else 'wheat'
            fertilizer_recs = predictor.get_fertilizer_recommendations(processed_soil_data, top_crop)
            
            # Get soil health analysis
            soil_health = predictor.analyze_soil_health(processed_soil_data)
            
            return jsonify({
                'success': True,
                'recommendations': recommendations,
                'fertilizer_recommendations': fertilizer_recs,
                'soil_health': soil_health,
                'location': location,
                'input_data': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-punjab-trained'
            })
        else:
            # Use mock predictions
            mock_recommendations = generate_mock_crop_recommendations(processed_soil_data, location)
            
            return jsonify({
                'success': True,
                'recommendations': mock_recommendations,
                'fertilizer_recommendations': [],
                'soil_health': {'health_status': 'Average', 'recommendations': []},
                'location': location,
                'input_data': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-mock'
            })
        
    except Exception as e:
        return jsonify({
            'error': 'Crop recommendation failed',
            'message': str(e)
        }), 500

@app.route('/predict/yield-prediction', methods=['POST'])
def predict_yield():
    """Predict crop yield based on input parameters"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        crop_type = data.get('crop_type', 'wheat')
        soil_data = data.get('soil_data', {})
        weather_data = data.get('weather_data', {})
        area = data.get('area', 1.0)
        location = data.get('location', 'Unknown')
        
        # Prepare soil data
        processed_soil_data = {
            'nitrogen': soil_data.get('nitrogen', 150),
            'phosphorus': soil_data.get('phosphorus', 40),
            'potassium': soil_data.get('potassium', 100),
            'rainfall': weather_data.get('rainfall', 700),
            'temperature': weather_data.get('temperature', 25),
            'soil_type': soil_data.get('soil_type', 'loamy')
        }
        
        if predictor and model_loaded:
            # Use trained ML model to get recommendations
            recommendations = predictor.get_crop_recommendations(processed_soil_data, location)
            
            # Find the specific crop in recommendations or use first one
            crop_prediction = None
            for rec in recommendations:
                if rec['crop'].lower() == crop_type.lower():
                    crop_prediction = rec
                    break
            
            if not crop_prediction and recommendations:
                crop_prediction = recommendations[0]  # Use first recommendation
            
            if crop_prediction:
                # Calculate total production
                predicted_yield_per_ha = crop_prediction['predicted_yield']
                total_production = predicted_yield_per_ha * area
                
                prediction = {
                    'crop': crop_prediction['crop'],
                    'yield_per_hectare': predicted_yield_per_ha,
                    'total_production': total_production,
                    'area': area,
                    'confidence': crop_prediction['recommendation_confidence'],
                    'suitability_score': crop_prediction['suitability_score']
                }
            else:
                # Fallback prediction
                prediction = {
                    'crop': crop_type,
                    'yield_per_hectare': 3000,
                    'total_production': 3000 * area,
                    'area': area,
                    'confidence': 0.5,
                    'suitability_score': 0.7
                }
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'recommendations': recommendations,
                'location': location,
                'input_data': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-punjab-trained'
            })
        else:
            # Mock yield prediction
            base_yields = {
                'wheat': 4500, 'rice': 6000, 'potato': 25000, 'bajra': 2500,
                'maize': 5500, 'sugarcane': 70000, 'cotton': 500
            }
            
            base_yield = base_yields.get(crop_type.lower(), 4000)
            predicted_yield = base_yield * np.random.uniform(0.8, 1.2)
            total_production = predicted_yield * area
            
            prediction = {
                'crop': crop_type,
                'yield_per_hectare': predicted_yield,
                'total_production': total_production,
                'area': area,
                'confidence': 0.75,
                'suitability_score': 0.8
            }
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'recommendations': [],
                'location': location,
                'input_data': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-mock'
            })
        
    except Exception as e:
        return jsonify({
            'error': 'Yield prediction failed',
            'message': str(e)
        }), 500

@app.route('/predict/soil-analysis', methods=['POST'])
def analyze_soil():
    """Analyze soil health and provide recommendations"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        soil_data = data.get('soil_data', {})
        
        # Prepare soil data
        processed_soil_data = {
            'nitrogen': soil_data.get('nitrogen', 150),
            'phosphorus': soil_data.get('phosphorus', 40),
            'potassium': soil_data.get('potassium', 100),
            'soil_type': soil_data.get('soil_type', 'loamy')
        }
        
        if predictor and model_loaded:
            # Use trained model
            soil_health = predictor.analyze_soil_health(processed_soil_data)
            
            return jsonify({
                'success': True,
                'soil_health': soil_health,
                'npk_levels': {
                    'nitrogen': processed_soil_data['nitrogen'],
                    'phosphorus': processed_soil_data['phosphorus'],
                    'potassium': processed_soil_data['potassium']
                },
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-punjab-trained'
            })
        else:
            # Mock soil analysis
            total_nutrients = sum([
                processed_soil_data['nitrogen'],
                processed_soil_data['phosphorus'],
                processed_soil_data['potassium']
            ])
            
            if total_nutrients > 400:
                health_status = 'Good'
            elif total_nutrients > 250:
                health_status = 'Average'
            else:
                health_status = 'Poor'
            
            return jsonify({
                'success': True,
                'soil_health': {
                    'health_status': health_status,
                    'total_nutrients': total_nutrients,
                    'recommendations': [
                        'Regular soil testing recommended',
                        'Consider organic matter addition',
                        'Monitor nutrient levels'
                    ]
                },
                'npk_levels': {
                    'nitrogen': processed_soil_data['nitrogen'],
                    'phosphorus': processed_soil_data['phosphorus'],
                    'potassium': processed_soil_data['potassium']
                },
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-mock'
            })
        
    except Exception as e:
        return jsonify({
            'error': 'Soil analysis failed',
            'message': str(e)
        }), 500

@app.route('/predict/fertilizer-recommendation', methods=['POST'])
def recommend_fertilizer():
    """Get fertilizer recommendations for specific crop and soil"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        crop_type = data.get('crop_type', 'wheat')
        soil_data = data.get('soil_data', {})
        
        # Prepare soil data
        processed_soil_data = {
            'nitrogen': soil_data.get('nitrogen', 150),
            'phosphorus': soil_data.get('phosphorus', 40),
            'potassium': soil_data.get('potassium', 100)
        }
        
        if predictor and model_loaded:
            # Use trained model
            fertilizer_recs = predictor.get_fertilizer_recommendations(processed_soil_data, crop_type)
            
            return jsonify({
                'success': True,
                'crop_type': crop_type,
                'fertilizer_recommendations': fertilizer_recs,
                'soil_levels': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-punjab-trained'
            })
        else:
            # Mock fertilizer recommendations
            mock_recs = []
            if processed_soil_data['nitrogen'] < 120:
                mock_recs.append({
                    'nutrient': 'Nitrogen',
                    'deficit': 120 - processed_soil_data['nitrogen'],
                    'fertilizer': 'Urea',
                    'quantity': (120 - processed_soil_data['nitrogen']) / 0.46,
                    'unit': 'kg/ha'
                })
            
            return jsonify({
                'success': True,
                'crop_type': crop_type,
                'fertilizer_recommendations': mock_recs,
                'soil_levels': processed_soil_data,
                'timestamp': datetime.now().isoformat(),
                'model_version': 'v2.0.0-mock'
            })
        
    except Exception as e:
        return jsonify({
            'error': 'Fertilizer recommendation failed',
            'message': str(e)
        }), 500

def generate_mock_crop_recommendations(soil_data, location):
    """Generate mock crop recommendations for fallback"""
    crops = ['wheat', 'rice', 'potato', 'bajra']
    recommendations = []
    
    for i, crop in enumerate(crops):
        confidence = np.random.uniform(0.6, 0.9) - (i * 0.05)
        yield_estimate = np.random.uniform(3000, 5000) - (i * 200)
        
        recommendations.append({
            'crop': crop,
            'suitability_score': confidence,
            'recommendation_confidence': confidence,
            'predicted_yield': yield_estimate,
            'recommended': confidence > 0.7
        })
    
    return sorted(recommendations, key=lambda x: x['suitability_score'], reverse=True)

if __name__ == '__main__':
    print("🌾 Starting Punjab Agriculture ML Microservice 🌾")
    
    # Load models on startup
    load_models()
    
    # Start Flask app
    print("🚀 Starting server on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
