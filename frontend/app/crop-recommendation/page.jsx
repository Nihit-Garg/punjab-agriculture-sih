"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft, Sprout, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function CropRecommendationPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [error, setError] = useState(null)
  
  const [soilData, setSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    organic_carbon: ''
  })
  
  const [weatherData, setWeatherData] = useState({
    temperature: '',
    humidity: '',
    rainfall: ''
  })
  
  const [location, setLocation] = useState('')

  const handleInputChange = (section, field, value) => {
    if (section === 'soil') {
      setSoilData(prev => ({
        ...prev,
        [field]: value
      }))
    } else if (section === 'weather') {
      setWeatherData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/crops/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          soil_data: {
            nitrogen: parseFloat(soilData.nitrogen) || 150,
            phosphorus: parseFloat(soilData.phosphorus) || 40,
            potassium: parseFloat(soilData.potassium) || 100,
            ph: parseFloat(soilData.ph) || 7.0,
            organic_carbon: parseFloat(soilData.organic_carbon) || 0.8
          },
          weather_data: {
            temperature: parseFloat(weatherData.temperature) || 25,
            humidity: parseFloat(weatherData.humidity) || 60,
            rainfall: parseFloat(weatherData.rainfall) || 700
          },
          location: location || 'Punjab'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.data)
      } else {
        throw new Error(data.message || 'Failed to get recommendations')
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err.message || 'Failed to get crop recommendations')
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
              {t("cropRecommendation")}
            </h1>
            <p className="text-sm text-green-600">AI-powered crop suggestions for your farm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-white p-6 border-0 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (District/City)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Ludhiana, Amritsar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                      value={soilData.nitrogen}
                      onChange={(e) => handleInputChange('soil', 'nitrogen', e.target.value)}
                      placeholder="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phosphorus (kg/ha)
                    </label>
                    <input
                      type="number"
                      value={soilData.phosphorus}
                      onChange={(e) => handleInputChange('soil', 'phosphorus', e.target.value)}
                      placeholder="40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potassium (kg/ha)
                    </label>
                    <input
                      type="number"
                      value={soilData.potassium}
                      onChange={(e) => handleInputChange('soil', 'potassium', e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      pH Level
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilData.ph}
                      onChange={(e) => handleInputChange('soil', 'ph', e.target.value)}
                      placeholder="7.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      value={weatherData.temperature}
                      onChange={(e) => handleInputChange('weather', 'temperature', e.target.value)}
                      placeholder="25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      value={weatherData.humidity}
                      onChange={(e) => handleInputChange('weather', 'humidity', e.target.value)}
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      value={weatherData.rainfall}
                      onChange={(e) => handleInputChange('weather', 'rainfall', e.target.value)}
                      placeholder="700"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting Recommendations...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4" />
                    Get Crop Recommendations
                  </div>
                )}
              </Button>
            </form>
          </Card>

          {/* Results */}
          <Card className="bg-white p-6 border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Analyzing your conditions...</span>
              </div>
            )}

            {recommendations && (
              <div className="space-y-4">
                {recommendations.recommendations?.map((crop, index) => (
                  <Card key={index} className="border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-800 capitalize">{crop.crop}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(crop.confidence)}% confidence
                        </span>
                      </div>
                    </div>
                    {crop.reasons && (
                      <ul className="text-sm text-gray-600 space-y-1">
                        {crop.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}

                {recommendations.analysis && (
                  <Card className="border border-blue-200 bg-blue-50 p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Analysis Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Soil Suitability:</span>
                        <div className="font-semibold">{recommendations.analysis.soil_suitability}%</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Weather Suitability:</span>
                        <div className="font-semibold">{recommendations.analysis.weather_suitability}%</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Overall Score:</span>
                        <div className="font-semibold">{recommendations.analysis.overall_score}%</div>
                      </div>
                    </div>
                  </Card>
                )}

                {recommendations.mock && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <p className="text-sm">
                      <strong>Note:</strong> These are intelligent mock recommendations. 
                      ML service is currently using fallback predictions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!recommendations && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Enter your soil and weather data to get personalized crop recommendations</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}