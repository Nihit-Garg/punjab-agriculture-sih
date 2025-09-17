"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, MessageCircle, Mic, MicOff, X } from "lucide-react"

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your KisaanConnect AI assistant. How can I help you with your farming needs today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response (replace with actual ChatGPT API call)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    if (input.includes("weather")) {
      return "For weather information, you can check our Weather section. It provides current conditions, forecasts, and farming advisories based on weather patterns."
    } else if (input.includes("disease") || input.includes("pest")) {
      return "I can help you identify plant diseases! Use our Disease Check feature to upload images of affected plants. I can also recommend appropriate treatments and prevention methods."
    } else if (input.includes("fertilizer") || input.includes("nutrient")) {
      return "For fertilizer recommendations, check our Fertilizer & Pesticide section. I can suggest the right NPK ratios and application methods based on your crop type and growth stage."
    } else if (input.includes("price") || input.includes("market")) {
      return "Current market prices are available in our Market Pricing section. I can help you understand price trends and suggest the best times to sell your produce."
    } else {
      return "I'm here to help with all your farming questions! You can ask me about crop diseases, fertilizers, weather conditions, market prices, or any other agricultural topics."
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      }
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 md:p-4 shadow-lg flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline text-sm md:text-base">Chat with AI</span>
          </Button>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 lg:w-[420px] h-[400px] md:h-[500px] lg:h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-green-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-semibold text-base md:text-lg">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-700 p-1"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-orange-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 md:gap-3 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user" ? "bg-green-600" : "bg-blue-600"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    )}
                  </div>
                  <Card
                    className={`p-2 md:p-3 border-0 ${
                      message.sender === "user" ? "bg-green-600 text-white" : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-xs md:text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 md:mt-2 ${message.sender === "user" ? "text-green-100" : "text-gray-500"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Card>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <Card className="bg-white p-2 md:p-3 border-0 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 bg-white border-t rounded-b-lg">
            <div className="flex gap-2 md:gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 text-xs md:text-sm h-8 md:h-10"
              />
              <Button
                onClick={toggleVoiceInput}
                variant="outline"
                size="sm"
                className={`p-1.5 md:p-2 h-8 md:h-10 w-8 md:w-10 ${isListening ? "bg-red-100 text-red-600" : ""}`}
              >
                {isListening ? <MicOff className="w-3 h-3 md:w-4 md:h-4" /> : <Mic className="w-3 h-3 md:w-4 md:h-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700 p-1.5 md:p-2 h-8 md:h-10 w-8 md:w-10"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
