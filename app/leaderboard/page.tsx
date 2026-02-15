'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLeaderboard, getUserRank, LeaderboardEntry } from '@/lib/leaderboard'
import { getCurrentUser, User } from '@/lib/auth'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  useEffect(() => {
    load()
  }, [showPremiumOnly])

  async function load() {
    const [currentUser, leaders] = await Promise.all([
      getCurrentUser(),
      getLeaderboard(100, showPremiumOnly)
    ])

      setUser(currentUser)
      setLeaderboard(leaders)

      if (currentUser && !currentUser.is_guest) {
        const rank = await getUserRank(currentUser.id)
        setUserRank(rank)
      }

      setLoading(false)
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">🏆 Leaderboard</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Toggle Premium Leaderboard */}
        {user?.is_premium && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setShowPremiumOnly(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                !showPremiumOnly
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setShowPremiumOnly(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                showPremiumOnly
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              💎 Premium Only
            </button>
          </div>
        )}

        {/* User's rank card (if authenticated) */}
        {user && !user.is_guest && userRank && (
          <div className="mb-6 bg-blue-500/10 border-2 border-blue-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Your Rank</p>
                <p className="text-white text-2xl font-bold">
                  {getMedalEmoji(userRank)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 text-sm">Points</p>
                <p className="text-white text-2xl font-bold">{user.points}</p>
              </div>
            </div>
          </div>
        )}

        {/* Guest mode banner */}
        {user?.is_guest && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>Sign up to compete</strong> - Guest mode doesn't show on the leaderboard
            </p>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-xl mb-2">No one on the leaderboard yet</p>
            <p className="text-sm">Be the first to complete a workout!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.id
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-blue-500/20 border-2 border-blue-500/50'
                      : 'bg-zinc-800/50 border border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-white w-12 text-center">
                      {getMedalEmoji(entry.rank)}
                    </div>
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {entry.username}
                        {entry.is_premium && <span className="text-lg">💎</span>}
                        {isCurrentUser && (
                          <span className="text-xs text-blue-400">(You)</span>
                        )}
                      </p>
                      {entry.streak_count > 0 && (
                        <p className="text-zinc-500 text-sm">
                          🔥 {entry.streak_count} day streak
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-xl font-bold">{entry.points}</p>
                    <p className="text-zinc-500 text-xs">points</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
