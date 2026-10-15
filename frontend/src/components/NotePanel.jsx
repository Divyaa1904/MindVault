import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiX, FiMessageSquare, FiZap, FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const NotePanel = ({ isOpen, onClose, messages, onSend, loading, chatSessions, onNewChat, onSelectSession, currentSessionId }) => {
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 dark:bg-[#0c0c18]/95 backdrop-blur-xl border-l border-gray-200 dark:border-violet-500/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                  <FiZap className="text-violet-600 dark:text-violet-400 text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Powered by your knowledge</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${showHistory ? 'bg-violet-600/20 border-violet-500/40 text-violet-700 dark:text-violet-300' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  History
                </button>
                <button
                  onClick={() => {
                      onNewChat()
                      setShowHistory(false)
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 transition-all"
                >
                  New
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 overflow-hidden flex flex-col">
               {/* History Overlay */}
               <AnimatePresence>
                  {showHistory && (
                      <motion.div
                          initial={{ x: '-100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '-100%', opacity: 0 }}
                          transition={{ type: 'tween', duration: 0.3 }}
                          className="absolute inset-0 z-10 bg-white/95 dark:bg-[#0c0c18]/95 backdrop-blur-xl flex flex-col"
                      >
                          <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Chats</h4>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3 space-y-2">
                              {chatSessions?.length === 0 ? (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-10">No previous chats</p>
                              ) : (
                                  chatSessions?.map(session => (
                                      <button
                                          key={session._id}
                                          onClick={() => {
                                              onSelectSession(session._id)
                                              setShowHistory(false)
                                          }}
                                          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex flex-col gap-1 ${currentSessionId === session._id ? 'bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-inner' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'}`}
                                      >
                                          <span className="truncate font-medium">{session.title || 'Chat'}</span>
                                          <span className="text-[10px] opacity-60">
                                              {new Date(session.updatedAt).toLocaleDateString()}
                                          </span>
                                      </button>
                                  ))
                              )}
                          </div>
                      </motion.div>
                  )}
               </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                    <FiMessageSquare className="text-2xl text-violet-500/50 dark:text-violet-400/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-500">Ask me anything</p>
                    <p className="text-xs text-gray-400 dark:text-gray-700 mt-1">
                      I'll search your knowledge base for answers.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Sources</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cite, i) => (
                              <Link 
                                key={i} 
                                to={`/note/${cite._id}`}
                                className="text-xs px-2 py-1 rounded-md bg-white dark:bg-black/30 text-violet-600 dark:text-violet-300 hover:text-violet-700 dark:hover:text-violet-200 hover:bg-violet-50 dark:hover:bg-black/50 border border-violet-100 dark:border-violet-500/20 transition-colors flex items-center gap-1"
                              >
                                <FiFileText size={10} />
                                <span className="truncate max-w-[120px]">{cite.title}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:200ms]" />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:400ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20">
              <div className="relative flex items-center bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all shadow-sm">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors mr-1"
                >
                  <FiSend size={18} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-500 dark:text-gray-500 mt-2">
                AI can make mistakes. Verify important information.
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotePanel