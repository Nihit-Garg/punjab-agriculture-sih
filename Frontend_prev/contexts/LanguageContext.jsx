"use client"

import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Translation data
const translations = {
  en: {
    appName: "KisaanConnect",
    chooseLanguage: "Choose your preferred language",
    getStarted: "Get Started",
    home: "Home",
    weather: "Weather",
    diseaseCheck: "Disease Check",
    marketPricing: "Market Pricing",
    fertilizer: "Fertilizer/Pesticide",
    chatbot: "Ask AI Assistant",
    voiceInput: "Voice Input",
    todaysWeather: "Today's Weather",
    forecast: "Forecast for the week",
    alerts: "Alerts",
    advisory: "Today's Advisory",
    uploadImage: "Upload Image",
    selectCrop: "Choose Your Crop",
    pricesAround: "Prices in and Around",
  },
  hi: {
    appName: "किसानकनेक्ट",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें",
    getStarted: "शुरू करें",
    home: "होम",
    weather: "मौसम",
    diseaseCheck: "रोग जांच",
    marketPricing: "बाजार मूल्य",
    fertilizer: "उर्वरक/कीटनाशक",
    chatbot: "AI सहायक से पूछें",
    voiceInput: "आवाज इनपुट",
    todaysWeather: "आज का मौसम",
    forecast: "सप्ताह का पूर्वानुमान",
    alerts: "अलर्ट",
    advisory: "आज की सलाह",
    uploadImage: "छवि अपलोड करें",
    selectCrop: "अपनी फसल चुनें",
    pricesAround: "आसपास की कीमतें",
  },
  pa: {
    appName: "ਕਿਸਾਨਕਨੈਕਟ",
    chooseLanguage: "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    home: "ਘਰ",
    weather: "ਮੌਸਮ",
    diseaseCheck: "ਬਿਮਾਰੀ ਜਾਂਚ",
    marketPricing: "ਮਾਰਕੀਟ ਕੀਮਤ",
    fertilizer: "ਖਾਦ/ਕੀਟਨਾਸ਼ਕ",
    chatbot: "AI ਸਹਾਇਕ ਤੋਂ ਪੁੱਛੋ",
    voiceInput: "ਆਵਾਜ਼ ਇਨਪੁਟ",
    todaysWeather: "ਅੱਜ ਦਾ ਮੌਸਮ",
    forecast: "ਹਫ਼ਤੇ ਦਾ ਪੂਰਵਾਨੁਮਾਨ",
    alerts: "ਅਲਰਟ",
    advisory: "ਅੱਜ ਦੀ ਸਲਾਹ",
    uploadImage: "ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    selectCrop: "ਆਪਣੀ ਫਸਲ ਚੁਣੋ",
    pricesAround: "ਆਸਪਾਸ ਦੀਆਂ ਕੀਮਤਾਂ",
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("kisaan-language")
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem("kisaan-language", newLanguage)
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return <LanguageContext.Provider value={{ language, changeLanguage, t }}>{children}</LanguageContext.Provider>
}
