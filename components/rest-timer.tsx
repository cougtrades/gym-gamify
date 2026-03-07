'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'

interface RestTimerProps {
  isOpen: boolean
  onClose: () => void
  defaultSeconds?: number
}

export function RestTimer({ isOpen, onClose, defaultSeconds = 90 }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setRemaining(totalSeconds)
      setIsRunning(true)
    }
  }, [isOpen, totalSeconds])

  // Countdown
  useEffect(() => {
    if (!isRunning || !isOpen) return
    if (remaining <= 0) {
      setIsRunning(false)
      // Vibrate if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
      return
    }
    const interval = setInterval(() => {
      setRemaining((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, remaining, isOpen])

  const adjustTime = useCallback((delta: number) => {
    setTotalSeconds((prev) => Math.max(15, Math.min(300, prev + delta)))
    setRemaining((prev) => Math.max(0, prev + delta))
  }, [])

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-0 right-0 z-50 px-4"
        >
          <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Rest Timer</span>
              <button onClick={onClose} className="p-1 text-zinc-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timer display */}
            <div className="text-center mb-3">
              <span className={`text-4xl font-bold font-mono tabular-nums ${
                remaining === 0 ? 'text-green-400' : 'text-white'
              }`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              {remaining === 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-400 mt-1 font-medium"
                >
                  Go! Next set
                </motion.p>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustTime(-15)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Minus className="w-3 h-3" /> 15s
              </button>
              <button
                onClick={() => {
                  if (remaining === 0) {
                    setRemaining(totalSeconds)
                    setIsRunning(true)
                  } else {
                    setIsRunning(!isRunning)
                  }
                }}
                className="px-5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors"
              >
                {remaining === 0 ? 'Restart' : isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => adjustTime(15)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> 15s
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
