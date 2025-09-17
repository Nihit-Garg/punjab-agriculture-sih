"use client"

import { Card } from "@/components/ui/card"
import { CloudSun, Sprout, Camera, TrendingUp } from "lucide-react"

export default function HomePage() {
  const mainOptions = [
    {
      id: "fertilizer",
      title: "Fertilizer/Pesticide",
      icon: <Sprout className="w-8 h-8" />,
      href: "/fertilizer",
      color: "bg-green-200 hover:bg-green-300",
    },
    {
      id: "weather",
      title: "Weather",
      icon: <CloudSun className="w-8 h-8" />,
      href: "/weather",
      color: "bg-blue-200 hover:bg-blue-300",
    },
    {
      id: "disease",
      title: "Disease Check",
      subtitle: "(img upload)",
      icon: <Camera className="w-8 h-8" />,
      href: "/disease-check",
      color: "bg-red-200 hover:bg-red-300",
    },
    {
      id: "pricing",
      title: "Market Pricing",
      icon: <TrendingUp className="w-8 h-8" />,
      href: "/market-pricing",
      color: "bg-yellow-200 hover:bg-yellow-300",
    },
  ]

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800">KisaanConnect</h1>
        </div>

        {/* Main Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8">
          {mainOptions.map((option) => (
            <Card
              key={option.id}
              className={`${option.color} p-4 md:p-6 lg:p-8 cursor-pointer transition-all hover:shadow-lg border-0`}
              onClick={() => (window.location.href = option.href)}
            >
              <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                <div className="text-gray-700 [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-8 md:[&>svg]:h-8 lg:[&>svg]:w-10 lg:[&>svg]:h-10">
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs md:text-sm lg:text-base">{option.title}</h3>
                  {option.subtitle && <p className="text-xs md:text-sm text-gray-600">{option.subtitle}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs md:text-sm text-gray-600">
            Use the floating chat button for AI assistance and voice input
          </p>
        </div>
      </div>
    </div>
  )
}
