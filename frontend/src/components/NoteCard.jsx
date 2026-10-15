import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiClock, FiTag, FiShare2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

const NoteCard = ({ note, onDelete }) => {
  // Truncate content for preview
  const preview = note.plainText?.length > 100 ? note.plainText.substring(0, 100) + '...' : note.plainText;

  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note._id)
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    const shareUrl = window.location.origin + '/shared/' + note._id
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white dark:bg-[#16162a] rounded-2xl p-5 border border-gray-200 dark:border-white/10 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-violet-500/10 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <Link to={`/note/${note._id}`} className="block h-full relative z-10 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-2">
            {note.title || 'Untitled'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
            {preview || 'No content'}
          </p>

          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-violet-500/10 border border-gray-200 dark:border-violet-500/20 text-gray-700 dark:text-violet-300 text-xs rounded-full font-medium"
                >
                  <FiTag size={10} />
                  {tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-600 self-center">+{note.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <FiClock size={12} />
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
              title="Share"
            >
              <FiShare2 size={14} />
            </button>
            <Link
              to={`/edit/${note._id}`}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-600 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
              title="Edit"
            >
              <FiEdit2 size={14} />
            </Link>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default NoteCard