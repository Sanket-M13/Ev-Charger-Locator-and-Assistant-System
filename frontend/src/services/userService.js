import { mockStorage, initializeMockData } from './mockDataService'

// Initialize mock data on service load
initializeMockData()

export const userService = {
  getAllUsers: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const users = mockStorage.getUsers()
    return { users }
  },

  getUserById: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const users = mockStorage.getUsers()
    const user = users.find(u => u.id === parseInt(id))
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return { user }
  },

  updateUser: async (id, userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const users = mockStorage.getUsers()
    const index = users.findIndex(u => u.id === parseInt(id))
    
    if (index === -1) {
      throw new Error('User not found')
    }
    
    users[index] = { ...users[index], ...userData }
    mockStorage.setUsers(users)
    
    // Update current user if it's the same user
    const currentUser = mockStorage.getCurrentUser()
    if (currentUser && currentUser.id === parseInt(id)) {
      mockStorage.setCurrentUser(users[index])
    }
    
    return { user: users[index] }
  },

  deleteUser: async (id) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const users = mockStorage.getUsers()
    const filteredUsers = users.filter(u => u.id !== parseInt(id))
    
    if (users.length === filteredUsers.length) {
      throw new Error('User not found')
    }
    
    mockStorage.setUsers(filteredUsers)
    
    return { message: 'User deleted successfully' }
  },

  updatePassword: async (id, passwordData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For mock service, just return success
    // In real implementation, you would hash and store the password
    return { message: 'Password updated successfully' }
  }
}