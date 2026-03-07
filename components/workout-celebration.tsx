'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Flame, Zap, Trophy } from 'lucide-react'

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
  onClose,
}: WorkoutCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; size: number }>>([])

  useEffect(() => {
    if (isOpen) {
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      setConfetti(
        Array.from({ length: 40 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 8,
        }))
      )

      const timer = setTimeout(onClose, 5000)
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                backgroundColor: p.color,
                left: `${p.x}%`,
                top: -20,
                width: p.size,
                height: p.size,
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

          {/* Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center max-w-xs mx-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-3"
            >
              {allSetsComplete ? '💯' : '✅'}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-bold text-white mb-1"
            >
              Workout Done
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-zinc-500 mb-5"
            >
              {duration}
            </motion.p>

            {/* Points earned */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 180 }}
              className="bg-green-500/15 border border-green-500/20 rounded-2xl p-5 mb-4"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-white">+{points}</span>
              </div>
              <p className="text-sm text-green-400/80 font-medium">points earned</p>
            </motion.div>

            {/* Bonus */}
            {allSetsComplete && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-4"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">All sets bonus +20</span>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-zinc-600"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
