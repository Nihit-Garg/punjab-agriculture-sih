import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

class PunjabCropPredictor:
    def __init__(self):
        self.crop_recommender = None
        self.yield_predictor = None
        self.soil_classifier = None
        self.scaler = StandardScaler()
        self.soil_scaler = StandardScaler()
        self.label_encoders = {}
        self.crop_encoder = LabelEncoder()
        
    def prepare_features(self, data):
        """Prepare features for ML models"""
        print("🔧 Preparing features...")
        
        # Encode categorical variables
        if 'soil_type' not in self.label_encoders:
            self.label_encoders['soil_type'] = LabelEncoder()
            data['soil_type_encoded'] = self.label_encoders['soil_type'].fit_transform(data['soil_type'])
        else:
            data['soil_type_encoded'] = self.label_encoders['soil_type'].transform(data['soil_type'])
            
        if 'district' not in self.label_encoders:
            self.label_encoders['district'] = LabelEncoder()
            data['district_encoded'] = self.label_encoders['district'].fit_transform(data['district'])
        else:
            data['district_encoded'] = self.label_encoders['district'].transform(data['district'])
        
        # Create derived features
        data['npk_ratio'] = data['nitrogen'] / (data['phosphorus'] + data['potassium'] + 1)
        data['pk_ratio'] = data['phosphorus'] / (data['potassium'] + 1)
        data['total_nutrients'] = data['nitrogen'] + data['phosphorus'] + data['potassium']
        data['nutrient_balance'] = np.abs(data['nitrogen'] - data['phosphorus'] - data['potassium'])
        
        # Climate-soil interaction features
        data['rainfall_nitrogen'] = data['rainfall'] * data['nitrogen'] / 1000
        data['temp_phosphorus'] = data['temperature'] * data['phosphorus'] / 100
        
        return data
    
    def build_crop_recommender(self, training_data):
        """Build crop recommendation model using Random Forest"""
        print("🌾 Building crop recommendation model...")
        
        # Prepare features
        features = [
            'nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature',
            'soil_type_encoded', 'district_encoded', 'npk_ratio', 'pk_ratio',
            'total_nutrients', 'nutrient_balance', 'rainfall_nitrogen', 'temp_phosphorus'
        ]
        
        X = training_data[features]
        y = training_data['recommended']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        self.crop_recommender = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )
        
        self.crop_recommender.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.crop_recommender.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.crop_recommender, X_train_scaled, y_train, cv=5
        )
        
        print(f"✅ Crop Recommender - Accuracy: {accuracy:.3f}")
        print(f"✅ Cross-validation score: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': features,
            'importance': self.crop_recommender.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("📊 Top 5 Important Features:")
        print(feature_importance.head())
        
        return accuracy
    
    def build_yield_predictor(self, training_data):
        """Build yield prediction model using Neural Network"""
        print("📈 Building yield prediction model...")
        
        # Use same features as crop recommender for consistency
        features = [
            'nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature',
            'soil_type_encoded', 'district_encoded', 'npk_ratio', 'pk_ratio',
            'total_nutrients', 'nutrient_balance', 'rainfall_nitrogen', 'temp_phosphorus'
        ]
        
        X = training_data[features]
        y = training_data['expected_yield']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features (using same scaler)
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Neural Network
        self.yield_predictor = MLPRegressor(
            hidden_layer_sizes=(100, 50, 25),
            activation='relu',
            solver='adam',
            alpha=0.001,
            learning_rate='adaptive',
            max_iter=500,
            random_state=42
        )
        
        self.yield_predictor.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.yield_predictor.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        print(f"✅ Yield Predictor - RMSE: {rmse:.0f} kg/ha")
        print(f"✅ R² Score: {r2:.3f}")
        
        return rmse, r2
    
    def build_soil_classifier(self, training_data):
        """Build soil health classification model using K-Means clustering"""
        print("🌍 Building soil classification model...")
        
        # Features for soil classification
        soil_features = [
            'nitrogen', 'phosphorus', 'potassium', 'total_nutrients',
            'nutrient_balance', 'npk_ratio', 'pk_ratio'
        ]
        
        X_soil = training_data[soil_features]
        X_soil_npk = X_soil[['nitrogen', 'phosphorus', 'potassium']]
        X_soil_scaled = self.soil_scaler.fit_transform(X_soil_npk)
        
        # K-means clustering for soil health categories
        self.soil_classifier = KMeans(n_clusters=5, random_state=42, n_init=10)
        clusters = self.soil_classifier.fit_predict(X_soil_scaled)
        
        # Assign meaningful labels based on cluster centers
        cluster_centers = self.soil_classifier.cluster_centers_
        cluster_labels = []
        
        for center in cluster_centers:
            avg_nutrients = np.mean(center)
            if avg_nutrients < -1:
                cluster_labels.append('Poor')
            elif avg_nutrients < -0.5:
                cluster_labels.append('Below Average')
            elif avg_nutrients < 0.5:
                cluster_labels.append('Average')
            elif avg_nutrients < 1:
                cluster_labels.append('Good')
            else:
                cluster_labels.append('Excellent')
        
        self.soil_health_labels = cluster_labels
        
        print(f"✅ Soil Classifier - Created {len(cluster_labels)} health categories")
        print(f"📊 Categories: {cluster_labels}")
        
        return cluster_labels
    
    def get_crop_recommendations(self, soil_data, location=None):
        """Get crop recommendations for given soil conditions"""
        # Prepare input data
        input_data = {
            'nitrogen': soil_data.get('nitrogen', 150),
            'phosphorus': soil_data.get('phosphorus', 40),
            'potassium': soil_data.get('potassium', 100),
            'rainfall': soil_data.get('rainfall', 700),
            'temperature': soil_data.get('temperature', 25),
            'soil_type': soil_data.get('soil_type', 'loamy'),
            'district': location or 'Amritsar'
        }
        
        # Create DataFrame for processing
        df = pd.DataFrame([input_data])
        df = self.prepare_features(df)
        
        # Make predictions for each crop
        crops = ['rice', 'wheat', 'potato', 'bajra']
        recommendations = []
        
        for crop in crops:
            # Get crop-specific suitability
            suitability_score = self.calculate_crop_suitability(input_data, crop)
            
            # Prepare features for model prediction
            features = [
                'nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature',
                'soil_type_encoded', 'district_encoded', 'npk_ratio', 'pk_ratio',
                'total_nutrients', 'nutrient_balance', 'rainfall_nitrogen', 'temp_phosphorus'
            ]
            
            X = df[features].values
            X_scaled = self.scaler.transform(X)
            
            # Get recommendation probability
            recommendation_prob = self.crop_recommender.predict_proba(X_scaled)[0][1]
            
            # Predict yield (using same features as crop recommender)
            X_yield = df[features].values
            X_yield_scaled = self.scaler.transform(X_yield)
            predicted_yield = self.yield_predictor.predict(X_yield_scaled)[0]
            
            recommendations.append({
                'crop': crop,
                'suitability_score': float(suitability_score),
                'recommendation_confidence': float(recommendation_prob),
                'predicted_yield': float(max(0, predicted_yield)),
                'recommended': suitability_score >= 0.7 and recommendation_prob >= 0.5
            })
        
        # Sort by suitability score
        recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        return recommendations
    
    def calculate_crop_suitability(self, soil_data, crop):
        """Calculate crop suitability based on NPK requirements"""
        crop_requirements = {
            'rice': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
            'wheat': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
            'potato': {'nitrogen': 175, 'phosphorus': 100, 'potassium': 175},
            'bajra': {'nitrogen': 60, 'phosphorus': 30, 'potassium': 30}
        }
        
        requirements = crop_requirements.get(crop, crop_requirements['wheat'])
        
        # Calculate nutrient satisfaction scores
        n_score = min(1.0, soil_data['nitrogen'] / requirements['nitrogen'])
        p_score = min(1.0, soil_data['phosphorus'] / requirements['phosphorus'])
        k_score = min(1.0, soil_data['potassium'] / requirements['potassium'])
        
        return np.mean([n_score, p_score, k_score])
    
    def get_fertilizer_recommendations(self, soil_data, target_crop):
        """Get fertilizer recommendations based on soil deficiencies"""
        crop_requirements = {
            'rice': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
            'wheat': {'nitrogen': 135, 'phosphorus': 70, 'potassium': 50},
            'potato': {'nitrogen': 175, 'phosphorus': 100, 'potassium': 175},
            'bajra': {'nitrogen': 60, 'phosphorus': 30, 'potassium': 30}
        }
        
        requirements = crop_requirements.get(target_crop, crop_requirements['wheat'])
        
        recommendations = []
        
        # Nitrogen deficiency
        n_deficit = max(0, requirements['nitrogen'] - soil_data.get('nitrogen', 0))
        if n_deficit > 0:
            urea_needed = n_deficit / 0.46  # Urea is 46% N
            recommendations.append({
                'nutrient': 'Nitrogen',
                'deficit': float(n_deficit),
                'fertilizer': 'Urea',
                'quantity': float(urea_needed),
                'unit': 'kg/ha'
            })
        
        # Phosphorus deficiency
        p_deficit = max(0, requirements['phosphorus'] - soil_data.get('phosphorus', 0))
        if p_deficit > 0:
            ssp_needed = p_deficit / 0.16  # Single Super Phosphate is 16% P2O5
            recommendations.append({
                'nutrient': 'Phosphorus',
                'deficit': float(p_deficit),
                'fertilizer': 'Single Super Phosphate',
                'quantity': float(ssp_needed),
                'unit': 'kg/ha'
            })
        
        # Potassium deficiency
        k_deficit = max(0, requirements['potassium'] - soil_data.get('potassium', 0))
        if k_deficit > 0:
            mop_needed = k_deficit / 0.6  # Muriate of Potash is 60% K2O
            recommendations.append({
                'nutrient': 'Potassium',
                'deficit': float(k_deficit),
                'fertilizer': 'Muriate of Potash',
                'quantity': float(mop_needed),
                'unit': 'kg/ha'
            })
        
        return recommendations
    
    def analyze_soil_health(self, soil_data):
        """Analyze soil health using clustering model"""
        # Prepare soil data
        input_data = np.array([[
            soil_data.get('nitrogen', 150),
            soil_data.get('phosphorus', 40),
            soil_data.get('potassium', 100)
        ]])
        
        # Scale the data using soil scaler
        input_scaled = self.soil_scaler.transform(input_data)
        
        # Predict cluster
        cluster = self.soil_classifier.predict(input_scaled)[0]
        health_status = self.soil_health_labels[cluster]
        
        # Calculate overall nutrient score
        total_nutrients = sum([
            soil_data.get('nitrogen', 0),
            soil_data.get('phosphorus', 0),
            soil_data.get('potassium', 0)
        ])
        
        return {
            'health_status': health_status,
            'cluster': int(cluster),
            'total_nutrients': float(total_nutrients),
            'recommendations': self.get_health_recommendations(health_status)
        }
    
    def get_health_recommendations(self, health_status):
        """Get recommendations based on soil health status"""
        recommendations = {
            'Poor': [
                "Add organic matter through compost or farmyard manure",
                "Consider soil testing for micronutrient deficiencies",
                "Implement crop rotation with legumes",
                "Use balanced NPK fertilizers"
            ],
            'Below Average': [
                "Increase organic matter content",
                "Apply balanced fertilizers based on soil test",
                "Consider green manuring",
                "Monitor soil pH levels"
            ],
            'Average': [
                "Maintain current soil management practices",
                "Regular soil testing every 2-3 years",
                "Continue organic matter addition",
                "Optimize fertilizer application timing"
            ],
            'Good': [
                "Continue current practices",
                "Focus on sustainable farming methods",
                "Consider precision agriculture techniques",
                "Monitor for any nutrient imbalances"
            ],
            'Excellent': [
                "Maintain excellent soil health",
                "Share best practices with other farmers",
                "Consider reducing fertilizer inputs",
                "Focus on soil conservation"
            ]
        }
        
        return recommendations.get(health_status, recommendations['Average'])
    
    def save_models(self, model_dir="./"):
        """Save trained models"""
        print("💾 Saving models...")
        
        joblib.dump(self.crop_recommender, f"{model_dir}/crop_recommender.pkl")
        joblib.dump(self.yield_predictor, f"{model_dir}/yield_predictor.pkl")
        joblib.dump(self.soil_classifier, f"{model_dir}/soil_classifier.pkl")
        joblib.dump(self.scaler, f"{model_dir}/scaler.pkl")
        joblib.dump(self.soil_scaler, f"{model_dir}/soil_scaler.pkl")
        joblib.dump(self.label_encoders, f"{model_dir}/label_encoders.pkl")
        joblib.dump(self.soil_health_labels, f"{model_dir}/soil_health_labels.pkl")
        
        print("✅ All models saved successfully!")
    
    def load_models(self, model_dir="./"):
        """Load trained models"""
        print("📂 Loading models...")
        
        self.crop_recommender = joblib.load(f"{model_dir}/crop_recommender.pkl")
        self.yield_predictor = joblib.load(f"{model_dir}/yield_predictor.pkl")
        self.soil_classifier = joblib.load(f"{model_dir}/soil_classifier.pkl")
        self.scaler = joblib.load(f"{model_dir}/scaler.pkl")
        self.soil_scaler = joblib.load(f"{model_dir}/soil_scaler.pkl")
        self.label_encoders = joblib.load(f"{model_dir}/label_encoders.pkl")
        self.soil_health_labels = joblib.load(f"{model_dir}/soil_health_labels.pkl")
        
        print("✅ All models loaded successfully!")

if __name__ == "__main__":
    # This will be run by model_training.py
    pass