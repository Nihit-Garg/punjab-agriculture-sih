"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { 
  CloudSun, 
  Sprout, 
  Camera, 
  TrendingUp, 
  Leaf, 
  BarChart3, 
  FlaskConical,
  ArrowLeft 
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { t } = useLanguage()
  const router = useRouter()

  const mainOptions = [
    {
      id: "crop-recommendation",
      title: t("cropRecommendation"),
      subtitle: "AI-powered suggestions",
      icon: <Sprout className="w-8 h-8" />,
      href: "/crop-recommendation",
      color: "bg-green-200 hover:bg-green-300",
      description: "Get personalized crop recommendations based on your soil and weather conditions"
    },
    {
      id: "weather",
      title: t("weather"),
      subtitle: "Live updates & forecasts", 
      icon: <CloudSun className="w-8 h-8" />,
      href: "/weather",
      color: "bg-blue-200 hover:bg-blue-300",
      description: "Real-time weather data and agricultural advisories"
    },
    {
      id: "soil-analysis",
      title: t("soilAnalysis"),
      subtitle: "NPK analysis & health",
      icon: <FlaskConical className="w-8 h-8" />,
      href: "/soil-analysis",
      color: "bg-yellow-200 hover:bg-yellow-300",
      description: "Analyze your soil composition and get fertilizer recommendations"
    },
    {
      id: "yield-prediction",
      title: t("yieldPrediction"),
      subtitle: "ML-based forecasting",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/yield-prediction",
      color: "bg-purple-200 hover:bg-purple-300",
      description: "Predict crop yields based on current conditions"
    },
    {
      id: "disease",
      title: t("diseaseCheck"),
      subtitle: t("uploadImage"),
      icon: <Camera className="w-8 h-8" />,
      href: "/disease-check",
      color: "bg-red-200 hover:bg-red-300",
      description: "Upload plant images to detect diseases and get treatment advice"
    },
    {
      id: "fertilizer",
      title: t("fertilizer"),
      subtitle: "Dosage & timing",
      icon: <Leaf className="w-8 h-8" />,
      href: "/fertilizer",
      color: "bg-emerald-200 hover:bg-emerald-300",
      description: "Get fertilizer and pesticide recommendations with proper dosages"
    },
    {
      id: "pricing",
      title: t("marketPricing"),
      subtitle: "Live market rates",
      icon: <TrendingUp className="w-8 h-8" />,
      href: "/market-pricing",
      color: "bg-orange-200 hover:bg-orange-300",
      description: "Check current market prices for your crops"
    },
    {
      id: "crop-info",
      title: t("cropInfo"),
      subtitle: "Growing guides",
      icon: <Sprout className="w-8 h-8" />,
      href: "/crop-info",
      color: "bg-teal-200 hover:bg-teal-300",
      description: "Learn about different crops, growing seasons, and best practices"
    },
  ]

  const handleNavigation = (href) => {
    router.push(href)
  }

  const handleLanguageChange = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 lg:mb-12">
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800">
              {t("appName")}
            </h1>
            <p className="text-sm md:text-base text-green-700 mt-1">
              Smart Agriculture Advisory Platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLanguageChange}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Language
          </Button>
        </div>

        {/* Main Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8">
          {mainOptions.map((option) => (
            <Card
              key={option.id}
              className={`${option.color} p-4 md:p-6 lg:p-8 cursor-pointer transition-all hover:shadow-lg border-0 hover:scale-105`}
              onClick={() => handleNavigation(option.href)}
            >
              <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                <div className="text-gray-700 [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-8 md:[&>svg]:h-8 lg:[&>svg]:w-10 lg:[&>svg]:h-10">
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs md:text-sm lg:text-base leading-tight">
                    {option.title}
                  </h3>
                  {option.subtitle && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {option.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-white p-4 md:p-6 border-0 shadow-sm">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">5000+</div>
              <p className="text-sm md:text-base text-gray-600">Farmers Helped</p>
            </div>
          </Card>
          
          <Card className="bg-white p-4 md:p-6 border-0 shadow-sm">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">50+</div>
              <p className="text-sm md:text-base text-gray-600">Crop Varieties</p>
            </div>
          </Card>
          
          <Card className="bg-white p-4 md:p-6 border-0 shadow-sm">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">95%</div>
              <p className="text-sm md:text-base text-gray-600">Accuracy Rate</p>
            </div>
          </Card>
        </div>

        {/* Footer Information */}
        <div className="text-center space-y-2">
          <p className="text-xs md:text-sm text-gray-600">
            Powered by AI and Machine Learning for precision agriculture
          </p>
          <p className="text-xs text-gray-500">
            Available in English, Hindi, and Punjabi
          </p>
        </div>
      </div>
    </div>
  )
}