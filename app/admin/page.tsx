'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAdminStats, getRecentSignups, getRecentWorkouts, AdminStats } from '@/lib/admin-stats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentSignups, setRecentSignups] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check (you can replace with env var later)
    if (password === 'gymgamify2026') {
      setAuthenticated(true)
      loadStats()
    } else {
      alert('Incorrect password')
    }
  }

  const loadStats = async () => {
    setLoading(true)
    const [statsData, signups, workouts] = await Promise.all([
      getAdminStats(),
      getRecentSignups(10),
      getRecentWorkouts(20)
    ])
    setStats(statsData)
    setRecentSignups(signups)
    setRecentWorkouts(workouts)
    setLoading(false)
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">🔒 Admin Access</h1>
            <p className="text-zinc-400 text-sm mb-6 text-center">
              Enter admin password to view dashboard
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Unlock Dashboard
              </Button>
            </form>
            <Link href="/" className="block text-center text-zinc-500 text-sm mt-4 hover:text-zinc-400">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading || !stats) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-zinc-400 py-12">Loading stats...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm">Real-time app metrics</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadStats} variant="outline" size="sm">
              🔄 Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">← Home</Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Daily Signups</p>
            <p className="text-4xl font-bold text-white">{stats.dailySignups}</p>
            <p className="text-zinc-500 text-xs mt-1">today</p>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Total Users</p>
            <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-zinc-500 text-xs mt-1">all time</p>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Active Users</p>
            <p className="text-4xl font-bold text-white">{stats.weeklyActiveUsers}</p>
            <p className="text-zinc-500 text-xs mt-1">last 7 days</p>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <p className="text-zinc-400 text-sm mb-1">Total Workouts</p>
            <p className="text-4xl font-bold text-white">{stats.totalWorkouts}</p>
            <p className="text-zinc-500 text-xs mt-1">all time</p>
          </div>
        </div>

        {/* MRR Card (placeholder for Stripe) */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm mb-1">Monthly Recurring Revenue</p>
              <p className="text-5xl font-bold text-white">${stats.mrr}</p>
              <p className="text-zinc-400 text-sm mt-2">
                💡 Stripe integration coming next
              </p>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Signups</h2>
            {recentSignups.length === 0 ? (
              <p className="text-zinc-500 text-sm">No signups yet</p>
            ) : (
              <div className="space-y-3">
                {recentSignups.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-3 bg-zinc-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-zinc-500 text-xs">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{user.points} pts</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Workouts */}
          <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>
            {recentWorkouts.length === 0 ? (
              <p className="text-zinc-500 text-sm">No workouts yet</p>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.slice(0, 10).map((workout: any) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-zinc-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{workout.users?.username || 'Unknown'}</p>
                      <p className="text-zinc-500 text-xs">{workout.template_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{workout.duration_minutes}m</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(workout.completed_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
