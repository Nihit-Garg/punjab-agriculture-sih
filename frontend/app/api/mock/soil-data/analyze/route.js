// Mock Soil Analysis API for frontend-only deployment
export async function POST(request) {
  const body = await request.json()
  const location = body.location || 'Amritsar'
  
  // Punjab districts soil data
  const districtData = {
    'amritsar': { ph: 7.2, nitrogen: 240, phosphorus: 45, potassium: 180, crops: ['wheat', 'rice', 'maize'] },
    'ludhiana': { ph: 6.8, nitrogen: 220, phosphorus: 38, potassium: 195, crops: ['wheat', 'rice', 'sugarcane'] },
    'jalandhar': { ph: 7.0, nitrogen: 235, phosphorus: 42, potassium: 175, crops: ['wheat', 'rice', 'cotton'] },
    'patiala': { ph: 7.1, nitrogen: 210, phosphorus: 40, potassium: 160, crops: ['wheat', 'rice', 'barley'] },
    'bathinda': { ph: 6.9, nitrogen: 200, phosphorus: 35, potassium: 185, crops: ['wheat', 'cotton', 'mustard'] }
  }
  
  const locationKey = location.toLowerCase()
  const data = districtData[locationKey] || districtData['amritsar']
  
  const mockSoilData = {
    success: true,
    data: {
      location: location,
      soil_health: {
        ph: data.ph,
        nitrogen: data.nitrogen,
        phosphorus: data.phosphorus,
        potassium: data.potassium,
        organic_carbon: 0.65,
        conductivity: 0.28,
        health_status: 'Good',
        total_nutrients: data.nitrogen + data.phosphorus + data.potassium,
        recommendations: [
          'Soil health is good for most crops',
          'Regular organic matter addition recommended',
          'Monitor pH levels seasonally'
        ]
      },
      suitable_crops: data.crops,
      data_source: 'punjab_agricultural_data'
    },
    timestamp: new Date().toISOString()
  }
  
  return Response.json(mockSoilData)
}