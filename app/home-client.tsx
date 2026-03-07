'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCurrentUser, User } from '@/lib/auth'
import { getUserRank } from '@/lib/leaderboard'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { AnimatedNumber } from '@/components/animated-number'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { Flame, Trophy, Zap, ChevronRight, MessageSquarePlus, Crown, Sparkles, History } from 'lucide-react'
import { getSuggestedWorkout, getLastWorkoutTemplate, getMotivationalMessage } from '@/lib/daily-suggestion'

type Template = {
  id: string
  name: string
  description: string
  exercises: Array<{ name: string; default_sets: number; default_reps: number }>
}

const TEMPLATE_CONFIG: Record<string, { gradient: string; icon: string; accent: string }> = {
  push: { gradient: 'from-orange-500/20 to-red-500/10', icon: '🔥', accent: 'text-orange-400' },
  pull: { gradient: 'from-blue-500/20 to-cyan-500/10', icon: '💪', accent: 'text-blue-400' },
  legs: { gradient: 'from-emerald-500/20 to-green-500/10', icon: '🦵', accent: 'text-emerald-400' },
}

function StatSkeleton() {
  return <div className="h-8 w-12 animate-pulse rounded bg-white/5" />
}

export function HomeClient({ templates }: { templates: Template[] }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  // Suggested workout - must be declared before any early returns
  const [suggestedId, setSuggestedId] = useState<string>('push')
  const [motivationalMsg, setMotivationalMsg] = useState<string>('')

  useEffect(() => {
    // Show cached data instantly
    try {
      const cached = localStorage.getItem('cached_user_data')
      if (cached) {
        const parsed = JSON.parse(cached)
        setUser(parsed)
        setIsLoading(false)
        const cachedRank = localStorage.getItem('cached_user_rank')
        if (cachedRank) setUserRank(parseInt(cachedRank))
      }
    } catch { /* ignore */ }

    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        localStorage.setItem('cached_user_data', JSON.stringify(currentUser))
      }

      if (currentUser && !currentUser.is_guest) {
        const rank = await getUserRank(currentUser.id)
        setUserRank(rank)
        if (rank) localStorage.setItem('cached_user_rank', rank.toString())
      }

      const hasSeenOnboarding = localStorage.getItem('has-seen-onboarding')
      if (!hasSeenOnboarding && (!currentUser || currentUser.is_guest)) {
        setShowOnboarding(true)
      }

      setIsLoading(false)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const lastTemplate = getLastWorkoutTemplate()
    setSuggestedId(getSuggestedWorkout(lastTemplate || undefined))
    if (user) {
      setMotivationalMsg(getMotivationalMessage(user.streak_count || 0, user.points || 0))
    }
  }, [user])

  const handleOnboardingComplete = () => {
    localStorage.setItem('has-seen-onboarding', 'true')
    setShowOnboarding(false)
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Top bar */}
        <header className="flex items-center justify-between pt-4 pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Gym Gamify
            </h1>
            {user && !user.is_guest && user.username && (
              <p className="text-sm text-zinc-500">@{user.username}</p>
            )}
          </div>
          {user?.is_guest ? (
            <Button
              onClick={() => setAuthModalOpen(true)}
              size="sm"
              className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs px-4"
            >
              Sign up
            </Button>
          ) : user?.is_premium ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
              <Crown className="w-3.5 h-3.5" />
              PRO
            </span>
          ) : null}
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Points</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {isLoading ? <StatSkeleton /> : <AnimatedNumber value={user?.points || 0} />}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {isLoading ? <StatSkeleton /> : <AnimatedNumber value={user?.streak_count || 0} />}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Rank</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {isLoading ? (
                <StatSkeleton />
              ) : user?.is_guest ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  —
                </button>
              ) : userRank ? (
                <>#{userRank}</>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Motivational message */}
        {motivationalMsg && !isLoading && (
          <div className="mb-6 px-1">
            <p className="text-sm text-zinc-500">{motivationalMsg}</p>
          </div>
        )}

        {/* Workout section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1">
            Start a workout
          </h2>
          <div className="space-y-3">
            {templates.map((template, i) => {
              const config = TEMPLATE_CONFIG[template.id] || TEMPLATE_CONFIG.push
              const isSuggested = template.id === suggestedId
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={`/workout/${template.id}`}
                    prefetch={true}
                    className={`group relative flex items-center gap-4 bg-gradient-to-r ${config.gradient} bg-zinc-900 border rounded-2xl p-5 hover:border-zinc-700 transition-all active:scale-[0.98] ${
                      isSuggested ? 'border-green-500/30' : 'border-zinc-800'
                    }`}
                  >
                    {isSuggested && (
                      <span className="absolute -top-2.5 right-4 flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Up next
                      </span>
                    )}
                    <div className="text-3xl flex-shrink-0">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold">{template.name}</h3>
                      <p className="text-sm text-zinc-500">{template.description}</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {template.exercises.length} exercises · {template.exercises.reduce((a, e) => a + e.default_sets, 0)} sets
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Premium CTA */}
        {user && !user.is_guest && !user.is_premium && (
          <Link
            href="/premium"
            className="group flex items-center gap-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-4 mb-6 hover:border-violet-500/40 transition-all"
          >
            <Crown className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-300">Unlock Premium</p>
              <p className="text-xs text-zinc-500">Custom workouts, exclusive leaderboard, history</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
          </Link>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link
            href="/leaderboard"
            className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all active:scale-[0.98]"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-xs font-semibold">Leaderboard</p>
          </Link>
          <Link
            href="/history"
            className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all active:scale-[0.98]"
          >
            <History className="w-5 h-5 text-emerald-400" />
            <p className="text-xs font-semibold">History</p>
          </Link>
          <Link
            href="/feedback"
            className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-5 h-5 text-blue-400" />
            <p className="text-xs font-semibold">Feedback</p>
          </Link>
        </div>

        {/* Guest banner */}
        {user?.is_guest && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-400 text-center mb-3">
              <span className="text-zinc-300 font-medium">Guest mode</span> — sign up to save progress and compete
            </p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
            >
              Create free account
            </Button>
          </div>
        )}

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </main>
  )
}
