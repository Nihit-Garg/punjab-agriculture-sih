"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function MarketPricingPage() {
  const [selectedCrop, setSelectedCrop] = useState("wheat")

  const crops = [
    { id: "wheat", name: "Wheat", icon: "🌾" },
    { id: "rice", name: "Rice", icon: "🌾" },
    { id: "corn", name: "Corn", icon: "🌽" },
    { id: "tomato", name: "Tomato", icon: "🍅" },
    { id: "onion", name: "Onion", icon: "🧅" },
    { id: "potato", name: "Potato", icon: "🥔" },
  ]

  const priceData = {
    wheat: {
      currentPrice: "₹2,150",
      lastUpdated: "2 hours ago",
      change: "+5.2%",
      trend: "up",
      markets: [
        { name: "Delhi Mandi", price: "₹2,180", change: "+3.1%" },
        { name: "Mumbai APMC", price: "₹2,120", change: "+2.8%" },
        { name: "Chandigarh Market", price: "₹2,160", change: "+4.2%" },
      ],
    },
    rice: {
      currentPrice: "₹3,200",
      lastUpdated: "1 hour ago",
      change: "-2.1%",
      trend: "down",
      markets: [
        { name: "Delhi Mandi", price: "₹3,180", change: "-1.8%" },
        { name: "Mumbai APMC", price: "₹3,220", change: "-2.5%" },
        { name: "Chandigarh Market", price: "₹3,190", change: "-1.9%" },
      ],
    },
    corn: {
      currentPrice: "₹1,850",
      lastUpdated: "3 hours ago",
      change: "0.0%",
      trend: "stable",
      markets: [
        { name: "Delhi Mandi", price: "₹1,850", change: "0.0%" },
        { name: "Mumbai APMC", price: "₹1,845", change: "-0.3%" },
        { name: "Chandigarh Market", price: "₹1,855", change: "+0.3%" },
      ],
    },
  }

  const currentData = priceData[selectedCrop] || priceData.wheat

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-600" />
      default:
        return <Minus className="w-5 h-5 text-gray-600" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/home")} className="p-2">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800 ml-4">Market Pricing</h1>
        </div>

        {/* Current Price Card */}
        <Card className="bg-white p-4 md:p-6 lg:p-8 border-0 shadow-sm mb-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {currentData.currentPrice}
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              {getTrendIcon(currentData.trend)}
              <span className={`font-medium text-sm md:text-base ${getTrendColor(currentData.trend)}`}>
                {currentData.change}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Today's Price: {crops.find((c) => c.id === selectedCrop)?.name}
            </p>
            <p className="text-xs text-gray-500 mt-2">Last updated: {currentData.lastUpdated}</p>
          </div>
        </Card>

        {/* Crop Selection */}
        <Card className="bg-white p-4 md:p-6 border-0 shadow-sm mb-6">
          <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-3">Choose Your Crop</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2 md:gap-3">
            {crops.map((crop) => (
              <Button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                variant={selectedCrop === crop.id ? "default" : "outline"}
                className={`h-12 md:h-16 lg:h-20 flex flex-col items-center gap-1 ${
                  selectedCrop === crop.id
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                <span className="text-sm md:text-lg">{crop.icon}</span>
                <span className="text-xs">{crop.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Prices in and Around */}
        <Card className="bg-white p-4 md:p-6 border-0 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Prices in and Around</h3>
          <div className="space-y-3">
            {currentData.markets.map((market, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{market.name}</p>
                  <p className="text-lg font-bold text-gray-900">{market.price}</p>
                </div>
                <div
                  className={`text-sm font-medium ${market.change.startsWith("+") ? "text-green-600" : market.change.startsWith("-") ? "text-red-600" : "text-gray-600"}`}
                >
                  {market.change}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Advisory */}
        <Card className="bg-green-50 p-4 md:p-6 border-0">
          <h3 className="font-semibold text-green-800 mb-2">Advisory</h3>
          <p className="text-sm text-green-700 mb-1">Best time to sell: Morning hours (8-10 AM)</p>
          <p className="text-sm text-green-700">
            {currentData.trend === "up"
              ? "Prices are trending upward. Good time to sell."
              : currentData.trend === "down"
                ? "Prices are declining. Consider holding if possible."
                : "Prices are stable. Normal trading conditions."}
          </p>
        </Card>
      </div>
    </div>
  )
}
