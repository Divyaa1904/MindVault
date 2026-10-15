import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API from '../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUsers, FiFileText, FiClock } from 'react-icons/fi'

const CommunityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [knowledgeList, setKnowledgeList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [commRes, notesRes] = await Promise.all([
        API.get(`/community/${id}`),
        API.get(`/community/${id}/notes`)
      ])
      setCommunity(commRes.data)
      setKnowledgeList(notesRes.data)
    } catch (err) {
      toast.error('Failed to load community details')
      navigate('/communities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [id, user])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    )
  }

  if (!community) return null

  const isMember = community.members.some(m => m._id === user._id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto relative z-10 space-y-8"
    >
      <Link
        to="/communities"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Communities
      </Link>

      <div className="bg-white dark:bg-[#131320]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{community.name}</h1>
          <div className="flex items-center gap-2 text-gray-500 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl">
            <FiUsers size={18} />
            <span className="font-semibold">{community.members.length}</span> Members
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{community.description}</p>
        
        <div className="text-sm text-gray-500">
          Created by <span className="font-medium text-gray-900 dark:text-gray-200">{community.creator.firstName} {community.creator.lastName}</span>
        </div>
      </div>

      {!isMember && (
        <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 text-center">
          <p className="text-violet-700 dark:text-violet-300 mb-4 font-medium">Join this community to share notes and view members.</p>
          <button 
            onClick={async () => {
              try {
                await API.post(`/community/${id}/join`);
                toast.success('Joined successfully');
                fetchData();
              } catch (err) {
                toast.error('Failed to join');
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20"
          >
            Join Community
          </button>
        </div>
      )}

      {isMember && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiFileText /> Community Knowledge
            </h2>
            
            {knowledgeList.length === 0 ? (
              <div className="bg-white dark:bg-[#131320]/80 border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center text-gray-500">
                No knowledge shared yet. Be the first to share a note!
              </div>
            ) : (
              <div className="space-y-4">
                {knowledgeList.map(item => (
                  <Link
                    key={item._id}
                    to={`/shared/${item.note._id}`}
                    className="block bg-white dark:bg-[#131320]/80 border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all hover:shadow-lg dark:hover:shadow-violet-500/5 group"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {item.note.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.note.plainText}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Shared by {item.sharedBy.firstName} {item.sharedBy.lastName}</span>
                      <span className="flex items-center gap-1"><FiClock /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUsers /> Members
            </h2>
            <div className="bg-white dark:bg-[#131320]/80 border border-gray-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
              {community.members.map(member => (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {member.firstName.charAt(0)}{member.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member._id === community.creator._id ? 'Creator' : 'Member'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default CommunityDetail
