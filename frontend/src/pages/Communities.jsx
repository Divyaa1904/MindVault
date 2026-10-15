import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiUsers, FiPlus, FiX } from 'react-icons/fi'

const Communities = () => {
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  const fetchCommunities = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/community?search=${search}`)
      setCommunities(res.data)
    } catch (err) {
      toast.error('Failed to load communities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCommunities()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await API.post('/community', newCommunity)
      toast.success('Community created!')
      setShowModal(false)
      setNewCommunity({ name: '', description: '' })
      fetchCommunities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create community')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (id) => {
    try {
      await API.post(`/community/${id}/join`)
      toast.success('Joined community')
      fetchCommunities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join')
    }
  }

  const handleLeave = async (id) => {
    try {
      await API.post(`/community/${id}/leave`)
      toast.success('Left community')
      fetchCommunities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to leave')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Communities</h1>
          <p className="text-gray-500">Discover and join communities to share knowledge.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-lg shadow-violet-500/20"
        >
          <FiPlus size={18} /> Create Community
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#131320]/80 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-[#131320]/50 rounded-3xl border border-gray-200 dark:border-white/5">
          <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500">No communities found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {communities.map((community, idx) => {
              const isMember = community.members.includes(user._id)
              return (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white dark:bg-[#131320]/80 border border-gray-200 dark:border-white/10 rounded-3xl p-6 hover:border-violet-500/30 transition-all shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-violet-500/10 flex flex-col"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      <Link to={`/community/${community._id}`}>{community.name}</Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{community.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiUsers size={16} className="text-gray-400" />
                      <span>{community.members.length} members</span>
                    </div>
                    
                    {isMember ? (
                      <button
                        onClick={() => handleLeave(community._id)}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/20 transition-all"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(community._id)}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-500/20 transition-all"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#131320] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Community</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Community Name</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={newCommunity.name}
                    onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    value={newCommunity.description}
                    onChange={e => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Community'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Communities
