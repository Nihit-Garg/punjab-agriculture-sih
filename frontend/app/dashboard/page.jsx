"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function LocationDashboard() {
  const { t } = useLanguage()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [cropData, setCropData] = useState(null)
  const [soilData, setSoilData] = useState(null)
  const [yieldData, setYieldData] = useState(null)
  const [error, setError] = useState(null)
  
  const [userLocation, setUserLocation] = useState(null)
  const [manualLocation, setManualLocation] = useState('')

  // Get user's current location
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // Reverse geocoding to get location details
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=52812f82fa9fd96feae7f11aabeedbc6`
            )
            const data = await response.json()
            
            if (data && data.length > 0) {
              const location = {
                latitude,
                longitude,
                city: data[0].name,
                state: data[0].state,
                country: data[0].country
              }
              resolve(location)
            } else {
              resolve({ latitude, longitude, city: 'Unknown', state: 'Unknown', country: 'Unknown' })
            }
          } catch (err) {
            resolve({ latitude, longitude, city: 'Unknown', state: 'Unknown', country: 'Unknown' })
          }
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Load all agricultural predictions for the location
  const loadLocationPredictions = async (location) => {
    try {
      setLoading(true)
      setError(null)
      
      // Reset data
      setWeatherData(null)
      setCropData(null)
      setSoilData(null)
      setYieldData(null)

      // Determine the best matching district/location for Punjab data
      const locationQuery = location.state?.toLowerCase().includes('punjab') ? 
        location.city : location.state || location.city

      console.log('Loading predictions for location:', locationQuery);
      
      let currentWeatherData = null;
      
      // Step 1: Load weather data first
      try {
        console.log('Fetching weather data...');
        const weatherResponse = await fetch(
          `${API_BASE_URL}/weather?location=${encodeURIComponent(locationQuery)}`,
          { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )
        
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json()
          if (weather.success) {
            currentWeatherData = weather.data
            setWeatherData(weather.data)
            console.log('Weather data loaded successfully');
          }
        } else {
          console.warn('Weather API failed:', weatherResponse.status);
        }
      } catch (weatherError) {
        console.warn('Weather fetch error:', weatherError.message);
      }

      // Step 2: Load soil data (this uses CSV data)
      try {
        console.log('Fetching soil data...');
        const soilResponse = await fetch(`${API_BASE_URL}/soil-data/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: locationQuery
          })
        })

        if (soilResponse.ok) {
          const soil = await soilResponse.json()
          if (soil.success) {
            setSoilData(soil.data)
            console.log('Soil data loaded successfully');
          }
        } else {
          console.warn('Soil API failed:', soilResponse.status);
        }
      } catch (soilError) {
        console.warn('Soil fetch error:', soilError.message);
      }

      // Step 3: Load crop recommendations
      try {
        console.log('Fetching crop recommendations...');
        const cropResponse = await fetch(`${API_BASE_URL}/crops/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: locationQuery,
            soil_data: {
              nitrogen: 220,
              phosphorus: 40,
              potassium: 175,
              ph: 7.0,
              soil_type: 'loamy'
            },
            weather_data: {
              temperature: currentWeatherData?.current?.temperature || 25,
              humidity: currentWeatherData?.current?.humidity || 60,
              rainfall: currentWeatherData?.current?.precipitation || 0
            }
          })
        })
        
        if (cropResponse.ok) {
          const crops = await cropResponse.json()
          if (crops.success) {
            setCropData(crops.data?.recommendations || crops.data || [])
            console.log('Crop data loaded successfully');
          }
        } else {
          console.warn('Crops API failed:', cropResponse.status);
        }
      } catch (cropError) {
        console.warn('Crop fetch error:', cropError.message);
      }

      // Step 4: Load yield predictions
      try {
        console.log('Fetching yield predictions...');
        const yieldResponse = await fetch(`${API_BASE_URL}/crops/predict-yield`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop_type: 'wheat',
            location: locationQuery,
            soil_data: {
              nitrogen: 220,
              phosphorus: 40,
              potassium: 175,
              ph: 7.0
            },
            weather_data: {
              temperature: currentWeatherData?.current?.temperature || 25,
              humidity: currentWeatherData?.current?.humidity || 60,
              rainfall: currentWeatherData?.current?.precipitation || 0
            },
            farm_data: {
              area: 1,
              irrigation: 'drip',
              previous_crop: 'rice'
            }
          })
        })

        if (yieldResponse.ok) {
          const yield_data = await yieldResponse.json()
          if (yield_data.success) {
            setYieldData(yield_data.data)
            console.log('Yield data loaded successfully');
          }
        } else {
          console.warn('Yield API failed:', yieldResponse.status);
        }
      } catch (yieldError) {
        console.warn('Yield fetch error:', yieldError.message);
      }

      console.log('All predictions loaded');

    } catch (err) {
      console.error('Error loading predictions:', err)
      setError(`Failed to load predictions: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle location detection
  const handleLocationDetection = async () => {
    try {
      setLoading(true)
      const location = await getCurrentLocation()
      setUserLocation(location)
      setLocationData(location)
      await loadLocationPredictions(location)
    } catch (err) {
      console.error('Location error:', err)
      setError('Could not detect location. Please enter manually.')
      setLoading(false)
    }
  }

  // Handle manual location input
  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return
    
    try {
      setLoading(true)
      // Create a location object from manual input
      const location = {
        city: manualLocation,
        state: 'Punjab', // Default to Punjab since we have Punjab data
        country: 'India'
      }
      setUserLocation(location)
      setLocationData(location)
      await loadLocationPredictions(location)
    } catch (err) {
      console.error('Manual location error:', err)
      setError(`Could not load data for ${manualLocation}: ${err.message}`)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-detect location on component mount
    handleLocationDetection()
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 mb-2">
            🌾 Smart Farm Dashboard
          </h1>
          <p className="text-green-600">Location-based agricultural insights and recommendations</p>
        </div>

        {/* Location Section */}
        <Card className="bg-white p-6 mb-8 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Your Location
            </h2>
            <Button 
              onClick={handleLocationDetection}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Detect Location
            </Button>
          </div>

          {locationData ? (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">
                  {locationData.city}, {locationData.state}
                </span>
              </div>
              {locationData.latitude && (
                <span className="text-sm text-gray-500">
                  ({locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)})
                </span>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-600 mb-3">Enter your location manually:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g., Amritsar, Ludhiana, Jalandhar..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button onClick={handleManualLocation} className="bg-green-600 hover:bg-green-700">
                  Load Data
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
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
              <p className="text-gray-600">Loading agricultural insights for your location...</p>
            </div>
          </div>
        )}

        {!loading && locationData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Weather Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cloud className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Current Weather</h3>
                  <p className="text-sm text-gray-600">Live conditions</p>
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
                    <strong>{weatherData.current?.conditions}</strong> - {weatherData.current?.description}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <Cloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Weather data not available</p>
                </div>
              )}
            </Card>

            {/* Crop Recommendations Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Crop Recommendations</h3>
                  <p className="text-sm text-gray-600">Best crops for your area</p>
                </div>
              </div>

              {cropData && cropData.length > 0 ? (
                <div className="space-y-2">
                  {cropData.slice(0, 3).map((crop, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="font-medium">{crop.crop || crop.name || crop}</span>
                      {crop.suitability_score && (
                        <span className="text-sm text-green-600">
                          {Math.round(crop.suitability_score)}% suitable
                        </span>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => router.push('/crop-recommendation')}
                  >
                    View All Recommendations
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <Sprout className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Crop recommendations not available</p>
                </div>
              )}
            </Card>

            {/* Yield Prediction Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Yield Prediction</h3>
                  <p className="text-sm text-gray-600">Expected harvest</p>
                </div>
              </div>

              {yieldData ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {yieldData.predicted_yield || yieldData.yield_per_hectare || '2.5'} tons/ha
                    </div>
                    <div className="text-sm text-gray-600">Wheat (estimated)</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/yield-prediction')}
                  >
                    View Detailed Prediction
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Yield prediction not available</p>
                </div>
              )}
            </Card>

            {/* Soil Health Card */}
            <Card className="bg-white p-6 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FlaskConical className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Soil Health</h3>
                  <p className="text-sm text-gray-600">Regional soil analysis</p>
                </div>
              </div>

              {soilData ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {soilData.health_status || soilData.soil_health?.health_status || 'Good'}
                    </div>
                    <div className="text-sm text-gray-600">Overall health status</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/soil-analysis')}
                  >
                    View Detailed Analysis
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  <FlaskConical className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>Soil analysis not available</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Action Cards - Always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => router.push('/weather')}
          >
            <Cloud className="w-6 h-6" />
            <span className="text-sm">Weather</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => router.push('/crop-recommendation')}
          >
            <Sprout className="w-6 h-6" />
            <span className="text-sm">Crops</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => router.push('/yield-prediction')}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm">Yield</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2"
            onClick={() => router.push('/soil-analysis')}
          >
            <FlaskConical className="w-6 h-6" />
            <span className="text-sm">Soil</span>
          </Button>
        </div>
      </div>
    </div>
  )
}