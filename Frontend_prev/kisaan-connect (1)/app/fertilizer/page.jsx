"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sprout, Bug, Leaf, Droplets } from "lucide-react"

export default function FertilizerPage() {
  const [selectedCategory, setSelectedCategory] = useState("fertilizers")

  const categories = [
    { id: "fertilizers", name: "Fertilizers", icon: <Sprout className="w-5 h-5" /> },
    { id: "pesticides", name: "Pesticides", icon: <Bug className="w-5 h-5" /> },
  ]

  const fertilizers = [
    {
      name: "NPK 10-26-26",
      type: "Balanced Fertilizer",
      usage: "For overall plant growth",
      application: "Apply 2-3 kg per acre during planting",
      benefits: ["Promotes root development", "Enhances flowering", "Improves fruit quality"],
    },
    {
      name: "Urea (46-0-0)",
      type: "Nitrogen Fertilizer",
      usage: "For leafy growth",
      application: "Apply 1-2 kg per acre as top dressing",
      benefits: ["Rapid green growth", "Increases protein content", "Boosts yield"],
    },
    {
      name: "DAP (18-46-0)",
      type: "Phosphorus Fertilizer",
      usage: "For root and flower development",
      application: "Apply during soil preparation",
      benefits: ["Strong root system", "Better flowering", "Early maturity"],
    },
  ]

  const pesticides = [
    {
      name: "Neem Oil",
      type: "Organic Pesticide",
      usage: "For aphids, whiteflies, and mites",
      application: "Spray 2-3ml per liter of water",
      benefits: ["Safe for beneficial insects", "Biodegradable", "Multiple pest control"],
    },
    {
      name: "Copper Sulfate",
      type: "Fungicide",
      usage: "For fungal diseases",
      application: "Mix 2g per liter and spray on affected areas",
      benefits: ["Prevents blight", "Controls rust", "Long-lasting protection"],
    },
    {
      name: "Bacillus thuringiensis",
      type: "Biological Pesticide",
      usage: "For caterpillars and larvae",
      application: "Apply 1-2g per liter in evening",
      benefits: ["Specific to pests", "Safe for humans", "No resistance buildup"],
    },
  ]

  const currentProducts = selectedCategory === "fertilizers" ? fertilizers : pesticides

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/home")} className="p-2">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-800 ml-4">Fertilizer & Pesticide</h1>
        </div>

        {/* Category Tabs */}
        <div className="flex mb-4 md:mb-6 bg-white rounded-lg p-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`flex-1 flex items-center gap-2 py-2 md:py-3 text-sm md:text-base ${
                selectedCategory === category.id ? "bg-green-600 text-white" : "text-green-700 hover:bg-green-50"
              }`}
            >
              <span className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products List */}
        <div className="space-y-4 md:space-y-6">
          {currentProducts.map((product, index) => (
            <Card key={index} className="bg-white p-4 md:p-6 border-0 shadow-sm">
              <div className="space-y-3 md:space-y-4">
                {/* Product Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-gray-800">{product.name}</h3>
                    <p className="text-xs md:text-sm text-green-600 font-medium">{product.type}</p>
                  </div>
                  <div className="text-green-600">
                    {selectedCategory === "fertilizers" ? (
                      <Leaf className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Droplets className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                </div>

                {/* Usage */}
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Usage:</p>
                  <p className="text-xs md:text-sm text-gray-600">{product.usage}</p>
                </div>

                {/* Application */}
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Application:</p>
                  <p className="text-xs md:text-sm text-gray-600">{product.application}</p>
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Safety Notice */}
        <Card className="bg-yellow-50 p-4 md:p-6 border-0 mt-6">
          <h3 className="font-semibold text-sm md:text-base text-yellow-800 mb-2">Safety Guidelines</h3>
          <ul className="text-xs md:text-sm text-yellow-700 space-y-1">
            <li>• Always read product labels before use</li>
            <li>• Wear protective equipment when applying</li>
            <li>• Follow recommended dosages</li>
            <li>• Store products away from children and pets</li>
            <li>• Consult local agricultural experts for specific advice</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
