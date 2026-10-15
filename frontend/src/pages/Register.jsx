import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { GoogleLogin } from '@react-oauth/google'

const Register = () => {
  const { register, verifyOtp, googleLogin, googleRegister } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isGoogleFlow, setIsGoogleFlow] = useState(false)
  const [googleCredential, setGoogleCredential] = useState(null)
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.googleData) {
      setIsGoogleFlow(true)
      setGoogleCredential(location.state.googleData.credential)
      setForm(prev => ({
        ...prev,
        firstName: location.state.googleData.firstName || '',
        lastName: location.state.googleData.lastName || '',
        emailId: location.state.googleData.emailId || ''
      }))
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    if (isGoogleFlow) {
      const success = await googleRegister(googleCredential, form.firstName, form.lastName)
      setLoading(false)
      if (success) {
        sessionStorage.removeItem('mindvault_welcomed')
        navigate('/')
      }
    } else {
      const result = await register(
        form.firstName,
        form.lastName,
        form.emailId,
        form.password
      )
      setLoading(false)
      if (result?.success) {
        sessionStorage.removeItem('mindvault_welcomed')
        navigate('/')
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    const result = await googleLogin(credentialResponse.credential)
    setLoading(false)
    if (result?.success) {
      sessionStorage.removeItem('mindvault_welcomed')
      navigate('/')
    } else if (result?.requiresRegistration) {
      setIsGoogleFlow(true)
      setGoogleCredential(result.googleData.credential)
      setForm(prev => ({
        ...prev,
        firstName: result.googleData.firstName || '',
        lastName: result.googleData.lastName || '',
        emailId: result.googleData.emailId || ''
      }))
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-gray-200 via-transparent to-gray-200 dark:from-violet-500/30 dark:via-transparent dark:to-indigo-500/30 shadow-xl dark:shadow-none">
          <div className="bg-white/90 dark:bg-[#0c0c18]/90 backdrop-blur-xl rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h2 className="text-3xl font-bold gradient-text">
                {isGoogleFlow ? "Confirm Details" : "Create account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
                Join MindVault today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isGoogleFlow && (
                <div className="text-center text-sm text-gray-700 dark:text-gray-300 mb-4 bg-violet-500/10 p-3 rounded-xl border border-violet-500/20">
                  Almost there! Confirm your name to complete registration for <b className="text-violet-600 dark:text-violet-400">{form.emailId}</b>.
                </div>
              )}
              
              <div className="flex gap-3">
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={16} />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={16} />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm transition-all"
                    />
                  </div>
                </div>
              
              {!isGoogleFlow && (
                <>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={16} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={form.emailId}
                      onChange={(e) => setForm({ ...form, emailId: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={16} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm transition-all"
                    />
                  </div>
                </>
              )}
              

              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{"Create Account"} <FiArrowRight size={16} /></>
                )}
              </button>
            </form>

            {!isGoogleFlow && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-[#0c0c18] text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.log('Login Failed');
                    }}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                  />
                </div>
              </div>
            )}

            {!isGoogleFlow && (
              <p className="mt-6 text-center text-gray-500 dark:text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            )}
            
            
            {isGoogleFlow && (
              <p className="mt-6 text-center text-gray-500 dark:text-gray-600 text-sm">
                Want to use a different method?{' '}
                <button type="button" onClick={() => { setIsGoogleFlow(false); }} className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors">
                  Go back
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register