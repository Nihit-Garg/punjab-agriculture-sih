"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Placeholder data - will be replaced with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWeatherData({
        current: {
          temperature: "28°C",
          condition: "Partly Cloudy",
          location: "Your Location",
          lastUpdated: new Date().toLocaleString(),
        },
        forecast: [
          { day: "Mon", temp: "30°", condition: "sunny" },
          { day: "Tue", temp: "28°", condition: "cloudy" },
          { day: "Wed", temp: "26°", condition: "rainy" },
          { day: "Thu", temp: "29°", condition: "sunny" },
          { day: "Fri", temp: "31°", condition: "sunny" },
          { day: "Sat", temp: "27°", condition: "cloudy" },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/home")} className="p-2">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800 ml-4">Weather</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm md:text-base text-green-700">Loading weather data...</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Current Weather */}
            <Card className="bg-blue-100 p-4 md:p-6 lg:p-8 border-0">
              <div className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-2">
                  {weatherData.current.temperature}
                </div>
                <p className="text-sm md:text-base lg:text-lg text-blue-700 mb-1">{weatherData.current.condition}</p>
                <p className="text-xs md:text-sm text-blue-600">Today's weather: {weatherData.current.location}</p>
                <p className="text-xs text-blue-500 mt-2">Last updated: {weatherData.current.lastUpdated}</p>
              </div>
            </Card>

            {/* Weekly Forecast */}
            <Card className="bg-white p-4 md:p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-3">Forecast for the week</h3>
              <div className="flex justify-between">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full mb-1"></div>
                    <p className="text-xs text-gray-600">{day.day}</p>
                    <p className="text-xs md:text-sm font-medium">{day.temp}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Alerts */}
            <Card className="bg-orange-100 p-4 border-0">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Alerts</h3>
              </div>
              <p className="text-sm text-orange-700">No weather alerts for your area</p>
            </Card>

            {/* Advisory */}
            <Card className="bg-green-100 p-4 border-0">
              <h3 className="font-semibold text-green-800 mb-2">Today's Advisory</h3>
              <p className="text-sm text-green-700 mb-1">Best time to water: Early morning (6-8 AM)</p>
              <p className="text-sm text-green-700">Good conditions for outdoor farming activities</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
