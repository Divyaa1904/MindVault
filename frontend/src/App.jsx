import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import NoteDetail from './pages/NoteDetail'
import NoteEditor from './pages/NoteEditor'
import SharedNote from './pages/SharedNote'
import Team from './pages/Team'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

function AppContent() {
  const location = useLocation()

  const hideNavbar =
    location.pathname === '/new' ||
    location.pathname.startsWith('/edit/')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0f] dark:text-gray-100 dot-pattern transition-colors duration-300">
      {!hideNavbar && <Navbar />}

      <main
        className={
          hideNavbar
            ? 'px-4 py-4'
            : 'container mx-auto px-4 py-8'
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/team" element={<Team />} />
          <Route path="/note/:id" element={<ProtectedRoute><NoteDetail /></ProtectedRoute>} />
          <Route path="/shared/:id" element={<ProtectedRoute><SharedNote /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/community/:id" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 30, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App