import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5173',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Utility functions for Session Storage
const storage = {
  getUsers() {
    return JSON.parse(sessionStorage.getItem('users') || '[]')
  },
  setUsers(users) {
    sessionStorage.setItem('users', JSON.stringify(users))
  },
  getToken() {
    return sessionStorage.getItem('token')
  },
  setToken(token) {
    sessionStorage.setItem('token', token)
  },
  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null')
  },
  setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user))
  },
  clear() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('currentUser')
  },
}

export const authService = {
  async register(userData) {
    try {
      // Get existing users
      const users = storage.getUsers()

      // Check if username or email already exists
      const existingUser = users.find(
        (user) => user.username === userData.username || user.email === userData.email,
      )

      if (existingUser) {
        if (existingUser.username === userData.username) {
          throw { message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }
        }
        if (existingUser.email === userData.email) {
          throw { message: 'อีเมลนี้ถูกใช้งานแล้ว' }
        }
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password, // ในระบบจริงควรเข้ารหัสก่อนเก็บ
        balance: 0, // เพิ่มยอดเงินเริ่มต้น
        transactions: [], // เพิ่มประวัติธุรกรรม
      }

      // Add to users array
      users.push(newUser)
      storage.setUsers(users)

      return { message: 'ลงทะเบียนสำเร็จ' }
    } catch (error) {
      throw error.message ? error : { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }
    }
  },

  async login(credentials) {
    try {
      const users = storage.getUsers()
      const user = users.find(
        (u) => u.username === credentials.username && u.password === credentials.password,
      )

      if (!user) {
        throw { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
      }

      // Generate simple token
      const token = `token_${Date.now()}`
      storage.setToken(token)
      storage.setCurrentUser(user)

      return user
    } catch (error) {
      throw error.message ? error : { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
    }
  },

  async logout() {
    storage.clear()
  },

  async getUserProfile() {
    try {
      const user = storage.getCurrentUser()
      if (!user) {
        throw { message: 'ไม่พบข้อมูลผู้ใช้' }
      }
      return user
    } catch (error) {
      throw error.message ? error : { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' }
    }
  },

  // เพิ่มฟังก์ชันสำหรับอัพเดทข้อมูลผู้ใช้ (เช่น เมื่อมีการฝาก/ถอนเงิน)
  async updateUserData(userData) {
    try {
      const users = storage.getUsers()
      const userIndex = users.findIndex((u) => u.id === userData.id)

      if (userIndex === -1) {
        throw { message: 'ไม่พบข้อมูลผู้ใช้' }
      }

      users[userIndex] = { ...users[userIndex], ...userData }
      storage.setUsers(users)
      storage.setCurrentUser(users[userIndex])

      return users[userIndex]
    } catch (error) {
      throw error.message ? error : { message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' }
    }
  },
}

export const userService = {
  async updateProfile(userData) {
    try {
      const response = await api.put('/users/profile', userData)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw {
          message: 'ไม่พบ API endpoint สำหรับอัปเดตข้อมูล กรุณาตรวจสอบการเชื่อมต่อกับ server',
        }
      }
      throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/password', passwordData)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw {
          message: 'ไม่พบ API endpoint สำหรับเปลี่ยนรหัสผ่าน กรุณาตรวจสอบการเชื่อมต่อกับ server',
        }
      }
      throw error.response?.data || { message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' }
    }
  },
}

export default api
