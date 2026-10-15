import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiClock, FiTag, FiDownload, FiShare2, FiAlignLeft } from 'react-icons/fi'
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

const SharedNote = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (user) {
      API.get(`/notes/shared/${id}`)
        .then((res) => setNote(res.data))
        .catch(() => toast.error('Note not found or you do not have permission'))
        .finally(() => setLoading(false))
    }
  }, [id, user])

  const handleDownload = async () => {
    if (!user) {
        navigate('/login')
        return
    }

    setDownloading(true)
    try {
      await API.post(`/notes/download/${id}`)
      toast.success('Note saved to your account!')
      navigate('/')
    } catch (err) {
      toast.error('Failed to download note')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4">
        <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading shared note...</p>
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
        className="max-w-4xl mx-auto"
      >
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="relative z-10 bg-white dark:bg-[#0c0c18]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-sm dark:shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-gray-200 dark:border-white/5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4 border border-violet-200 dark:border-violet-500/20">
                <FiShare2 size={14} /> Shared Note
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {note.title.replace(' (Shared)', '')}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
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
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {downloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FiDownload size={18} /> Save to My Vault</>
                )}
              </button>
            </div>
          </div>

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
    </ProtectedRoute>
  )
}

export default SharedNote
