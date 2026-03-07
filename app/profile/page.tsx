'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut, User } from '@/lib/auth'
import { ArrowLeft, LogOut, Crown, Flame, Zap, Trophy, ExternalLink } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await signOut()
    localStorage.removeItem('cached_user_data')
    localStorage.removeItem('cached_user_rank')
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-zinc-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <header className="flex items-center justify-between pt-4 pb-6">
          <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Profile</h1>
          <div className="w-14" />
        </header>

        {user && !user.is_guest ? (
          <>
            {/* User info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <h2 className="text-xl font-bold">@{user.username}</h2>
              <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
              {user.is_premium && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mt-2">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{user.points}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Points</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{user.streak_count}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Streak</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <Trophy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold">—</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Rank</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {!user.is_premium && (
                <Link
                  href="/premium"
                  className="flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-4 hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-violet-400" />
                    <span className="text-sm font-semibold text-violet-300">Upgrade to Premium</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600" />
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-700 transition-all"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-red-400">Sign out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <p className="text-zinc-400 mb-4">You&apos;re in guest mode</p>
            <Link
              href="/"
              className="inline-block bg-white text-zinc-950 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 transition-colors"
            >
              Sign up to save progress
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
