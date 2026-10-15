
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import NoteCard from '../components/NoteCard'
import NotePanel from '../components/NotePanel'
import WelcomeSplash from '../components/WelcomeSplash'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiMessageCircle, FiZap, FiBookOpen } from 'react-icons/fi'  

const Home = () => {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const controllerRef = useRef(null)

 
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [chatSessions, setChatSessions] = useState([])

  // Welcome splash — show once per session
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    if (user && !sessionStorage.getItem('mindvault_welcomed')) {
      setShowSplash(true)
      sessionStorage.setItem('mindvault_welcomed', 'true')
    }
  }, [user])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes/getAll")
      setNotes(res.data)
      setSearchResults(res.data)
    } catch (err) {
      toast.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  const fetchChatSessions = async () => {
    try {
      const res = await API.get("/notes/chat/sessions")
      setChatSessions(res.data)
    } catch (err) {
      console.error("Failed to fetch chat sessions")
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotes()
      fetchChatSessions()
    }
  }, [user])

  useEffect(() => {
    const query = searchTerm.trim()

    if (!query) {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
      setSearchResults(notes)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        if (controllerRef.current) {
          controllerRef.current.abort()
        }
        controllerRef.current = new AbortController()

        const res = await API.post(
          "/notes/search",
          { query },
          { signal: controllerRef.current.signal }
        )
        setSearchResults(res.data)
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error("Search failed")
        }
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [searchTerm, notes])

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/delete/${id}`)
      setNotes(notes.filter((note) => note._id !== id))
      setSearchResults(prev => prev.filter(note => note._id !== id))
      toast.success('Note deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleNewChat = () => {
    setChatMessages([])
    setCurrentSessionId(null)
  }

  const handleSelectChatSession = async (id) => {
    try {
      setChatLoading(true)
      const res = await API.get(`/notes/chat/sessions/${id}`)
      setCurrentSessionId(res.data._id)
      setChatMessages(res.data.messages)
    } catch (err) {
      toast.error("Failed to load chat history")
    } finally {
      setChatLoading(false)
    }
  }

  const handleSendMessage = async (question) => {
    if (!question.trim()) return

    const newMessages = [...chatMessages, { role: 'user', content: question }]
    setChatMessages(newMessages)
    setChatLoading(true)

    try {
      const payload = { question }
      if (currentSessionId) payload.sessionId = currentSessionId
      const res = await API.post("/notes/chat", payload)
      const { answer, citations, sessionId } = res.data
      setChatMessages([...newMessages, { role: 'assistant', content: answer, citations }])
      
      if (sessionId && !currentSessionId) {
        setCurrentSessionId(sessionId)
        fetchChatSessions()
      }
    } catch (err) {
      toast.error("AI response failed")
      setChatMessages([...newMessages, { role: 'assistant', content: "Sorry, I couldn't process that.", citations: [] }])
    } finally {
      setChatLoading(false)
    }
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-24 max-w-2xl mx-auto"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <FiZap className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Welcome to MindVault
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            Your AI-powered personal knowledge base. Capture, organize, and search your notes with intelligent assistance.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {/* Welcome Splash */}
      <AnimatePresence>
        {showSplash && (
          <WelcomeSplash
            firstName={user.firstName}
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>

      <div className={`relative transition-all duration-300 ${isChatOpen ? 'lg:mr-[28rem]' : ''}`}>
        {/* Ambient glow */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Capture your thoughts and ideas</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-auto relative flex-1 md:flex-initial">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-all"
              />
            </div>
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 transition-all shrink-0"
              title="AI Chat"
            >
              <FiMessageCircle size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-4">
            <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <p className="text-sm text-gray-600">Loading your notes...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10">
              <FiBookOpen className="text-3xl text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'No notes match your search.' : 'Create your first note to start building your knowledge base.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {searchResults.map((note) => (
                <NoteCard key={note._id} note={note} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Chat Panel */}
        <NotePanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSend={handleSendMessage}
          loading={chatLoading}
          chatSessions={chatSessions}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectChatSession}
          currentSessionId={currentSessionId}
        />
      </div>
    </>
  )
}

export default Home
