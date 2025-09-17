import pandas as pd
import numpy as np
import re
import json
from pathlib import Path

class PunjabDataPreprocessor:
    def __init__(self, data_dir="../"):
        self.data_dir = Path(data_dir)
        self.npk_file = self.data_dir / "Punjab NPK.csv"
        self.yield_file = self.data_dir / "Punjab_Data.csv"
        self.bajra_wheat_file = self.data_dir / "bajra-wheat.csv"
        
    def clean_npk_data(self):
        """Clean and normalize NPK data from Punjab NPK.csv"""
        print("🧹 Cleaning NPK data...")
        
        npk_data = pd.read_csv(self.npk_file)
        cleaned_data = []
        
        for _, row in npk_data.iterrows():
            region = row['Region/District']
            n_value = row['N (kg/ha)']
            p_value = row['P (kg/ha)']
            k_value = row['K (kg/ha)']
            
            # Extract district name if available
            district = self.extract_district_name(region)
            
            # Parse N, P, K values (handle ranges and special cases)
            n_parsed = self.parse_npk_value(n_value)
            p_parsed = self.parse_npk_value(p_value)
            k_parsed = self.parse_npk_value(k_value)
            
            if n_parsed is not None and p_parsed is not None and k_parsed is not None:
                cleaned_data.append({
                    'region': region,
                    'district': district,
                    'nitrogen': n_parsed,
                    'phosphorus': p_parsed,
                    'potassium': k_parsed,
                    'soil_type': self.classify_soil_type(region)
                })
        
        return pd.DataFrame(cleaned_data)
    
    def parse_npk_value(self, value):
        """Parse NPK values that might be ranges, averages, or special formats"""
        if pd.isna(value) or value == 'NA' or value == '(NA)':
            return None
            
        value_str = str(value).strip()
        
        # Handle ranges like "50.2 - 225.8"
        range_match = re.search(r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)', value_str)
        if range_match:
            min_val = float(range_match.group(1))
            max_val = float(range_match.group(2))
            return (min_val + max_val) / 2  # Return average
        
        # Handle averages like "145.5 (avg)"
        avg_match = re.search(r'(\d+\.?\d*)\s*\(avg\)', value_str)
        if avg_match:
            return float(avg_match.group(1))
        
        # Handle mean values like "mean 219.48"
        mean_match = re.search(r'mean\s+(\d+\.?\d*)', value_str)
        if mean_match:
            return float(mean_match.group(1))
        
        # Handle comparison operators like "<280", ">250"
        comparison_match = re.search(r'[<>](\d+\.?\d*)', value_str)
        if comparison_match:
            return float(comparison_match.group(1))
        
        # Handle simple numbers
        number_match = re.search(r'^(\d+\.?\d*)$', value_str)
        if number_match:
            return float(number_match.group(1))
        
        # Handle reported values like "404 (reported)"
        reported_match = re.search(r'(\d+\.?\d*)\s*\(reported\)', value_str)
        if reported_match:
            return float(reported_match.group(1))
        
        return None
    
    def extract_district_name(self, region):
        """Extract district name from region description"""
        district_names = [
            'Amritsar', 'Bathinda', 'Ludhiana', 'Gurdaspur', 'Moga', 'Jalandhar',
            'Ferozepur', 'Mansa', 'Muktsar', 'Sangrur', 'Hoshiarpur', 'Rupnagar',
            'Kapurthala', 'Patiala', 'Fatehgarh Sahib', 'Mohali', 'Barnala',
            'Faridkot', 'Taran - Taran'
        ]
        
        for district in district_names:
            if district.lower() in region.lower():
                return district
        
        return None
    
    def classify_soil_type(self, region):
        """Classify soil type based on region description"""
        region_lower = region.lower()
        
        if 'alluvial' in region_lower:
            return 'alluvial'
        elif 'sandy' in region_lower or 'sand' in region_lower:
            return 'sandy'
        elif 'loam' in region_lower:
            return 'loamy'
        elif 'saline' in region_lower:
            return 'saline'
        elif 'forest' in region_lower or 'afforested' in region_lower:
            return 'forest'
        elif 'hill' in region_lower or 'shivalik' in region_lower:
            return 'hilly'
        else:
            return 'mixed'
    
    def clean_yield_data(self):
        """Clean and process yield data from Punjab_Data.csv"""
        print("🌾 Processing yield data...")
        
        yield_data = pd.read_csv(self.yield_file)
        
        # Focus on rice data and relevant columns
        processed_data = []
        
        for _, row in yield_data.iterrows():
            processed_data.append({
                'district': row['District'],
                'year': row['Year'],
                'crop': row['Crops'].lower(),
                'area': row['RICE.AREA..1000.ha.'],
                'production': row['RICE.PRODUCTION..1000.tons.'],
                'yield': row['RICE.YIELD..Kg.per.ha.'],
                'rainfall': row['IMD_RF'],
                'temperature': row['IMD_Tmax']
            })
        
        return pd.DataFrame(processed_data)
    
    def clean_bajra_wheat_data(self):
        """Clean and process bajra-wheat data"""
        print("🌱 Processing bajra-wheat data...")
        
        # Read the data
        data = pd.read_csv(self.bajra_wheat_file)
        
        processed_data = []
        
        for _, row in data.iterrows():
            crop = row['Crop'].lower()
            district = row['District/Year']
            
            # Process each year's data
            for year_col in data.columns[2:]:  # Skip Crop and District/Year columns
                try:
                    year = int(year_col)
                    value = row[year_col]
                    
                    if pd.notna(value) and value != '':
                        processed_data.append({
                            'crop': crop,
                            'district': district,
                            'year': year,
                            'area': float(value) if crop != 'potato' else float(value),
                            'production': None,  # Will be estimated
                            'yield': None  # Will be estimated
                        })
                        
                except (ValueError, TypeError):
                    continue
        
        return pd.DataFrame(processed_data)
    
    def create_crop_suitability_db(self):
        """Create crop suitability database based on agricultural research"""
        print("📚 Creating crop suitability database...")
        
        crop_requirements = {
            'rice': {
                'nitrogen': {'min': 120, 'max': 150, 'optimal': 135},
                'phosphorus': {'min': 60, 'max': 80, 'optimal': 70},
                'potassium': {'min': 40, 'max': 60, 'optimal': 50},
                'ph': {'min': 5.5, 'max': 6.5, 'optimal': 6.0},
                'climate': 'humid_subtropical',
                'water_requirement': 'high',
                'soil_types': ['alluvial', 'loamy', 'clay']
            },
            'wheat': {
                'nitrogen': {'min': 120, 'max': 150, 'optimal': 135},
                'phosphorus': {'min': 60, 'max': 80, 'optimal': 70},
                'potassium': {'min': 40, 'max': 60, 'optimal': 50},
                'ph': {'min': 6.0, 'max': 7.5, 'optimal': 6.8},
                'climate': 'temperate',
                'water_requirement': 'medium',
                'soil_types': ['alluvial', 'loamy', 'mixed']
            },
            'potato': {
                'nitrogen': {'min': 150, 'max': 200, 'optimal': 175},
                'phosphorus': {'min': 80, 'max': 120, 'optimal': 100},
                'potassium': {'min': 150, 'max': 200, 'optimal': 175},
                'ph': {'min': 5.5, 'max': 6.5, 'optimal': 6.0},
                'climate': 'cool_humid',
                'water_requirement': 'high',
                'soil_types': ['loamy', 'sandy', 'alluvial']
            },
            'bajra': {
                'nitrogen': {'min': 40, 'max': 80, 'optimal': 60},
                'phosphorus': {'min': 20, 'max': 40, 'optimal': 30},
                'potassium': {'min': 20, 'max': 40, 'optimal': 30},
                'ph': {'min': 6.5, 'max': 8.0, 'optimal': 7.2},
                'climate': 'arid_semi_arid',
                'water_requirement': 'low',
                'soil_types': ['sandy', 'loamy', 'mixed']
            }
        }
        
        return crop_requirements
    
    def create_training_dataset(self):
        """Combine all data sources to create ML training dataset"""
        print("🔗 Creating training dataset...")
        
        npk_data = self.clean_npk_data()
        yield_data = self.clean_yield_data()
        bajra_wheat_data = self.clean_bajra_wheat_data()
        crop_requirements = self.create_crop_suitability_db()
        
        training_data = []
        
        # Create training examples by combining NPK data with yield data
        for _, npk_row in npk_data.iterrows():
            if npk_row['district'] is not None:
                district = npk_row['district']
                
                # Find yield data for this district
                district_yield = yield_data[yield_data['district'] == district]
                
                if not district_yield.empty:
                    avg_yield = district_yield['yield'].mean()
                    avg_rainfall = district_yield['rainfall'].mean()
                    avg_temperature = district_yield['temperature'].mean()
                    
                    # Calculate suitability scores for each crop
                    for crop, requirements in crop_requirements.items():
                        suitability_score = self.calculate_suitability_score(
                            npk_row, requirements
                        )
                        
                        training_data.append({
                            'district': district,
                            'nitrogen': npk_row['nitrogen'],
                            'phosphorus': npk_row['phosphorus'],
                            'potassium': npk_row['potassium'],
                            'soil_type': npk_row['soil_type'],
                            'rainfall': avg_rainfall if not pd.isna(avg_rainfall) else 700,
                            'temperature': avg_temperature if not pd.isna(avg_temperature) else 25,
                            'crop': crop,
                            'suitability_score': suitability_score,
                            'recommended': 1 if suitability_score >= 0.7 else 0,
                            'expected_yield': avg_yield if not pd.isna(avg_yield) else self.estimate_yield(crop, suitability_score)
                        })
        
        training_df = pd.DataFrame(training_data)
        
        # Save processed datasets
        training_df.to_csv('training_data.csv', index=False)
        npk_data.to_csv('processed_npk_data.csv', index=False)
        yield_data.to_csv('processed_yield_data.csv', index=False)
        
        print(f"✅ Created training dataset with {len(training_df)} samples")
        return training_df
    
    def calculate_suitability_score(self, soil_data, crop_requirements):
        """Calculate crop suitability score based on NPK levels"""
        scores = []
        
        # Nitrogen suitability
        n_score = self.calculate_nutrient_score(
            soil_data['nitrogen'], 
            crop_requirements['nitrogen']
        )
        scores.append(n_score)
        
        # Phosphorus suitability
        p_score = self.calculate_nutrient_score(
            soil_data['phosphorus'], 
            crop_requirements['phosphorus']
        )
        scores.append(p_score)
        
        # Potassium suitability
        k_score = self.calculate_nutrient_score(
            soil_data['potassium'], 
            crop_requirements['potassium']
        )
        scores.append(k_score)
        
        # Soil type compatibility
        if soil_data['soil_type'] in crop_requirements['soil_types']:
            scores.append(1.0)
        else:
            scores.append(0.5)
        
        return np.mean(scores)
    
    def calculate_nutrient_score(self, soil_level, requirement):
        """Calculate nutrient suitability score"""
        optimal = requirement['optimal']
        min_val = requirement['min']
        max_val = requirement['max']
        
        if min_val <= soil_level <= max_val:
            # Within optimal range
            distance_from_optimal = abs(soil_level - optimal) / (max_val - min_val)
            return 1.0 - (distance_from_optimal * 0.3)
        elif soil_level < min_val:
            # Deficient
            deficit_ratio = (min_val - soil_level) / min_val
            return max(0.0, 1.0 - deficit_ratio)
        else:
            # Excessive
            excess_ratio = (soil_level - max_val) / max_val
            return max(0.0, 1.0 - (excess_ratio * 0.5))
    
    def estimate_yield(self, crop, suitability_score):
        """Estimate yield based on crop type and suitability score"""
        base_yields = {
            'rice': 4000,
            'wheat': 4500,
            'potato': 25000,
            'bajra': 2000
        }
        
        base_yield = base_yields.get(crop, 3000)
        return base_yield * suitability_score

if __name__ == "__main__":
    preprocessor = PunjabDataPreprocessor()
    training_data = preprocessor.create_training_dataset()
    print("🎉 Data preprocessing completed!")
    print(f"Training data shape: {training_data.shape}")
    print("\nSample data:")
    print(training_data.head())