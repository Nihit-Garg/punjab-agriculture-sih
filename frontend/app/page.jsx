"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"

export default function LanguageSelection() {
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { changeLanguage, t, loading, availableLanguages, isLanguageSet } = useLanguage()
  const router = useRouter()

  // Remove auto-redirect to keep this as landing page
  // useEffect(() => {
  //   if (isLanguageSet && !loading) {
  //     router.push('/home')
  //   }
  // }, [isLanguageSet, loading, router])

  const handleGetStarted = async () => {
    if (selectedLanguage && !isLoading) {
      setIsLoading(true)
      try {
        await changeLanguage(selectedLanguage)
        router.push('/home')
      } catch (error) {
        console.error('Failed to change language:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Show loading screen while checking language preference
  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 mb-2">
            {t("appName")}
          </h1>
          <p className="text-sm md:text-base text-green-700">
            {t("chooseLanguage")}
          </p>
        </div>

        {/* Language Options */}
        <div className="flex justify-center gap-3 md:gap-6">
          {availableLanguages.map((lang) => (
            <Card
              key={lang.code}
              className={`w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center cursor-pointer transition-all hover:shadow-lg ${
                selectedLanguage === lang.code
                  ? "bg-green-200 border-green-400 shadow-lg scale-105"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                {lang.label}
              </span>
            </Card>
          ))}
        </div>

        {/* Selected Language Display */}
        {selectedLanguage && (
          <div className="text-center">
            <p className="text-sm md:text-base text-green-700">
              Selected: {availableLanguages.find((l) => l.code === selectedLanguage)?.name}
            </p>
          </div>
        )}

        {/* Get Started Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGetStarted}
            disabled={!selectedLanguage || isLoading}
            className="w-full max-w-xs md:max-w-sm lg:max-w-md bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 rounded-lg text-base md:text-lg lg:text-xl font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              t("getStarted")
            )}
          </Button>
        </div>

        {/* Beta Notice */}
        <div className="text-center">
          <p className="text-xs md:text-sm text-gray-600">
            Smart Agriculture Advisory Platform
          </p>
        </div>
      </div>
    </div>
  )
}