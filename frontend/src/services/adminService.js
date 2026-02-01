import { mockStorage, initializeMockData } from './mockDataService'

// Initialize mock data on service load
initializeMockData()

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const users = mockStorage.getUsers()
    const stations = mockStorage.getStations()
    const bookings = mockStorage.getBookings()
    const reviews = mockStorage.getReviews()
    
    const stats = {
      totalUsers: users.length,
      totalStations: stations.length,
      totalBookings: bookings.length,
      totalReviews: reviews.length,
      activeBookings: bookings.filter(b => b.status === 'Confirmed').length,
      availableStations: stations.filter(s => s.status === 'Available').length,
      revenue: bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    }
    
    return { stats }
  },

  // User management
  getAllUsers: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const users = mockStorage.getUsers()
    return { users }
  },

  updateUserStatus: async (userId, status) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const users = mockStorage.getUsers()
    const index = users.findIndex(u => u.id === parseInt(userId))
    
    if (index === -1) {
      throw new Error('User not found')
    }
    
    users[index].status = status
    mockStorage.setUsers(users)
    
    return { user: users[index] }
  },

  // Booking management
  getAllBookings: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const bookings = mockStorage.getBookings()
    return { bookings }
  },

  updateBookingStatus: async (bookingId, status) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const bookings = mockStorage.getBookings()
    const index = bookings.findIndex(b => b.id === parseInt(bookingId))
    
    if (index === -1) {
      throw new Error('Booking not found')
    }
    
    bookings[index].status = status
    bookings[index].updatedAt = new Date().toISOString()
    mockStorage.setBookings(bookings)
    
    return { booking: bookings[index] }
  },

  // Reviews and queries
  getAllReviews: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const reviews = mockStorage.getReviews()
    return { reviews }
  },

  getAllQueries: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // For mock service, return empty array
    return { queries: [] }
  },

  respondToQuery: async (queryId, response) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For mock service, just return success
    return { message: 'Response sent successfully' }
  },

  // Station analytics
  getStationAnalytics: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const stations = mockStorage.getStations()
    const bookings = mockStorage.getBookings()
    
    const analytics = stations.map(station => ({
      stationId: station.id,
      stationName: station.name,
      totalBookings: bookings.filter(b => b.stationId === station.id).length,
      revenue: bookings
        .filter(b => b.stationId === station.id)
        .reduce((sum, b) => sum + (b.amount || 0), 0),
      utilizationRate: Math.round(((station.totalSlots - station.availableSlots) / station.totalSlots) * 100)
    }))
    
    return { analytics }
  }
}