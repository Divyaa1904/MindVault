import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const WelcomeSplash = ({ firstName, onComplete }) => {
  const [phase, setPhase] = useState('enter') // 'enter' | 'hold' | 'exit'

  useEffect(() => {
    // Hold for 2 seconds, then start exit
    const holdTimer = setTimeout(() => {
      setPhase('exit')
    }, 3200)

    // Fully done after exit animation
    const doneTimer = setTimeout(() => {
      onComplete()
    }, 4000)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Ambient glow behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Card container */}
      <motion.div
        className="relative bg-white dark:bg-[#0f0f1a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-2xl overflow-hidden max-w-lg w-full mx-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      >
        <motion.p
          className="text-gray-500 font-medium tracking-widest uppercase text-base sm:text-lg mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Hi, {firstName} ❤️
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          Welcome To Your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            Knowledge Base
          </span>
        </motion.h1>

        {/* Subtle loading bar */}
        <motion.div
          className="mt-10 mx-auto h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 3, ease: 'easeInOut', delay: 0.6 }}
        />
      </motion.div>
    </motion.div>
  )
}

export default WelcomeSplash
