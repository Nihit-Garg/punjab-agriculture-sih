"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Upload, X } from "lucide-react"

export default function DiseaseCheckPage() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (selectedImage) {
      setIsAnalyzing(true)
      // Simulate analysis time
      setTimeout(() => {
        window.location.href = "/disease-check/results"
      }, 2000)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/home")} className="p-2">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800 ml-4">Disease Check</h1>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Upload Area */}
          <Card className="bg-white p-4 md:p-6 lg:p-8 border-2 border-dashed border-gray-300 text-center">
            {!imagePreview ? (
              <div className="space-y-4">
                <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Upload an image of your crop to check for diseases
                  </p>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-3">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Uploaded crop"
                    className="w-full h-40 md:h-48 lg:h-64 object-cover rounded-lg"
                  />
                  <Button variant="destructive" size="sm" onClick={clearImage} className="absolute top-2 right-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm md:text-base text-green-700 font-medium">Image uploaded successfully!</p>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 p-4 md:p-6 border-0">
            <h3 className="font-semibold text-sm md:text-base text-blue-800 mb-2">Tips for better results:</h3>
            <ul className="text-xs md:text-sm text-blue-700 space-y-1">
              <li>• Take clear, well-lit photos</li>
              <li>• Focus on affected areas of the plant</li>
              <li>• Avoid blurry or dark images</li>
              <li>• Include leaves, stems, or fruits showing symptoms</li>
            </ul>
          </Card>

          {/* Analyze Button */}
          {selectedImage && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 text-base md:text-lg"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze for Diseases"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
