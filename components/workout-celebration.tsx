'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface WorkoutCelebrationProps {
  isOpen: boolean
  points: number
  duration: string
  allSetsComplete: boolean
  onClose: () => void
}

export function WorkoutCelebration({ 
  isOpen, 
  points, 
  duration, 
  allSetsComplete,
  onClose 
}: WorkoutCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([])

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setConfetti(newConfetti)

      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{ 
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: -20,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{ 
                y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000, 
                rotate: Math.random() * 720 - 360,
                opacity: 0,
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                ease: 'linear',
                delay: Math.random() * 0.5,
              }}
            />
          ))}

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-green-500/50 rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl shadow-green-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Workout Complete!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400 mb-6"
            >
              {duration}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-4"
            >
              <div className="text-5xl font-bold text-white mb-1">
                +{points}
              </div>
              <div className="text-green-100 font-medium">points earned</div>
            </motion.div>

            {allSetsComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 mb-4"
              >
                <span className="text-yellow-400 font-bold">🔥 All Sets Bonus!</span>
                <span className="text-yellow-300 text-sm ml-2">+20 pts</span>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-zinc-500 text-sm"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
