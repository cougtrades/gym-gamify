'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import workoutTemplates from '@/data/workout-templates.json'

type Exercise = {
  name: string
  default_sets: number
  default_reps: number
  sets?: Array<{ weight: number; reps: number; completed: boolean }>
}

export default function WorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string

  const template = workoutTemplates.templates.find((t) => t.id === workoutId)
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (template) {
      // Initialize exercises with empty sets
      const initialExercises = template.exercises.map((ex) => ({
        ...ex,
        sets: Array(ex.default_sets).fill(null).map(() => ({
          weight: 0,
          reps: ex.default_reps,
          completed: false
        }))
      }))
      setExercises(initialExercises)
      setStartTime(new Date())
    }
  }, [template])

  // Timer
  useEffect(() => {
    if (!startTime) return
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleSetComplete = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      updated[exerciseIdx].sets![setIdx].completed = !updated[exerciseIdx].sets![setIdx].completed
      return updated
    })
  }

  const updateSetValue = (exerciseIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      updated[exerciseIdx].sets![setIdx][field] = value
      
      // Auto-complete if both weight and reps are filled
      const set = updated[exerciseIdx].sets![setIdx]
      if (set.weight > 0 && set.reps > 0) {
        set.completed = true
      }
      
      return updated
    })
  }

  const completeWorkout = () => {
    // TODO: Save to Supabase
    alert(`Workout complete! Duration: ${formatTime(elapsedSeconds)}`)
    router.push('/')
  }

  if (!template) {
    return (
      <main className="min-h-screen bg-zinc-900 p-6 text-white">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <h1 className="text-3xl font-bold mb-4">Workout not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to home
          </Link>
        </div>
      </main>
    )
  }

  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)
  const completedSets = exercises.reduce(
    (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length || 0),
    0
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-zinc-400 hover:text-white">
            ← Back
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{template.name}</h1>
            <p className="text-zinc-400 text-sm">{template.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono font-bold text-white">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-zinc-500 text-xs">
              {completedSets}/{totalSets} sets
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          {exercises.map((exercise, exerciseIdx) => (
            <div
              key={exerciseIdx}
              className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-5"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {exercise.name}
              </h3>

              <div className="space-y-2">
                {exercise.sets?.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      set.completed
                        ? 'bg-green-500/20 border-2 border-green-500/50'
                        : 'bg-zinc-700/30 border-2 border-zinc-600/50'
                    }`}
                  >
                    <div className="text-zinc-400 font-mono text-sm w-8">
                      {setIdx + 1}
                    </div>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'weight', parseInt(e.target.value) || 0)
                        }
                        placeholder="lbs"
                        className="w-20 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-center"
                      />
                      <span className="text-zinc-500 self-center">×</span>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                        }
                        placeholder="reps"
                        className="w-20 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-center"
                      />
                    </div>

                    <div
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        set.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-zinc-700/50 text-zinc-500'
                      }`}
                    >
                      {set.completed ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button (fixed at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={completeWorkout}
              disabled={completedSets === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all disabled:cursor-not-allowed"
            >
              Complete Workout (+10 pts)
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
