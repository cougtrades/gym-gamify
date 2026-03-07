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
      className="relative w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-visible flex-shrink-0"
      whileTap={{ scale: 0.85 }}
      animate={{
        scale: completed ? [1, 1.3, 1.05, 1] : 1,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          backgroundColor: completed ? '#22c55e' : 'rgba(39, 39, 42, 0.8)',
        }}
        transition={{ duration: 0.2 }}
      />

      {completed && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-green-400"
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}

      <motion.div
        className="relative z-10"
        animate={{ scale: completed ? [0.5, 1.1, 1] : 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {completed ? (
          <motion.svg
            width="20"
            height="20"
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
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </motion.svg>
        ) : (
          <span className="text-zinc-500 text-sm font-mono">{setNumber}</span>
        )}
      </motion.div>
    </motion.button>
  )
}
