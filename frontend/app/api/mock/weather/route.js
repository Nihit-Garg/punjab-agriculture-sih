// Mock Weather API for frontend-only deployment
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'Amritsar'
  
  // Mock weather data
  const mockWeatherData = {
    success: true,
    data: {
      location: location,
      current: {
        temperature: Math.round(Math.random() * 10 + 25), // 25-35°C
        feels_like: Math.round(Math.random() * 10 + 30),
        humidity: Math.round(Math.random() * 20 + 50), // 50-70%
        pressure: 1005,
        precipitation: Math.round(Math.random() * 5),
        wind_speed: Math.round(Math.random() * 5 + 2),
        conditions: 'Partly Cloudy',
        description: 'partly cloudy'
      },
      coordinates: {
        lat: 31.6340,
        lon: 74.8723
      },
      timestamp: new Date().toISOString()
    }
  }
  
  return Response.json(mockWeatherData)
}