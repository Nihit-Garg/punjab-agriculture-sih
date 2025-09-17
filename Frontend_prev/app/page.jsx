"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LanguageSelection() {
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const { changeLanguage, t } = useLanguage()

  useEffect(() => {
    const savedLanguage = localStorage.getItem("kisaan-language")
    if (savedLanguage) {
      window.location.href = "/home"
    }
  }, [])

  const languages = [
    { code: "en", label: "abc", name: "English" },
    { code: "hi", label: "अ", name: "Hindi" },
    { code: "pa", label: "ਅ", name: "Punjabi" },
  ]

  const handleGetStarted = () => {
    if (selectedLanguage) {
      changeLanguage(selectedLanguage)
      window.location.href = "/home"
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 mb-2">{t("appName")}</h1>
          <p className="text-sm md:text-base text-green-700">{t("chooseLanguage")}</p>
        </div>

        {/* Language Options */}
        <div className="flex justify-center gap-3 md:gap-6">
          {languages.map((lang) => (
            <Card
              key={lang.code}
              className={`w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center cursor-pointer transition-all ${
                selectedLanguage === lang.code
                  ? "bg-green-200 border-green-400 shadow-lg"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">{lang.label}</span>
            </Card>
          ))}
        </div>

        {/* Selected Language Display */}
        {selectedLanguage && (
          <div className="text-center">
            <p className="text-sm md:text-base text-green-700">
              Selected: {languages.find((l) => l.code === selectedLanguage)?.name}
            </p>
          </div>
        )}

        {/* Get Started Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGetStarted}
            disabled={!selectedLanguage}
            className="w-full max-w-xs md:max-w-sm lg:max-w-md bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 rounded-lg text-base md:text-lg lg:text-xl font-medium disabled:bg-gray-400"
          >
            {t("getStarted")}
          </Button>
        </div>
      </div>
    </div>
  )
}
