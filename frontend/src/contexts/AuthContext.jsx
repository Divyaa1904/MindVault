import { createContext, useState, useEffect, useContext } from 'react'
import API from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in (cookie present)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/user/check')
        setUser(res.data.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Login function
  const login = async (emailId, password) => {
    try {
      const res = await API.post('/user/login', { emailId, password })
      setUser(res.data.user)
      toast.success('Logged in successfully!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      return false
    }
  }

  // Register function (Send OTP)
  const register = async (firstName, lastName, emailId, password) => {
    try {
      const res = await API.post('/user/register', { firstName, lastName, emailId, password})
      setUser(res.data.user)
      toast.success(res.data.message || 'Registration successful!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
      return { success: false }
    }
  }

  // Verify OTP function
  const verifyOtp = async (emailId, otp) => {
    try {
      const res = await API.post('/user/verify-otp', { emailId, otp })
      setUser(res.data.user)
      toast.success('Registration successful!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      return false
    }
  }

  // Request password reset OTP
  const requestPasswordReset = async (emailId) => {
    try {
      const res = await API.post('/user/forgot-password-otp', { emailId })
      toast.success(res.data.message || 'Password reset OTP sent!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
      return false
    }
  }

  // Reset password
  const resetPassword = async (emailId, otp, newPassword) => {
    try {
      const res = await API.post('/user/reset-password', { emailId, otp, newPassword })
      toast.success(res.data.message || 'Password reset successfully!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed')
      return false
    }
  }

  // Logout
  const logout = async () => {
    try {
      await API.post('/user/logout')
      setUser(null)
      toast.success('Logged out')
    } catch (err) {
      toast.error('Logout error')
    }
  }

  // Google Auth
  const googleLogin = async (credential) => {
    try {
      const res = await API.post('/user/google-auth', { credential })
      if (res.data.requiresRegistration) {
        return { requiresRegistration: true, googleData: res.data.googleData }
      }
      setUser(res.data.user)
      toast.success('Logged in successfully with Google!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Login failed')
      return { success: false }
    }
  }

  const googleRegister = async (credential, firstName, lastName) => {
    try {
      const res = await API.post('/user/google-register', { credential, firstName, lastName })
      setUser(res.data.user)
      toast.success('Registration successful with Google!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Registration failed')
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, googleLogin, googleRegister, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}