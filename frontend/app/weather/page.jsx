"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft, CloudSun, MapPin, Thermometer, Droplets, Wind, AlertTriangle, Sprout } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function WeatherPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState('Ludhiana')

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setWeatherData(data.data)
      } else {
        throw new Error(data.message || 'Failed to get weather data')
      }
    } catch (err) {
      console.error('Error fetching weather:', err)
      setError(err.message || 'Failed to get weather data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData()
  }, [])

  const handleLocationChange = (e) => {
    if (e.key === 'Enter') {
      fetchWeatherData()
    }
  }

  const getWeatherIcon = (condition) => {
    if (condition?.toLowerCase().includes('sunny') || condition?.toLowerCase().includes('clear')) {
      return "☀️"
    } else if (condition?.toLowerCase().includes('cloudy')) {
      return "☁️"
    } else if (condition?.toLowerCase().includes('rain')) {
      return "🌧️"
    } else if (condition?.toLowerCase().includes('storm')) {
      return "⛈️"
    }
    return "🌤️"
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
              {t("weather")}
            </h1>
            <p className="text-sm text-green-600">Live weather data and agricultural advisories</p>
          </div>
        </div>

        {/* Location Input */}
        <Card className="bg-white p-4 mb-6 border-0 shadow-sm">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleLocationChange}
              placeholder="Enter city or district name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={fetchWeatherData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Loading...' : 'Get Weather'}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {loading && (
          <Card className="bg-white p-8 text-center border-0 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </Card>
        )}

        {weatherData && (
          <div className="space-y-6">
            {/* Current Weather */}
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 border-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{weatherData.location?.name || location}</h2>
                  <p className="text-blue-100">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-2">{getWeatherIcon(weatherData.current?.condition)}</div>
                  <p className="text-blue-100">{weatherData.current?.condition || 'Clear Sky'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold mb-2">
                    {weatherData.current?.temperature || '25°C'}
                  </div>
                  <p className="text-blue-100">Feels like {weatherData.current?.feels_like || '27°C'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Droplets className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm text-blue-100">Humidity</p>
                    <p className="font-semibold">{weatherData.current?.humidity || '65%'}</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm text-blue-100">Wind</p>
                    <p className="font-semibold">{weatherData.current?.wind_speed || '12 km/h'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weather Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white p-4 border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Temperature Range</p>
                    <p className="font-semibold">
                      {weatherData.current?.temp_min || '18°C'} - {weatherData.current?.temp_max || '32°C'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-4 border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Precipitation</p>
                    <p className="font-semibold">{weatherData.current?.precipitation || '0 mm'}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-4 border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <CloudSun className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">UV Index</p>
                    <p className="font-semibold">{weatherData.current?.uv_index || '6 (High)'}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 5-Day Forecast */}
            {weatherData.forecast && (
              <Card className="bg-white p-6 border-0 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("forecast")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {weatherData.forecast.slice(0, 5).map((day, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        {index === 0 ? 'Today' : day.day || `Day ${index + 1}`}
                      </p>
                      <div className="text-2xl mb-2">{getWeatherIcon(day.condition)}</div>
                      <p className="font-semibold">{day.temp || `${25 + index}°C`}</p>
                      <p className="text-xs text-gray-500">{day.condition || 'Clear'}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Agricultural Advisory */}
            <Card className="bg-green-50 border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">{t("advisory")}</h3>
              </div>
              
              <div className="space-y-3">
                {weatherData.advisory ? (
                  weatherData.advisory.map((advice, index) => (
                    <p key={index} className="text-sm text-green-700">• {advice}</p>
                  ))
                ) : (
                  <>
                    <p className="text-sm text-green-700">• Good conditions for outdoor farming activities</p>
                    <p className="text-sm text-green-700">• Best time to water: Early morning (6-8 AM)</p>
                    <p className="text-sm text-green-700">• Monitor soil moisture levels regularly</p>
                    {weatherData.current?.precipitation && parseInt(weatherData.current.precipitation) > 0 && (
                      <p className="text-sm text-green-700">• Rain expected - adjust irrigation schedule</p>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Alerts */}
            {weatherData.alerts && weatherData.alerts.length > 0 ? (
              <Card className="bg-orange-50 border border-orange-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-800">{t("alerts")}</h3>
                </div>
                <div className="space-y-2">
                  {weatherData.alerts.map((alert, index) => (
                    <p key={index} className="text-sm text-orange-700">• {alert}</p>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-700">No weather alerts for your area</p>
                </div>
              </Card>
            )}

            {weatherData.mock && (
              <Card className="bg-yellow-50 border border-yellow-200 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is sample weather data. 
                  Connect to a weather API service for live data.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}