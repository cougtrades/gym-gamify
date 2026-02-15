'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import workoutTemplates from '@/data/workout-templates.json'
import { getCurrentUser, User } from '@/lib/auth'
import { getUserRank } from '@/lib/leaderboard'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && !currentUser.is_guest) {
        const rank = await getUserRank(currentUser.id)
        setUserRank(rank)
      }
    }
    loadUser()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            💪 Gym Gamify
          </h1>
          <p className="text-zinc-400 text-lg">
            Pick your workout and start earning points
          </p>
          {user?.is_guest && (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="mt-4"
              variant="outline"
            >
              Sign up to compete 🏆
            </Button>
          )}
        </div>

        {/* Workout Templates */}
        <div className="space-y-4">
          {workoutTemplates.templates.map((template) => (
            <Link
              key={template.id}
              href={`/workout/${template.id}`}
              className="block bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {template.name}
                  </h2>
                  <p className="text-zinc-400">{template.description}</p>
                  <p className="text-zinc-500 text-sm mt-2">
                    {template.exercises.length} exercises
                  </p>
                </div>
                <div className="text-4xl">
                  {template.id === 'push' && '🔥'}
                  {template.id === 'pull' && '💪'}
                  {template.id === 'legs' && '🦵'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link
            href="/leaderboard"
            className="block bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center hover:border-yellow-500/50 transition-all"
          >
            <p className="text-yellow-300 font-bold">🏆 Leaderboard</p>
            <p className="text-zinc-400 text-xs mt-1">See rankings</p>
          </Link>
          <Link
            href="/feedback"
            className="block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 text-center hover:border-blue-500/50 transition-all"
          >
            <p className="text-blue-300 font-bold">💡 Feedback</p>
            <p className="text-zinc-400 text-xs mt-1">Request features</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{user?.points || 0}</div>
            <div className="text-zinc-500 text-sm mt-1">Points</div>
          </div>
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{user?.streak_count || 0}</div>
            <div className="text-zinc-500 text-sm mt-1">Streak</div>
          </div>
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {user?.is_guest ? '#-' : userRank ? `#${userRank}` : '#-'}
            </div>
            <div className="text-zinc-500 text-sm mt-1">Rank</div>
          </div>
        </div>

        {/* Guest mode indicator */}
        {user?.is_guest && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm text-center mb-3">
              🎮 <strong>Guest Mode</strong> - Your progress is saved locally. Sign up to compete on the leaderboard!
            </p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="w-full"
              variant="default"
            >
              Create account
            </Button>
          </div>
        )}

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </main>
  )
}
