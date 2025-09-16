"""
Agriculture ML Model Training Script
===================================

This script provides a template for training ML models for crop recommendation 
and yield prediction. Replace this with actual training code using your dataset.

To use this script:
1. Prepare your training data (CSV files with features and labels)
2. Uncomment and modify the training code below
3. Run: python model_training.py

The trained models will be saved as 'model.pkl' for use by the Flask microservice.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import pickle
import os

def create_sample_data():
    """
    Create sample training data for demonstration.
    Replace this with actual data loading from your CSV files.
    """
    print("Creating sample training data...")
    
    # Sample crop recommendation data
    np.random.seed(42)
    n_samples = 1000
    
    crop_data = {
        'ph': np.random.uniform(5.5, 8.5, n_samples),
        'nitrogen': np.random.uniform(100, 300, n_samples),
        'phosphorus': np.random.uniform(20, 60, n_samples),
        'potassium': np.random.uniform(100, 250, n_samples),
        'temperature': np.random.uniform(15, 35, n_samples),
        'humidity': np.random.uniform(30, 80, n_samples),
        'rainfall': np.random.uniform(50, 300, n_samples)
    }
    
    # Create synthetic labels based on simple rules
    crops = ['wheat', 'rice', 'maize', 'barley', 'cotton']
    crop_labels = []
    
    for i in range(n_samples):
        if crop_data['ph'][i] > 7.0 and crop_data['temperature'][i] < 25:
            crop_labels.append('wheat')
        elif crop_data['ph'][i] < 6.5 and crop_data['temperature'][i] > 25:
            crop_labels.append('rice')
        elif crop_data['temperature'][i] > 20 and crop_data['rainfall'][i] > 150:
            crop_labels.append('maize')
        elif crop_data['temperature'][i] < 22:
            crop_labels.append('barley')
        else:
            crop_labels.append('cotton')
    
    crop_df = pd.DataFrame(crop_data)
    crop_df['crop'] = crop_labels
    
    # Sample yield prediction data
    yield_data = crop_data.copy()
    yield_base = {'wheat': 4500, 'rice': 6000, 'maize': 5500, 'barley': 3500, 'cotton': 500}
    
    yield_labels = []
    for i in range(n_samples):
        crop = crop_labels[i]
        base_yield = yield_base[crop]
        # Add some variation based on conditions
        ph_factor = 1.0 if 6.0 <= crop_data['ph'][i] <= 7.5 else 0.9
        temp_factor = 1.0 if 20 <= crop_data['temperature'][i] <= 30 else 0.9
        yield_val = base_yield * ph_factor * temp_factor * np.random.uniform(0.8, 1.2)
        yield_labels.append(yield_val)
    
    yield_df = pd.DataFrame(yield_data)
    yield_df['crop'] = crop_labels
    yield_df['yield'] = yield_labels
    
    return crop_df, yield_df

def train_crop_recommendation_model(crop_df):
    """Train crop recommendation model"""
    print("Training crop recommendation model...")
    
    feature_columns = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'rainfall']
    X = crop_df[feature_columns]
    y = crop_df['crop']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Crop Recommendation Model Accuracy: {accuracy:.2f}")
    
    return model

def train_yield_prediction_model(yield_df):
    """Train yield prediction model"""
    print("Training yield prediction model...")
    
    # Encode crop types
    crop_encoded = pd.get_dummies(yield_df['crop'])
    feature_columns = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'rainfall']
    
    X = pd.concat([yield_df[feature_columns], crop_encoded], axis=1)
    y = yield_df['yield']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    print(f"Yield Prediction Model RMSE: {rmse:.2f}")
    
    return model

def save_models(crop_model, yield_model):
    """Save trained models"""
    print("Saving models...")
    
    models = {
        'crop_recommendation': crop_model,
        'yield_prediction': yield_model,
        'feature_columns': ['ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'rainfall'],
        'crop_classes': ['wheat', 'rice', 'maize', 'barley', 'cotton']
    }
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(models, f)
    
    print("Models saved successfully as 'model.pkl'")

def main():
    """Main training function"""
    print("=== Agriculture ML Model Training ===")
    print("Note: This is a demonstration script with synthetic data.")
    print("Replace with your actual training data for production use.")
    print()
    
    # Create or load training data
    crop_df, yield_df = create_sample_data()
    
    # Train models
    crop_model = train_crop_recommendation_model(crop_df)
    yield_model = train_yield_prediction_model(yield_df)
    
    # Save models
    save_models(crop_model, yield_model)
    
    print()
    print("Training completed! You can now run the Flask microservice.")
    print("Start the service with: python app.py")

if __name__ == "__main__":
    main()