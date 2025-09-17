"use client"

import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
    cropRecommendation: "Crop Recommendation",
    chatbot: "Ask AI Assistant",
    voiceInput: "Voice Input",
    todaysWeather: "Today's Weather",
    forecast: "Forecast for the week",
    alerts: "Alerts",
    advisory: "Today's Advisory",
    uploadImage: "Upload Image",
    selectCrop: "Choose Your Crop",
    pricesAround: "Prices in and Around",
    soilAnalysis: "Soil Analysis",
    yieldPrediction: "Yield Prediction",
    cropInfo: "Crop Information",
    loading: "Loading...",
    error: "Error occurred",
    retry: "Retry",
    submit: "Submit",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
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
    cropRecommendation: "फसल सिफारिश",
    chatbot: "AI सहायक से पूछें",
    voiceInput: "आवाज इनपुट",
    todaysWeather: "आज का मौसम",
    forecast: "सप्ताह का पूर्वानुमान",
    alerts: "अलर्ट",
    advisory: "आज की सलाह",
    uploadImage: "छवि अपलोड करें",
    selectCrop: "अपनी फसल चुनें",
    pricesAround: "आसपास की कीमतें",
    soilAnalysis: "मिट्टी विश्लेषण",
    yieldPrediction: "उत्पादन पूर्वानुमान",
    cropInfo: "फसल जानकारी",
    loading: "लोड हो रहा है...",
    error: "त्रुटि हुई",
    retry: "पुनः प्रयास करें",
    submit: "जमा करें",
    cancel: "रद्द करें",
    back: "वापस",
    next: "आगे",
    save: "सेव करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    view: "देखें",
    close: "बंद करें",
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
    cropRecommendation: "ਫਸਲ ਸਿਫਾਰਿਸ਼",
    chatbot: "AI ਸਹਾਇਕ ਤੋਂ ਪੁੱਛੋ",
    voiceInput: "ਆਵਾਜ਼ ਇਨਪੁਟ",
    todaysWeather: "ਅੱਜ ਦਾ ਮੌਸਮ",
    forecast: "ਹਫ਼ਤੇ ਦਾ ਪੂਰਵਾਨੁਮਾਨ",
    alerts: "ਅਲਰਟ",
    advisory: "ਅੱਜ ਦੀ ਸਲਾਹ",
    uploadImage: "ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    selectCrop: "ਆਪਣੀ ਫਸਲ ਚੁਣੋ",
    pricesAround: "ਆਸਪਾਸ ਦੀਆਂ ਕੀਮਤਾਂ",
    soilAnalysis: "ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ",
    yieldPrediction: "ਉਤਪਾਦਨ ਪੂਰਵਾਨੁਮਾਨ",
    cropInfo: "ਫਸਲ ਜਾਣਕਾਰੀ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    error: "ਗਲਤੀ ਹੋਈ",
    retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    back: "ਵਾਪਸ",
    next: "ਅਗਲਾ",
    save: "ਸੇਵ ਕਰੋ",
    delete: "ਮਿਟਾਓ",
    edit: "ਸੰਪਾਦਿਤ ਕਰੋ",
    view: "ਦੇਖੋ",
    close: "ਬੰਦ ਕਰੋ",
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(true)

  // Load language preference from backend on mount
  useEffect(() => {
    loadLanguagePreference()
  }, [])

  const loadLanguagePreference = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/language/preference`, {
        credentials: 'include', // Include cookies for session
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.language && translations[data.language]) {
          setLanguage(data.language)
        }
      }
    } catch (error) {
      console.error('Failed to load language preference:', error)
      // Fallback to localStorage
      const savedLanguage = localStorage.getItem("kisaan-language")
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage)
      }
    } finally {
      setLoading(false)
    }
  }

  const changeLanguage = async (newLanguage) => {
    if (!translations[newLanguage]) {
      console.error('Unsupported language:', newLanguage)
      return
    }

    setLanguage(newLanguage)
    localStorage.setItem("kisaan-language", newLanguage)
    
    // Save to backend
    try {
      await fetch(`${API_BASE_URL}/language/preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ language: newLanguage })
      })
    } catch (error) {
      console.error('Failed to save language preference:', error)
      // Continue anyway - localStorage is the fallback
    }
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const getAvailableLanguages = () => {
    return [
      { code: "en", label: "abc", name: "English" },
      { code: "hi", label: "अ", name: "Hindi" },
      { code: "pa", label: "ਅ", name: "Punjabi" },
    ]
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        changeLanguage, 
        t, 
        loading, 
        availableLanguages: getAvailableLanguages(),
        isLanguageSet: language !== "en" || !loading
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}