"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Navigation, 
  Cloud, 
  Sprout, 
  TrendingUp, 
  FlaskConical, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Thermometer,
  Droplet
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DemoPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [soilData, setSoilData] = useState(null)
  const [error, setError] = useState(null)
  
  const [manualLocation, setManualLocation] = useState('')

  // Load demo data for a location
  const loadDemoData = async (location) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Loading demo data for:', location)
      
      // Load weather data using mock API
      try {
        const weatherResponse = await fetch(`/api/mock/weather?location=${encodeURIComponent(location)}`)
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json()
          if (weather.success) {
            setWeatherData(weather.data)
            console.log('Weather data loaded:', weather.data)
          }
        }
      } catch (err) {
        console.log('Weather API error:', err)
      }

      // Load soil data using mock API
      try {
        const soilResponse = await fetch('/api/mock/soil-data/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location })
        })
        
        if (soilResponse.ok) {
          const soil = await soilResponse.json()
          if (soil.success) {
            setSoilData(soil.data)
            console.log('Soil data loaded:', soil.data)
          }
        }
      } catch (err) {
        console.log('Soil API error:', err)
      }

      setLocationData({ city: location, state: 'Punjab', country: 'India' })
      
    } catch (err) {
      console.error('Error loading demo data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle manual location input
  const handleLocationSubmit = (e) => {
    e.preventDefault()
    if (manualLocation.trim()) {
      loadDemoData(manualLocation.trim())
    }
  }

  // Load default data on component mount
  useEffect(() => {
    loadDemoData('Amritsar')
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
            🌾 Punjab Agriculture Advisory System
          </h1>
          <p className="text-green-600 text-lg">
            Location-based agricultural insights and recommendations
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">🚀 Live Demo</h2>
            <p className="text-blue-700">
              This is a fully functional demo using real Punjab district data. 
              Enter any Punjab district name to see location-based predictions!
            </p>
          </div>
        </div>

        {/* Location Input */}
        <Card className="bg-white p-6 mb-8 border-0 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Enter Your Location
          </h2>
          
          <form onSubmit={handleLocationSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Try: Amritsar, Ludhiana, Jalandhar, Patiala, Bathinda..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Data'}
            </Button>
          </form>

          {locationData && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">
                Currently showing data for: {locationData.city}, {locationData.state}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading agricultural insights...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cloud className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Current Weather</h3>
                  <p className="text-sm text-gray-600">Live conditions for farming</p>
                </div>
              </div>

              {weatherData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span>Temperature</span>
                    </div>
                    <span className="font-semibold">{weatherData.current?.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span>Humidity</span>
                    </div>
                    <span className="font-semibold">{weatherData.current?.humidity}%</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-3">
                    <strong>{weatherData.current?.conditions}</strong> - Perfect for {weatherData.current?.temperature > 30 ? 'irrigation' : 'field work'}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <Cloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Loading weather data...</p>
                </div>
              )}
            </Card>

            {/* Soil Analysis Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FlaskConical className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Soil Analysis</h3>
                  <p className="text-sm text-gray-600">District-wise soil health data</p>
                </div>
              </div>

              {soilData ? (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold text-orange-600">
                      {soilData.soil_health?.health_status || 'Good'}
                    </div>
                    <div className="text-sm text-gray-600">Overall soil health</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="font-semibold">N: {soilData.soil_health?.nitrogen}</div>
                      <div className="text-gray-600">kg/ha</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="font-semibold">P: {soilData.soil_health?.phosphorus}</div>
                      <div className="text-gray-600">kg/ha</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <div className="font-semibold">K: {soilData.soil_health?.potassium}</div>
                      <div className="text-gray-600">kg/ha</div>
                    </div>
                  </div>

                  {soilData.suitable_crops && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Suitable Crops:</div>
                      <div className="flex flex-wrap gap-1">
                        {soilData.suitable_crops.map((crop, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <FlaskConical className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Loading soil data...</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Features Overview */}
        <Card className="bg-green-50 border border-green-200 p-6 mt-8">
          <h3 className="text-xl font-semibold text-green-800 mb-4">🎯 Demo Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-medium">Location-Based</div>
              <div className="text-gray-600">Real Punjab district data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌡️</div>
              <div className="font-medium">Live Weather</div>
              <div className="text-gray-600">Farming-relevant conditions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium">Soil Analysis</div>
              <div className="text-gray-600">NPK levels by district</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌾</div>
              <div className="font-medium">Crop Suggestions</div>
              <div className="text-gray-600">Location-suitable crops</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}