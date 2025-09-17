"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft, BarChart3, Loader2, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function YieldPredictionPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    crop_type: 'wheat',
    area: '',
    location: '',
    soil_data: {
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ph: '',
      organic_carbon: ''
    },
    weather_data: {
      temperature: '',
      humidity: '',
      rainfall: ''
    }
  })

  const crops = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'potato', label: 'Potato' },
    { value: 'bajra', label: 'Bajra (Pearl Millet)' },
    { value: 'maize', label: 'Maize (Corn)' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'cotton', label: 'Cotton' }
  ]

  const handleInputChange = (section, field, value) => {
    if (section === 'main') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        crop_type: formData.crop_type,
        area: parseFloat(formData.area) || 1,
        location: formData.location || 'Punjab',
        soil_data: {
          nitrogen: parseFloat(formData.soil_data.nitrogen) || 150,
          phosphorus: parseFloat(formData.soil_data.phosphorus) || 40,
          potassium: parseFloat(formData.soil_data.potassium) || 100,
          ph: parseFloat(formData.soil_data.ph) || 7.0,
          organic_carbon: parseFloat(formData.soil_data.organic_carbon) || 0.8
        },
        weather_data: {
          temperature: parseFloat(formData.weather_data.temperature) || 25,
          humidity: parseFloat(formData.weather_data.humidity) || 60,
          rainfall: parseFloat(formData.weather_data.rainfall) || 700
        }
      }

      const response = await fetch(`${API_BASE_URL}/crops/predict-yield`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPrediction(data.data)
      } else {
        throw new Error(data.message || 'Failed to get yield prediction')
      }
    } catch (err) {
      console.error('Error fetching yield prediction:', err)
      setError(err.message || 'Failed to get yield prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/home')} 
            className="p-2 hover:bg-green-100"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <div className="ml-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800">
              {t("yieldPrediction")}
            </h1>
            <p className="text-sm text-green-600">ML-based crop yield forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-white p-6 border-0 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crop and Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Crop
                  </label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => handleInputChange('main', 'crop_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {crops.map(crop => (
                      <option key={crop.value} value={crop.value}>{crop.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Area (hectares)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.area}
                      onChange={(e) => handleInputChange('main', 'area', e.target.value)}
                      placeholder="1.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('main', 'location', e.target.value)}
                      placeholder="e.g., Ludhiana"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Soil Data */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Soil Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nitrogen (kg/ha)
                    </label>
                    <input
                      type="number"
                      value={formData.soil_data.nitrogen}
                      onChange={(e) => handleInputChange('soil_data', 'nitrogen', e.target.value)}
                      placeholder="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phosphorus (kg/ha)
                    </label>
                    <input
                      type="number"
                      value={formData.soil_data.phosphorus}
                      onChange={(e) => handleInputChange('soil_data', 'phosphorus', e.target.value)}
                      placeholder="40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potassium (kg/ha)
                    </label>
                    <input
                      type="number"
                      value={formData.soil_data.potassium}
                      onChange={(e) => handleInputChange('soil_data', 'potassium', e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      pH Level
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.soil_data.ph}
                      onChange={(e) => handleInputChange('soil_data', 'ph', e.target.value)}
                      placeholder="7.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Weather Data */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Weather Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={formData.weather_data.temperature}
                      onChange={(e) => handleInputChange('weather_data', 'temperature', e.target.value)}
                      placeholder="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      value={formData.weather_data.humidity}
                      onChange={(e) => handleInputChange('weather_data', 'humidity', e.target.value)}
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rainfall (mm/year)
                    </label>
                    <input
                      type="number"
                      value={formData.weather_data.rainfall}
                      onChange={(e) => handleInputChange('weather_data', 'rainfall', e.target.value)}
                      placeholder="700"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Predicting Yield...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Predict Yield
                  </div>
                )}
              </Button>
            </form>
          </Card>

          {/* Results */}
          <Card className="bg-white p-6 border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield Prediction</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Calculating yield prediction...</span>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                {/* Main Prediction */}
                <Card className="border border-purple-200 bg-purple-50 p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <TrendingUp className="w-12 h-12 text-purple-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-purple-800 mb-2">
                      {Math.round(prediction.prediction?.predicted_yield || prediction.prediction?.yield_per_hectare || 0)} kg/ha
                    </h4>
                    <p className="text-purple-700 mb-4">Predicted yield for {prediction.prediction?.crop_type || formData.crop_type}</p>
                    
                    {prediction.prediction?.area && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-purple-600">Farm Area:</span>
                          <div className="font-semibold">{prediction.prediction.area} ha</div>
                        </div>
                        <div>
                          <span className="text-purple-600">Total Production:</span>
                          <div className="font-semibold">
                            {Math.round(prediction.prediction.total_production || 0)} kg
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Confidence and Factors */}
                {(prediction.prediction?.confidence || prediction.factors) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prediction.prediction?.confidence && (
                      <Card className="border border-gray-200 p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Prediction Confidence</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${prediction.prediction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{prediction.prediction.confidence}%</span>
                        </div>
                      </Card>
                    )}

                    {prediction.prediction?.suitability_score && (
                      <Card className="border border-gray-200 p-4">
                        <h5 className="font-semibold text-gray-800 mb-2">Suitability Score</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(prediction.prediction.suitability_score * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{Math.round(prediction.prediction.suitability_score * 100)}%</span>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Impact Factors */}
                {prediction.factors && (
                  <Card className="border border-gray-200 p-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Yield Impact Factors</h5>
                    <div className="space-y-3">
                      {prediction.factors.soil_impact && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Soil Impact:</span>
                          <span className="font-semibold">{prediction.factors.soil_impact}%</span>
                        </div>
                      )}
                      {prediction.factors.weather_impact && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Weather Impact:</span>
                          <span className="font-semibold">{prediction.factors.weather_impact}%</span>
                        </div>
                      )}
                      {prediction.factors.management_impact && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Management Impact:</span>
                          <span className="font-semibold">{prediction.factors.management_impact}%</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <Card className="border border-green-200 bg-green-50 p-4">
                    <h5 className="font-semibold text-green-800 mb-3">Recommendations</h5>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {prediction.mock && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <p className="text-sm">
                      <strong>Note:</strong> This is an intelligent mock prediction. 
                      ML service is currently using fallback calculations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!prediction && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Enter crop and conditions data to get yield predictions</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}