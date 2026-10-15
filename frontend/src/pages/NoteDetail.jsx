import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiArrowLeft, FiClock, FiTag, FiZap, FiX, FiShare2, FiAlignLeft, FiUsers } from 'react-icons/fi'
import ProtectedRoute from '../components/ProtectedRoute'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

const lowlight = createLowlight(common);

const NoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showCommunityModal, setShowCommunityModal] = useState(false)
  const [communitiesList, setCommunitiesList] = useState([])
  const [sharingCommunity, setSharingCommunity] = useState(false)

  useEffect(() => {
    if (user) {
      API.get(`/notes/getById/${id}`)
        .then((res) => setNote(res.data))
        .catch(() => toast.error('Note not found'))
        .finally(() => setLoading(false))
    }
  }, [id, user])

  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return

    try {
      await API.delete(`/notes/delete/${id}`)
      toast.success('Note deleted')
      navigate('/')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleShare = () => {
    const shareUrl = window.location.origin + '/shared/' + note._id
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied')
  }

  const handleShareToCommunityClick = async () => {
    try {
      const res = await API.get('/community')
      setCommunitiesList(res.data.filter(c => c.members.includes(user._id) || c.members.some(m => m._id === user._id)))
      setShowCommunityModal(true)
    } catch (err) {
      toast.error('Failed to load communities')
    }
  }

  const confirmShareToCommunity = async (communityId) => {
    setSharingCommunity(true)
    try {
      await API.post(`/community/${communityId}/share`, { noteId: note._id })
      toast.success('Note shared to community!')
      setShowCommunityModal(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to share note')
    } finally {
      setSharingCommunity(false)
    }
  }

  const handleSummarize = async () => {
    if (summary) {
      setShowSummary(!showSummary)
      return
    }

    setSummaryLoading(true)
    setShowSummary(true)
    try {
      const res = await API.get(`/notes/summarize/${id}`)
      setSummary(res.data.summary)
    } catch (err) {
      toast.error('Failed to generate summary')
      setShowSummary(false)
    } finally {
      setSummaryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4">
        <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading note...</p>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <FiArrowLeft className="text-2xl text-gray-500 dark:text-gray-600" />
        </div>
        <p className="text-gray-500 text-sm">
          Note not found.
          <Link to="/" className="text-violet-600 dark:text-violet-400 ml-2 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
            Go home
          </Link>
        </p>
      </div>
    )
  }

  const htmlContent = note?.content
  ? generateHTML(note.content, [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ])
  : '';

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="bg-white dark:bg-[#0c0c18]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-sm dark:shadow-2xl">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-gray-200 dark:border-white/5">
            <div className="flex-1">
              <Link
                to="/"
                className="text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
              >
                <FiArrowLeft size={16} /> Back to notes
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{note.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                  <FiClock size={14} />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                  <FiAlignLeft size={14} />
                  {note.plainText?.split(/\s+/).length || 0} words
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleSummarize}
                disabled={summaryLoading}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  showSummary && summary
                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-300'
                    : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-violet-500/10 border-gray-200 dark:border-white/5 hover:border-violet-500/30 text-gray-700 dark:text-gray-300'
                } disabled:opacity-50`}
              >
                <FiZap size={16} className={summaryLoading ? 'animate-pulse' : ''} />
                {summaryLoading ? 'Summarizing...' : showSummary && summary ? 'Hide Summary' : 'AI Summary'}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium transition-all border border-gray-200 dark:border-white/5 text-sm"
              >
                <FiShare2 size={16} /> Share Link
              </button>

              <button
                onClick={handleShareToCommunityClick}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium transition-all border border-violet-200 dark:border-violet-500/20 text-sm"
              >
                <FiUsers size={16} /> To Community
              </button>

              <Link
                to={`/edit/${note._id}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20 text-sm"
              >
                <FiEdit2 size={16} /> Edit
              </Link>

              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 text-gray-700 dark:hover:text-red-400 font-medium transition-all border border-gray-200 dark:border-white/5 text-sm"
              >
                <FiTrash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {/* AI Summary Panel */}
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-500/30 via-indigo-500/30 to-purple-500/30">
                  <div className="bg-gray-50 dark:bg-[#0c0c18]/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                          <FiZap className="text-violet-600 dark:text-violet-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Summary</h3>
                          <p className="text-xs text-gray-500">Generated by Gemini</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSummary(false)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                      >
                        <FiX size={14} />
                      </button>
                    </div>

                    {summaryLoading ? (
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-full animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-3/5 animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs rounded-full font-medium"
                >
                  <FiTag size={11} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-gray-200 via-transparent to-gray-200 dark:from-violet-500/10 dark:via-transparent dark:to-indigo-500/10">
            <div
              className="bg-white/80 dark:bg-[#0c0c18]/80 backdrop-blur-sm rounded-2xl p-8 tiptap-content shadow-sm dark:shadow-none"
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Share to Community Modal */}
      <AnimatePresence>
        {showCommunityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131320] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share to Community</h2>
                <button
                  onClick={() => setShowCommunityModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {communitiesList.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">You are not a member of any community yet.</p>
                ) : (
                  communitiesList.map(community => (
                    <div key={community._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-violet-500/30 transition-all">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{community.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{community.description}</p>
                      </div>
                      <button
                        onClick={() => confirmShareToCommunity(community._id)}
                        disabled={sharingCommunity}
                        className="px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-500/20 transition-all disabled:opacity-50"
                      >
                        Share
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  )
}

export default NoteDetail