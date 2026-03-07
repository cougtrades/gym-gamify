'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, User } from '@/lib/auth'
import { ArrowLeft, Calendar, Clock, Zap, Flame, Dumbbell } from 'lucide-react'

type WorkoutEntry = {
  id: string
  template_name: string
  duration_minutes: number
  completed_at: string
  points?: number
  sets?: Array<{ exercise_name: string; weight: number; reps: number }>
}

function getGuestHistory(): WorkoutEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('guest_workouts')
    if (!data) return []
    return JSON.parse(data).reverse()
  } catch {
    return []
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const TEMPLATE_ICONS: Record<string, string> = {
  Push: '🔥',
  Pull: '💪',
  Legs: '🦵',
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser?.is_guest) {
        setWorkouts(getGuestHistory())
      } else if (currentUser) {
        // Fetch from Supabase
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase
          .from('workouts')
          .select('id, template_name, duration_minutes, completed_at')
          .eq('user_id', currentUser.id)
          .order('completed_at', { ascending: false })
          .limit(50)

        setWorkouts(data || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  // Group workouts by date
  const grouped = workouts.reduce<Record<string, WorkoutEntry[]>>((acc, w) => {
    const dateKey = new Date(w.completed_at).toISOString().split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(w)
    return acc
  }, {})

  const totalWorkouts = workouts.length
  const totalMinutes = workouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0)

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <header className="flex items-center justify-between pt-4 pb-6">
          <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">History</h1>
          <div className="w-14" />
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-32" />
              </div>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-400 mb-1">No workouts yet</p>
            <p className="text-sm text-zinc-600">Complete your first workout to see it here</p>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-green-400 hover:text-green-300 font-medium"
            >
              Start a workout →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <Dumbbell className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{totalWorkouts}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Workouts</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Total time</p>
              </div>
            </div>

            {/* Workout list grouped by date */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateKey, dayWorkouts]) => (
                <div key={dateKey}>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
                    {formatDate(dayWorkouts[0].completed_at)}
                  </h3>
                  <div className="space-y-1.5">
                    {dayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5"
                      >
                        <div className="text-xl flex-shrink-0">
                          {TEMPLATE_ICONS[workout.template_name] || '🏋️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{workout.template_name}</p>
                          <p className="text-xs text-zinc-600">
                            {formatTime(workout.completed_at)}
                            {workout.duration_minutes > 0 && ` · ${workout.duration_minutes}m`}
                          </p>
                        </div>
                        {workout.points && (
                          <span className="text-xs font-semibold text-green-400">+{workout.points}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
