'use client'

import { motion } from 'framer-motion'

interface AnimatedSetCheckboxProps {
  completed: boolean
  onToggle: () => void
  setNumber: number
}

export function AnimatedSetCheckbox({ completed, onToggle, setNumber }: AnimatedSetCheckboxProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg overflow-visible"
      whileTap={{ scale: 0.85 }}
      animate={{
        scale: completed ? [1, 1.5, 1.1, 1] : 1,
        rotate: completed ? [0, -10, 10, 0] : 0,
      }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
      }}
    >
      {/* Background - animates from center */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          backgroundColor: completed ? '#22c55e' : 'rgba(63, 63, 70, 0.5)',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Pulse ring on completion */}
      {completed && (
        <motion.div
          className="absolute inset-0 rounded-xl border-4 border-green-400"
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Inner content */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: completed ? [0.5, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {completed ? (
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </motion.svg>
        ) : (
          <span className="text-zinc-400 text-lg font-mono">{setNumber}</span>
        )}
      </motion.div>

      {/* Glow effect when completed */}
      {completed && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-green-500/50 blur-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.5, 1.5] }}
          transition={{ duration: 0.8 }}
        />
      )}
    </motion.button>
  )
}
