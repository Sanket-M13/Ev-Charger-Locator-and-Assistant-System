import axios from 'axios'
import { API_CONFIG, API_ENDPOINTS } from '../constants/apiConstants'

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const vehicleService = {
  // Get all vehicle brands
  getBrands: async () => {
    const response = await api.get('/vehicles/brands')
    return response.data
  },

  // Get models for a specific brand
  getModels: async (brandId) => {
    const response = await api.get(`/vehicles/brands/${brandId}/models`)
    return response.data
  },

  // Save user's vehicle data
  saveUserVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles/user-vehicle', vehicleData)
    return response.data
  },

  // Get user's saved vehicle data
  getUserVehicle: async () => {
    const response = await api.get('/vehicles/user-vehicle')
    return response.data
  },

  // Get stations within range
  getStationsInRange: async (latitude, longitude, rangeKm) => {
    const response = await api.get(`/stations/nearby?lat=${latitude}&lng=${longitude}&range=${rangeKm}`)
    return response.data
  }
}