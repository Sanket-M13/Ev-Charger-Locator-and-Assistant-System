import { mockStorage, initializeMockData } from './mockDataService'
import { getCarRange } from '../utils/carData'

// Initialize mock data on service load
initializeMockData()

export const carService = {
  getUserCars: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const currentUser = mockStorage.getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }
    
    // Get cars from localStorage for the current user
    const allCars = JSON.parse(localStorage.getItem('user_cars') || '[]')
    const userCars = allCars.filter(car => car.userId === currentUser.id)
    
    return { cars: userCars }
  },

  addCar: async (carData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const currentUser = mockStorage.getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }
    
    const allCars = JSON.parse(localStorage.getItem('user_cars') || '[]')
    const newCar = {
      id: Math.max(...allCars.map(c => c.id), 0) + 1,
      userId: currentUser.id,
      ...carData,
      createdAt: new Date().toISOString()
    }
    
    allCars.push(newCar)
    localStorage.setItem('user_cars', JSON.stringify(allCars))
    
    return { car: newCar }
  },

  updateCar: async (id, carData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allCars = JSON.parse(localStorage.getItem('user_cars') || '[]')
    const index = allCars.findIndex(c => c.id === parseInt(id))
    
    if (index === -1) {
      throw new Error('Car not found')
    }
    
    allCars[index] = { ...allCars[index], ...carData, updatedAt: new Date().toISOString() }
    localStorage.setItem('user_cars', JSON.stringify(allCars))
    
    return { car: allCars[index] }
  },

  updateLocation: async (latitude, longitude) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Store location in localStorage
    const location = { latitude, longitude, timestamp: new Date().toISOString() }
    localStorage.setItem('user_location', JSON.stringify(location))
    
    return { location }
  },

  getNearbyStations: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const stations = mockStorage.getStations()
    const userLocation = JSON.parse(localStorage.getItem('user_location') || 'null')
    
    if (!userLocation) {
      return { stations }
    }
    
    // Calculate distances and sort by proximity
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: calculateDistance(
        userLocation.latitude, userLocation.longitude,
        station.latitude, station.longitude
      )
    })).sort((a, b) => a.distance - b.distance)
    
    return { stations: stationsWithDistance }
  },

  calculateRange: (batteryPercentage, maxRange) => {
    return Math.round((batteryPercentage / 100) * maxRange)
  },

  canReachStation: (currentRange, distance) => {
    return currentRange >= distance * 1.2 // 20% buffer
  }
}

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}