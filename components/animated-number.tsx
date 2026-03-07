'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isInitial, setIsInitial] = useState(true)

  useEffect(() => {
    if (isInitial) {
      // First load - show value immediately, no animation
      setDisplayValue(value)
      setIsInitial(false)
    } else {
      // Subsequent changes - animate to new value
      animateToValue(value)
    }
  }, [value])

  const animateToValue = (target: number) => {
    const start = displayValue
    const diff = target - start
    const duration = 800
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const current = Math.round(start + diff * easeOut)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {displayValue}
    </motion.span>
  )
}
