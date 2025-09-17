"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft, FlaskConical, Loader2, Leaf, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function SoilAnalysisPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [soilHealth, setSoilHealth] = useState(null)
  const [fertilizerRecs, setFertilizerRecs] = useState(null)
  const [error, setError] = useState(null)
  
  const [soilData, setSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    soil_type: 'loamy'
  })
  
  const [targetCrop, setTargetCrop] = useState('wheat')

  const soilTypes = [
    { value: 'loamy', label: 'Loamy Soil' },
    { value: 'clayey', label: 'Clayey Soil' },
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'black', label: 'Black Soil' },
    { value: 'red', label: 'Red Soil' },
    { value: 'alluvial', label: 'Alluvial Soil' }
  ]

  const crops = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'potato', label: 'Potato' },
    { value: 'bajra', label: 'Bajra' },
    { value: 'maize', label: 'Maize' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'cotton', label: 'Cotton' }
  ]

  const handleInputChange = (field, value) => {
    setSoilData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const analyzeSoil = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        soil_data: {
          nitrogen: parseFloat(soilData.nitrogen) || 150,
          phosphorus: parseFloat(soilData.phosphorus) || 40,
          potassium: parseFloat(soilData.potassium) || 100,
          ph: parseFloat(soilData.ph) || 7.0,
          soil_type: soilData.soil_type
        }
      }

      // First, get soil health analysis
      const soilResponse = await fetch(`${API_BASE_URL}/soil-data/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!soilResponse.ok) {
        throw new Error(`HTTP error! status: ${soilResponse.status}`)
      }

      const soilData = await soilResponse.json()
      
      if (soilData.success) {
        setSoilHealth(soilData.data || soilData.soil_health)
      }

      // Then get fertilizer recommendations for the target crop
      const fertilizerPayload = {
        crop_type: targetCrop,
        soil_data: payload.soil_data
      }

      const fertilizerResponse = await fetch(`${API_BASE_URL}/crops/fertilizer-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(fertilizerPayload)
      })

      if (fertilizerResponse.ok) {
        const fertilizerData = await fertilizerResponse.json()
        if (fertilizerData.success) {
          setFertilizerRecs(fertilizerData.data || fertilizerData.fertilizer_recommendations)
        }
      }

    } catch (err) {
      console.error('Error analyzing soil:', err)
      setError(err.message || 'Failed to analyze soil')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    analyzeSoil()
  }

  const getNutrientStatus = (value, nutrient) => {
    const thresholds = {
      nitrogen: { low: 120, optimal: 180 },
      phosphorus: { low: 30, optimal: 60 },
      potassium: { low: 80, optimal: 120 }
    }
    
    const threshold = thresholds[nutrient]
    if (!threshold) return { status: 'unknown', color: 'gray' }
    
    if (value < threshold.low) return { status: 'low', color: 'red' }
    if (value > threshold.optimal) return { status: 'high', color: 'blue' }
    return { status: 'optimal', color: 'green' }
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
              {t("soilAnalysis")}
            </h1>
            <p className="text-sm text-green-600">NPK testing and fertilizer recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-white p-6 border-0 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NPK Values */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Soil Nutrient Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nitrogen (N) - kg/ha
                    </label>
                    <input
                      type="number"
                      value={soilData.nitrogen}
                      onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                      placeholder="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phosphorus (P) - kg/ha
                    </label>
                    <input
                      type="number"
                      value={soilData.phosphorus}
                      onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                      placeholder="40"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potassium (K) - kg/ha
                    </label>
                    <input
                      type="number"
                      value={soilData.potassium}
                      onChange={(e) => handleInputChange('potassium', e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* pH and Soil Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    pH Level
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilData.ph}
                    onChange={(e) => handleInputChange('ph', e.target.value)}
                    placeholder="7.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <select
                    value={soilData.soil_type}
                    onChange={(e) => handleInputChange('soil_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {soilTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Crop for Fertilizer Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Crop (for fertilizer recommendations)
                </label>
                <select
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {crops.map(crop => (
                    <option key={crop.value} value={crop.value}>{crop.label}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Soil...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Analyze Soil
                  </div>
                )}
              </Button>
            </form>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Soil Health Results */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Soil Health Analysis</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Analysis Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                  <span className="ml-2 text-gray-600">Analyzing soil composition...</span>
                </div>
              )}

              {soilHealth && (
                <div className="space-y-4">
                  {/* Overall Health Status */}
                  <Card className="border border-gray-200 bg-gray-50 p-4">
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        Soil Health: {soilHealth.health_status || soilHealth.soil_health?.health_status || 'Good'}
                      </h4>
                      <p className="text-gray-600">
                        Total Nutrients: {Math.round(soilHealth.total_nutrients || soilHealth.soil_health?.total_nutrients || 0)} kg/ha
                      </p>
                    </div>
                  </Card>

                  {/* NPK Status Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {['nitrogen', 'phosphorus', 'potassium'].map(nutrient => {
                      const value = parseFloat(soilData[nutrient]) || 0
                      const status = getNutrientStatus(value, nutrient)
                      
                      return (
                        <Card key={nutrient} className={`border border-${status.color}-200 bg-${status.color}-50 p-3`}>
                          <div className="text-center">
                            <h5 className="text-sm font-semibold capitalize text-gray-800">{nutrient}</h5>
                            <div className="text-lg font-bold text-gray-800">{value}</div>
                            <div className={`text-xs font-medium text-${status.color}-600 capitalize`}>
                              {status.status}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Health Recommendations */}
                  {(soilHealth.recommendations || soilHealth.soil_health?.recommendations) && (
                    <Card className="border border-green-200 bg-green-50 p-4">
                      <h5 className="font-semibold text-green-800 mb-3">Soil Health Recommendations</h5>
                      <ul className="space-y-2">
                        {(soilHealth.recommendations || soilHealth.soil_health?.recommendations || []).map((rec, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {!soilHealth && !loading && !error && (
                <div className="text-center py-8 text-gray-500">
                  <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Enter your soil NPK values to get detailed health analysis</p>
                </div>
              )}
            </Card>

            {/* Fertilizer Recommendations */}
            {fertilizerRecs && (
              <Card className="bg-white p-6 border-0 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Fertilizer Recommendations for {targetCrop}
                </h3>
                
                {fertilizerRecs.length > 0 ? (
                  <div className="space-y-4">
                    {fertilizerRecs.map((rec, index) => (
                      <Card key={index} className="border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <Leaf className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-blue-800">{rec.nutrient} Deficiency</h5>
                            <p className="text-sm text-blue-700 mb-2">
                              Deficit: {Math.round(rec.deficit)} kg/ha
                            </p>
                            <div className="bg-white rounded p-3">
                              <p className="font-medium text-gray-800">Apply: {rec.fertilizer}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: <strong>{Math.round(rec.quantity)} {rec.unit}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="text-sm">
                        <strong>Great news!</strong> Your soil nutrient levels are adequate for {targetCrop}. 
                        No additional fertilizers needed at this time.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Soil Testing Tips */}
        <Card className="bg-blue-50 border border-blue-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Soil Testing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">When to Test:</h4>
              <ul className="space-y-1">
                <li>• Before each growing season</li>
                <li>• After harvest to plan for next crop</li>
                <li>• When crop yields are declining</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sampling Tips:</h4>
              <ul className="space-y-1">
                <li>• Take samples from multiple locations</li>
                <li>• Avoid areas near roads or structures</li>
                <li>• Sample at consistent depth (6-8 inches)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}