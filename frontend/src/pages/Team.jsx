import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiLinkedin, FiUsers } from 'react-icons/fi'

const teamCategories = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'UI/UX, Frontend components, Text formatting',
    color: 'from-pink-500 to-rose-500',
    members: [
      { name: 'Raunak Rajput', url: 'https://www.linkedin.com/in/raunak-rajput-a60265297/' },
      { name: 'Divya Singh', url: 'https://www.linkedin.com/in/divya-singh-216985397/' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'APIs, database, authentication',
    color: 'from-emerald-500 to-teal-500',
    members: [
      { name: 'Rashika Agarwal', url: 'https://www.linkedin.com/in/rashika-agarwal-/' },
      { name: 'Deepanshu Sahu', url: 'https://www.linkedin.com/in/deepanshu-sahu-776741337/' }
    ]
  },
  {
    id: 'ai',
    title: 'AI & Infrastructure',
    description: 'Vector embeddings, RAG pipeline, AI integration and deployment',
    color: 'from-violet-500 to-indigo-500',
    members: [
      { name: 'Reeti Srivastava', url: 'https://www.linkedin.com/in/reeti-srivastava-569142229/' },
      { name: 'Akshat Chawla', url: 'https://www.linkedin.com/in/akshatchawla1307/' }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const Team = () => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 relative z-10 text-center"
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={16} /> Back to Home
          </Link>
        </div>
        
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-violet-100 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-indigo-500/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center shadow-xl dark:shadow-violet-500/20">
          <FiUsers className="text-violet-600 dark:text-violet-400 text-3xl" />
        </div>
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          MindVault Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Meet the brilliant minds behind MindVault. Our dedicated team works across various domains to bring you a seamless, AI-powered personal knowledge base.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
      >
        {teamCategories.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5 hover:from-gray-300 hover:to-gray-200 dark:hover:from-white/20 dark:hover:to-white/10 transition-all duration-500 shadow-sm hover:shadow-md dark:shadow-none"
          >
            <div className="bg-white dark:bg-[#0c0c18]/90 backdrop-blur-xl rounded-3xl h-full p-8 flex flex-col">
              <div className={`w-12 h-12 rounded-2xl mb-6 bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 flex-grow">{category.description}</p>
              
              <div className="space-y-3">
                {category.members.map((member, idx) => (
                  <a
                    key={idx}
                    href={member.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all group/link"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/link:text-gray-900 dark:group-hover/link:text-white transition-colors">
                      {member.name}
                    </span>
                    <FiLinkedin className="text-gray-400 dark:text-gray-500 group-hover/link:text-[#0a66c2] dark:group-hover/link:text-[#0a66c2] transition-colors" size={18} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Team
