import workoutTemplates from '@/data/workout-templates.json'
import Link from 'next/link'
import { Zap, Flame, Trophy, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <header className="flex items-center justify-between pt-4 pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Gym Gamify</h1>
          </div>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Points</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">0</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">0</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Rank</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">—</div>
          </div>
        </div>

        {/* Workout section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1">
            Start a workout
          </h2>
          <div className="space-y-3">
            {workoutTemplates.templates.map((template) => {
              const config = {
                push: { gradient: 'from-orange-500/20 to-red-500/10', icon: '🔥' },
                pull: { gradient: 'from-blue-500/20 to-cyan-500/10', icon: '💪' },
                legs: { gradient: 'from-emerald-500/20 to-green-500/10', icon: '🦵' },
              }[template.id] || { gradient: 'from-zinc-500/20 to-zinc-500/10', icon: '🏋️' }
              
              return (
                <Link
                  key={template.id}
                  href={`/workout/${template.id}`}
                  className={`group relative flex items-center gap-4 bg-gradient-to-r ${config.gradient} bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all active:scale-[0.98]`}
                >
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
              )
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/leaderboard" className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-xs font-semibold">Leaderboard</p>
          </Link>
          <Link href="/history" className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
            <p className="text-xs font-semibold">History</p>
          </Link>
          <Link href="/feedback" className="group flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>
            <p className="text-xs font-semibold">Feedback</p>
          </Link>
        </div>
      </div>
    </main>
  )
}