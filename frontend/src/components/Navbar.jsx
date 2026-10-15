import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { FiLogOut, FiPlus, FiHome, FiUser, FiUsers, FiSun, FiMoon } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className="sticky top-0 z-40 glass px-6 py-3 flex justify-between items-center"
    >
      <Link to="/" className="group flex items-center gap-2">
        <img src="/mindvault_logo.jpg" alt="MindVault Logo" className="w-8 h-8 rounded-lg shadow-sm" />
        <span className="text-xl font-bold gradient-text tracking-tight">
          MindVault
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20"
        >
          {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        {user ? (
          <>
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <FiHome size={16} /> Home
            </Link>
            <Link
              to="/communities"
              className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <FiUsers size={16} /> Communities
            </Link>
            <Link
              to="/new"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
            >
              <FiPlus size={16} /> New Note
            </Link>

            {/* Profile Icon + Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
                  profileOpen
                    ? 'bg-violet-100 dark:bg-violet-600/20 border-violet-300 dark:border-violet-500/40 text-violet-600 dark:text-violet-300'
                    : 'bg-gray-200 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
                }`}
              >
                <FiUser size={16} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-[#0f0f1a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5 truncate">{user.emailId}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/team"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all mb-1"
                      >
                        <FiUsers size={15} /> MindVault Team
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <FiLogOut size={15} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-violet-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar