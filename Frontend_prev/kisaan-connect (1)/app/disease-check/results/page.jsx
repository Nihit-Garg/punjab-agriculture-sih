"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, CheckCircle, Info } from "lucide-react"

export default function DiseaseResultsPage() {
  // Mock results data - will be replaced with actual ML model results
  const analysisResults = {
    disease: "Leaf Blight",
    confidence: "87%",
    severity: "Moderate",
    description: "A common fungal disease affecting crop leaves, causing brown spots and yellowing.",
    treatment: [
      "Remove affected leaves immediately",
      "Apply copper-based fungicide spray",
      "Improve air circulation around plants",
      "Avoid overhead watering",
    ],
    prevention: [
      "Plant disease-resistant varieties",
      "Maintain proper spacing between plants",
      "Water at soil level, not on leaves",
      "Apply preventive fungicide during humid weather",
    ],
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/disease-check")} className="p-2">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800 ml-4">Analysis Results</h1>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Disease Identification */}
          <Card className="bg-red-50 p-4 md:p-6 border-0">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-sm md:text-base text-red-800">Disease Detected</h3>
            </div>
            <div className="space-y-2">
              <p className="text-base md:text-lg lg:text-xl font-bold text-red-800">{analysisResults.disease}</p>
              <p className="text-xs md:text-sm text-red-700">Confidence: {analysisResults.confidence}</p>
              <p className="text-xs md:text-sm text-red-700">Severity: {analysisResults.severity}</p>
            </div>
          </Card>

          {/* Description */}
          <Card className="bg-white p-4 md:p-6 border-0">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm md:text-base text-gray-800">Description</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-700">{analysisResults.description}</p>
          </Card>

          {/* Treatment */}
          <Card className="bg-green-50 p-4 md:p-6 border-0">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-sm md:text-base text-green-800">Recommended Treatment</h3>
            </div>
            <ul className="space-y-1">
              {analysisResults.treatment.map((step, index) => (
                <li key={index} className="text-xs md:text-sm text-green-700 flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </Card>

          {/* Prevention */}
          <Card className="bg-blue-50 p-4 md:p-6 border-0">
            <h3 className="font-semibold text-sm md:text-base text-blue-800 mb-3">Prevention Tips</h3>
            <ul className="space-y-1">
              {analysisResults.prevention.map((tip, index) => (
                <li key={index} className="text-xs md:text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => (window.location.href = "/disease-check")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 text-sm md:text-base"
            >
              Check Another Image
            </Button>
            <Button
              onClick={() => (window.location.href = "/home")}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 md:py-4 text-sm md:text-base"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
