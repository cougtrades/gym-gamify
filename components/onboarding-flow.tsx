'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from './auth-modal'

interface OnboardingScreen {
  id: number
  headline: string
  description: string
  mockup: 'workout' | 'stats' | 'leaderboard' | 'premium'
}

const screens: OnboardingScreen[] = [
  {
    id: 1,
    headline: 'Track every rep',
    description: 'Log sets, weights, and reps with satisfying completion animations.',
    mockup: 'workout',
  },
  {
    id: 2,
    headline: 'Build your streak',
    description: 'Stay consistent and watch your points grow. Daily workouts = gains.',
    mockup: 'stats',
  },
  {
    id: 3,
    headline: 'Compete with friends',
    description: 'Climb the leaderboard. Bragging rights for top performers.',
    mockup: 'leaderboard',
  },
  {
    id: 4,
    headline: 'Go Premium',
    description: 'Custom workouts, exclusive leaderboards, and more.',
    mockup: 'premium',
  },
]

function PhoneMockup({ type }: { type: string }) {
  return (
    <div className="relative w-[200px] h-[360px] sm:w-[220px] sm:h-[400px] md:w-[240px] md:h-[420px] bg-zinc-900 rounded-[28px] border-[3px] border-zinc-700 overflow-hidden shadow-2xl mx-auto flex-shrink-0">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 bg-zinc-800 rounded-b-2xl z-20" />
      
      {/* Screen Content */}
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 pt-5 sm:pt-6 overflow-hidden">
        {type === 'workout' && (
          <div className="p-2.5 sm:p-3 space-y-2">
            <div className="text-center text-white font-bold text-sm sm:text-base mb-2">Push Day</div>
            <div className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
              <div className="text-white text-xs font-medium mb-1">Bench Press</div>
              <div className="flex gap-1.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center text-white text-[10px]">✓</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center text-white text-[10px]">✓</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-md flex items-center justify-center text-white text-[10px]">✓</div>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
              <div className="text-white text-xs font-medium mb-1">Overhead Press</div>
              <div className="flex gap-1.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 text-[10px]">1</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 text-[10px]">2</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400 text-[10px]">3</div>
              </div>
            </div>
            <div className="mt-3 bg-green-500 rounded-lg p-2 text-center">
              <span className="text-white font-bold text-xs">Complete</span>
            </div>
          </div>
        )}

        {type === 'stats' && (
          <div className="p-2.5 sm:p-3">
            <div className="text-center text-white font-bold text-sm sm:text-base mb-3">Your Stats</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-zinc-800/50 rounded-lg p-2 sm:p-2.5 text-center border border-zinc-700">
                <div className="text-xl sm:text-2xl font-bold text-white">240</div>
                <div className="text-zinc-500 text-[10px] mt-0.5">Points</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-2 sm:p-2.5 text-center border border-zinc-700">
                <div className="text-xl sm:text-2xl font-bold text-orange-400">🔥5</div>
                <div className="text-zinc-500 text-[10px] mt-0.5">Streak</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-2.5 sm:p-3 border border-orange-500/30">
              <div className="text-orange-300 text-xs font-medium mb-1">Weekly Goal</div>
              <div className="w-full bg-zinc-700 rounded-full h-1.5 mb-1">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '80%' }} />
              </div>
              <div className="text-zinc-400 text-[10px]">4 of 5 workouts</div>
            </div>
          </div>
        )}

        {type === 'leaderboard' && (
          <div className="p-2.5 sm:p-3">
            <div className="text-center text-white font-bold text-sm sm:text-base mb-2">Leaderboard</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 bg-yellow-500/20 rounded-lg p-2 border border-yellow-500/30">
                <span className="text-yellow-400 text-base">🥇</span>
                <span className="text-white flex-1 text-xs">Alex</span>
                <span className="text-yellow-400 font-bold text-xs">450</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
                <span className="text-zinc-400 text-base">🥈</span>
                <span className="text-white flex-1 text-xs">Sarah</span>
                <span className="text-white font-bold text-xs">380</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
                <span className="text-orange-400 text-base">🥉</span>
                <span className="text-white flex-1 text-xs">You</span>
                <span className="text-orange-400 font-bold text-xs">240</span>
              </div>
            </div>
          </div>
        )}

        {type === 'premium' && (
          <div className="p-2.5 sm:p-3">
            <div className="text-center text-white font-bold text-sm sm:text-base mb-2">Premium</div>
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg p-2.5 sm:p-3 border border-purple-500/30 mb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-lg">💎</span>
                <span className="text-purple-300 font-bold text-xs">Premium</span>
              </div>
              <ul className="space-y-1 text-xs text-zinc-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-green-400">✓</span> Custom workouts
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-400">✓</span> Exclusive LB
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-400">✓</span> History
                </li>
              </ul>
            </div>
            <div className="bg-blue-500 rounded-lg p-2 text-center">
              <span className="text-white font-bold text-xs">$7/month</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [direction, setDirection] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setDirection(1)
      setCurrentScreen((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentScreen > 0) {
      setDirection(-1)
      setCurrentScreen((prev) => prev - 1)
    }
  }

  const screen = screens[currentScreen]
  const isLastScreen = currentScreen === screens.length - 1

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (distance > minSwipeDistance && currentScreen < screens.length - 1) {
      // Swipe left - go next
      handleNext()
    } else if (distance < -minSwipeDistance && currentScreen > 0) {
      // Swipe right - go prev
      handlePrev()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div 
      className="fixed inset-0 bg-zinc-950 z-50 flex flex-col overflow-hidden h-[100dvh]"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

      {/* Skip button */}
      <div className="relative z-20 flex justify-end p-3 sm:p-4">
        <button
          onClick={onComplete}
          className="text-zinc-500 hover:text-white transition-colors text-xs sm:text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Main content - flex column that distributes space */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">💪 Gym Gamify</h1>
        </div>

        {/* Middle section - takes available space, centered */}
        <div 
          className="flex-1 flex items-center justify-center relative px-4 min-h-0 touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left click area */}
          {currentScreen > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex items-center justify-center hover:bg-white/5 transition-colors"
              aria-label="Previous"
            >
              <span className="text-zinc-500 text-xl">‹</span>
            </button>
          )}

          {/* Right click area */}
          {!isLastScreen && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex items-center justify-center hover:bg-white/5 transition-colors"
              aria-label="Next"
            >
              <span className="text-zinc-500 text-xl">›</span>
            </button>
          )}

          {/* Content - uses available space */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentScreen}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center w-full"
              >
                {/* Phone mockup - scales to fit */}
                <div className="flex-shrink-0">
                  <PhoneMockup type={screen.mockup} />
                </div>

                {/* Headline */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mt-3 sm:mt-4 mb-1">
                  {screen.headline}
                </h2>

                {/* Description */}
                <p className="text-zinc-400 text-center text-xs sm:text-sm max-w-[260px] px-2 leading-relaxed">
                  {screen.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom section - fixed height, always visible */}
        <div className="flex-shrink-0 pb-4 sm:pb-6 pt-2 px-4 sm:px-6">
          {/* Pagination dots */}
          <div className="flex justify-center gap-1.5 mb-3 sm:mb-4">
            {screens.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentScreen ? 1 : -1)
                  setCurrentScreen(index)
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentScreen
                    ? 'w-4 sm:w-5 bg-green-500'
                    : 'w-1.5 sm:w-2 bg-zinc-600 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-1.5 sm:space-y-2 max-w-[240px] sm:max-w-xs mx-auto">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition-all"
            >
              Join for free
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full text-green-400 hover:text-green-300 font-medium py-1.5 sm:py-2 transition-colors text-xs sm:text-sm"
            >
              Log in
            </button>
          </div>

          {/* Tap indicator */}
          <p className="text-center text-zinc-600 text-[10px] sm:text-xs mt-2">
            Tap sides to navigate
          </p>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
