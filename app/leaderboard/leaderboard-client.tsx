'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLeaderboard, getUserRank, LeaderboardEntry } from '@/lib/leaderboard'
import { getCurrentUser, User } from '@/lib/auth'
import { ArrowLeft, Crown, Flame } from 'lucide-react'

export function LeaderboardClient({ initialLeaderboard }: { initialLeaderboard: LeaderboardEntry[] }) {
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const [user, setUser] = useState<User | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

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

  useEffect(() => {
    if (showPremiumOnly) {
      getLeaderboard(100, true).then(setLeaderboard)
    } else {
      setLeaderboard(initialLeaderboard)
    }
  }, [showPremiumOnly, initialLeaderboard])

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between pt-4 pb-6">
          <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Leaderboard</h1>
          <div className="w-14" />
        </header>

        {/* Premium toggle */}
        {user?.is_premium && (
          <div className="flex gap-2 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5">
            <button
              onClick={() => setShowPremiumOnly(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                !showPremiumOnly ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setShowPremiumOnly(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                showPremiumOnly ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> Premium
            </button>
          </div>
        )}

        {/* User rank card */}
        {user && !user.is_guest && userRank && (
          <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Your rank</p>
              <p className="text-2xl font-bold mt-0.5">
                {getMedal(userRank) || `#${userRank}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Points</p>
              <p className="text-2xl font-bold mt-0.5">{user.points}</p>
            </div>
          </div>
        )}

        {/* Guest banner */}
        {user?.is_guest && (
          <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-zinc-400">Sign up to appear on the leaderboard</p>
          </div>
        )}

        {/* Entries */}
        {leaderboard.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">
            <p className="text-base mb-1">No entries yet</p>
            <p className="text-sm">Complete a workout to get on the board</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.id
              const medal = getMedal(entry.rank)
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-zinc-900 border border-zinc-800/50'
                  }`}
                >
                  <div className="w-9 text-center flex-shrink-0">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-sm font-bold text-zinc-500">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold flex items-center gap-1.5 truncate">
                      {entry.username}
                      {entry.is_premium && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      {isCurrentUser && <span className="text-[10px] text-blue-400 font-normal">(you)</span>}
                    </p>
                    {entry.streak_count > 0 && (
                      <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {entry.streak_count}d streak
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold tabular-nums">{entry.points.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600">pts</p>
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
