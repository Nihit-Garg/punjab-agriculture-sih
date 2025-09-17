#!/usr/bin/env python3
import os
import pandas as pd
import numpy as np
from models import PunjabCropPredictor
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import warnings
warnings.filterwarnings('ignore')

def load_training_data(data_file='training_data.csv'):
    """Load the preprocessed training data"""
    print("📂 Loading training data...")
    
    if not os.path.exists(data_file):
        print(f"⚠️ Training data file {data_file} not found!")
        # Generate synthetic data for testing
        print("🔄 Generating synthetic training data...")
        return generate_synthetic_data()
    
    data = pd.read_csv(data_file)
    print(f"✅ Loaded {len(data)} training samples")
    
    return data

def generate_synthetic_data(samples=1000):
    """Generate synthetic data for model training if real data is unavailable"""
    print("🧪 Generating synthetic training data...")
    
    np.random.seed(42)
    
    # Districts in Punjab
    districts = [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot',
        'Patiala', 'Rupnagar', 'SAS Nagar', 'Sangrur', 'Shahid Bhagat Singh Nagar',
        'Tarn Taran'
    ]
    
    # Soil types
    soil_types = ['loamy', 'clayey', 'sandy', 'black', 'red', 'alluvial']
    
    # Crops
    crops = ['rice', 'wheat', 'potato', 'bajra']
    
    # Define ranges for features
    feature_ranges = {
        'nitrogen': (50, 250),
        'phosphorus': (20, 150),
        'potassium': (30, 200),
        'rainfall': (500, 1500),
        'temperature': (20, 35),
        'suitability_score': (0.1, 1.0),
        'expected_yield': (1000, 5000)
    }
    
    # NPK requirements for different crops
    crop_requirements = {
        'rice': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
        'wheat': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
        'potato': {'nitrogen': 175, 'phosphorus': 100, 'potassium': 175},
        'bajra': {'nitrogen': 60, 'phosphorus': 30, 'potassium': 30}
    }
    
    data = []
    
    for _ in range(samples):
        # Select random crop, district, soil type
        crop = np.random.choice(crops)
        district = np.random.choice(districts)
        soil_type = np.random.choice(soil_types)
        
        # Generate random NPK values
        nitrogen = np.random.uniform(feature_ranges['nitrogen'][0], feature_ranges['nitrogen'][1])
        phosphorus = np.random.uniform(feature_ranges['phosphorus'][0], feature_ranges['phosphorus'][1])
        potassium = np.random.uniform(feature_ranges['potassium'][0], feature_ranges['potassium'][1])
        
        # Generate other features
        rainfall = np.random.uniform(feature_ranges['rainfall'][0], feature_ranges['rainfall'][1])
        temperature = np.random.uniform(feature_ranges['temperature'][0], feature_ranges['temperature'][1])
        
        # Calculate suitability based on NPK requirements
        requirements = crop_requirements[crop]
        n_score = min(1.0, nitrogen / requirements['nitrogen'])
        p_score = min(1.0, phosphorus / requirements['phosphorus'])
        k_score = min(1.0, potassium / requirements['potassium'])
        suitability_score = np.mean([n_score, p_score, k_score])
        
        # Determine if crop is recommended
        recommended = 1 if suitability_score >= 0.7 else 0
        
        # Generate expected yield (more suitable = higher yield)
        base_yield = feature_ranges['expected_yield'][0]
        yield_range = feature_ranges['expected_yield'][1] - feature_ranges['expected_yield'][0]
        noise = np.random.normal(0, 0.1)  # Add some noise
        expected_yield = base_yield + yield_range * (suitability_score + noise)
        expected_yield = max(500, min(6000, expected_yield))  # Clip to realistic range
        
        # Build sample
        sample = {
            'crop': crop,
            'district': district,
            'soil_type': soil_type,
            'nitrogen': nitrogen,
            'phosphorus': phosphorus,
            'potassium': potassium,
            'rainfall': rainfall,
            'temperature': temperature,
            'suitability_score': suitability_score,
            'recommended': recommended,
            'expected_yield': expected_yield
        }
        
        data.append(sample)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save synthetic data
    df.to_csv('synthetic_training_data.csv', index=False)
    print(f"✅ Generated {len(df)} synthetic training samples")
    
    return df

def plot_feature_importance(predictor, features, save_dir='./plots'):
    """Plot feature importance for the crop recommender model"""
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': predictor.crop_recommender.feature_importances_
    }).sort_values('importance', ascending=False)
    
    plt.figure(figsize=(12, 6))
    sns.barplot(x='importance', y='feature', data=feature_importance)
    plt.title('Feature Importance for Crop Recommendation')
    plt.tight_layout()
    plt.savefig(f'{save_dir}/feature_importance.png')
    print(f"📊 Feature importance plot saved to {save_dir}/feature_importance.png")

def plot_confusion_matrix(predictor, X_test, y_test, save_dir='./plots'):
    """Plot confusion matrix for the crop recommender model"""
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    y_pred = predictor.crop_recommender.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(f'{save_dir}/confusion_matrix.png')
    print(f"📊 Confusion matrix plot saved to {save_dir}/confusion_matrix.png")

def evaluate_crop_recommender(predictor, training_data, save_dir='./plots'):
    """Evaluate crop recommender model and save plots"""
    # Prepare features and labels
    features = [
        'nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature',
        'soil_type_encoded', 'district_encoded', 'npk_ratio', 'pk_ratio',
        'total_nutrients', 'nutrient_balance', 'rainfall_nitrogen', 'temp_phosphorus'
    ]
    
    X = training_data[features]
    y = training_data['recommended']
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    X_test_scaled = predictor.scaler.transform(X_test)
    
    # Plot feature importance
    plot_feature_importance(predictor, features, save_dir)
    
    # Plot confusion matrix
    plot_confusion_matrix(predictor, X_test_scaled, y_test, save_dir)
    
    # Print classification report
    from sklearn.metrics import classification_report
    y_pred = predictor.crop_recommender.predict(X_test_scaled)
    print("\n📊 Crop Recommender Classification Report:")
    print(classification_report(y_test, y_pred))

def evaluate_yield_predictor(predictor, training_data, save_dir='./plots'):
    """Evaluate yield predictor model and save plots"""
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    # Prepare features and target (use same features as crop recommender)
    features = [
        'nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature',
        'soil_type_encoded', 'district_encoded', 'npk_ratio', 'pk_ratio',
        'total_nutrients', 'nutrient_balance', 'rainfall_nitrogen', 'temp_phosphorus'
    ]
    
    X = training_data[features]
    y = training_data['expected_yield']
    
    # Split data
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    X_test_scaled = predictor.scaler.transform(X_test)
    
    # Make predictions
    y_pred = predictor.yield_predictor.predict(X_test_scaled)
    
    # Plot actual vs predicted yields
    plt.figure(figsize=(10, 8))
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
    plt.xlabel('Actual Yield (kg/ha)')
    plt.ylabel('Predicted Yield (kg/ha)')
    plt.title('Actual vs Predicted Crop Yields')
    plt.tight_layout()
    plt.savefig(f'{save_dir}/yield_predictions.png')
    print(f"📊 Yield prediction plot saved to {save_dir}/yield_predictions.png")
    
    # Calculate error distribution
    errors = y_pred - y_test
    
    # Plot error distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(errors, kde=True)
    plt.xlabel('Prediction Error (kg/ha)')
    plt.ylabel('Frequency')
    plt.title('Yield Prediction Error Distribution')
    plt.tight_layout()
    plt.savefig(f'{save_dir}/yield_error_distribution.png')
    print(f"📊 Yield error distribution plot saved to {save_dir}/yield_error_distribution.png")

def main():
    print("🌾 Starting Punjab Crop ML Model Training 🌾")
    
    # Create model directory if it doesn't exist
    model_dir = './model'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    # Create plots directory if it doesn't exist
    plots_dir = './plots'
    if not os.path.exists(plots_dir):
        os.makedirs(plots_dir)
    
    # Load training data
    training_data = load_training_data()
    
    # Initialize the crop predictor
    predictor = PunjabCropPredictor()
    
    # Prepare features (feature engineering)
    training_data = predictor.prepare_features(training_data)
    
    # Build and train crop recommender model
    predictor.build_crop_recommender(training_data)
    
    # Build and train yield predictor model
    predictor.build_yield_predictor(training_data)
    
    # Build and train soil classifier
    predictor.build_soil_classifier(training_data)
    
    # Evaluate models
    evaluate_crop_recommender(predictor, training_data, plots_dir)
    evaluate_yield_predictor(predictor, training_data, plots_dir)
    
    # Save models
    predictor.save_models(model_dir)
    
    # Test model with sample soil data
    sample_soil_data = {
        'nitrogen': 140,
        'phosphorus': 60,
        'potassium': 80,
        'rainfall': 800,
        'temperature': 28,
        'soil_type': 'loamy'
    }
    
    print("\n🧪 Testing model with sample soil data:")
    print(f"NPK: {sample_soil_data['nitrogen']}-{sample_soil_data['phosphorus']}-{sample_soil_data['potassium']}")
    print(f"Climate: {sample_soil_data['rainfall']}mm rainfall, {sample_soil_data['temperature']}°C")
    
    # Get crop recommendations
    recommendations = predictor.get_crop_recommendations(sample_soil_data, 'Ludhiana')
    
    print("\n📊 Crop Recommendations for Sample Data:")
    for rec in recommendations:
        print(f"Crop: {rec['crop']}, Suitability: {rec['suitability_score']:.2f}, "
              f"Confidence: {rec['recommendation_confidence']:.2f}, "
              f"Predicted Yield: {rec['predicted_yield']:.0f} kg/ha, "
              f"Recommended: {'Yes' if rec['recommended'] else 'No'}")
    
    # Get fertilizer recommendations for top crop
    top_crop = recommendations[0]['crop']
    fertilizer_recs = predictor.get_fertilizer_recommendations(sample_soil_data, top_crop)
    
    print(f"\n📊 Fertilizer Recommendations for {top_crop}:")
    if fertilizer_recs:
        for rec in fertilizer_recs:
            print(f"{rec['nutrient']} ({rec['deficit']:.1f} kg/ha deficit): "
                  f"Apply {rec['quantity']:.1f} kg/ha of {rec['fertilizer']}")
    else:
        print("No additional fertilizers needed - soil nutrient levels are adequate!")
    
    # Get soil health analysis
    soil_health = predictor.analyze_soil_health(sample_soil_data)
    
    print(f"\n📊 Soil Health Analysis:")
    print(f"Health Status: {soil_health['health_status']}")
    print(f"Total Nutrients: {soil_health['total_nutrients']:.1f}")
    
    print("\n🌱 Soil Health Recommendations:")
    for rec in soil_health['recommendations']:
        print(f"- {rec}")
    
    print("\n✅ Punjab Crop ML Model Training Complete!")
    print(f"\n📂 Models saved in: {model_dir}/")
    print(f"📊 Evaluation plots saved in: {plots_dir}/")
    print("\nNext steps:")
    print("1. Update the Flask microservice app.py to use the trained models")
    print("2. Test the ML service with real data")
    print("3. Integrate with the Node.js backend")

if __name__ == "__main__":
    main()