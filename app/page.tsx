'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import workoutTemplates from '@/data/workout-templates.json'
import { getCurrentUser, User } from '@/lib/auth'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
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

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{user?.points || 0}</div>
            <div className="text-zinc-500 text-sm mt-1">Points</div>
          </div>
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{user?.streak_count || 0}</div>
            <div className="text-zinc-500 text-sm mt-1">Streak</div>
          </div>
          <div className="bg-zinc-800/30 backdrop-blur border border-zinc-700/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">#-</div>
            <div className="text-zinc-500 text-sm mt-1">Rank</div>
          </div>
        </div>

        {/* Guest mode indicator */}
        {user?.is_guest && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-blue-300 text-sm">
              🎮 <strong>Guest Mode</strong> - Your progress is saved locally. Sign up to compete on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
