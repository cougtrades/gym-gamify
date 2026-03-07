'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import workoutTemplates from '@/data/workout-templates.json'
import { getCurrentUser, User } from '@/lib/auth'
import { saveWorkout, WorkoutSet } from '@/lib/workouts'
import { AnimatedSetCheckbox } from '@/components/animated-set-checkbox'
import { WorkoutCelebration } from '@/components/workout-celebration'

type Exercise = {
  name: string
  default_sets: number
  default_reps: number
  sets?: Array<{ weight: number; reps: number; completed: boolean }>
}

function initExercises(template: typeof workoutTemplates.templates[0]): Exercise[] {
  return template.exercises.map((ex) => ({
    ...ex,
    sets: Array(ex.default_sets).fill(null).map(() => ({
      weight: 0,
      reps: ex.default_reps,
      completed: false
    }))
  }))
}

export default function WorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string

  const template = workoutTemplates.templates.find((t) => t.id === workoutId)

  // Initialize exercises IMMEDIATELY from template — no waiting for async
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (!template) return []
    
    // Check for saved draft synchronously
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(`workout-draft-${workoutId}`)
      if (savedDraft) {
        try {
          return JSON.parse(savedDraft)
        } catch (e) {
          // Fall through
        }
      }
    }
    
    return initExercises(template)
  })

  const [startTime, setStartTime] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const savedStartTime = localStorage.getItem(`workout-start-${workoutId}`)
      if (savedStartTime) return new Date(savedStartTime)
    }
    return new Date()
  })

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedElapsed = localStorage.getItem(`workout-elapsed-${workoutId}`)
      if (savedElapsed) return parseInt(savedElapsed)
    }
    return 0
  })

  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)

  // Load user in the background — doesn't block UI
  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  // Save workout draft to localStorage whenever exercises change
  useEffect(() => {
    if (exercises.length > 0 && !isWorkoutComplete) {
      localStorage.setItem(`workout-draft-${workoutId}`, JSON.stringify(exercises))
      if (startTime) {
        localStorage.setItem(`workout-start-${workoutId}`, startTime.toISOString())
        localStorage.setItem(`workout-elapsed-${workoutId}`, elapsedSeconds.toString())
      }
    }
  }, [exercises, startTime, elapsedSeconds, workoutId, isWorkoutComplete])

  // Clear draft when workout is completed
  useEffect(() => {
    if (isWorkoutComplete) {
      localStorage.removeItem(`workout-draft-${workoutId}`)
      localStorage.removeItem(`workout-start-${workoutId}`)
      localStorage.removeItem(`workout-elapsed-${workoutId}`)
    }
  }, [isWorkoutComplete, workoutId])

  // Timer
  useEffect(() => {
    if (!startTime || isWorkoutComplete) return
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isWorkoutComplete])

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
      return updated
    })
  }

  const handleSetBlur = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      const set = updated[exerciseIdx].sets![setIdx]
      if (set.weight > 0 && set.reps > 0 && !set.completed) {
        set.completed = true
      }
      return updated
    })
  }

  const completeWorkout = async () => {
    if (!user) return
    
    setSaving(true)

    const durationMinutes = Math.floor(elapsedSeconds / 60)
    
    const allSets: WorkoutSet[] = exercises.flatMap((ex) => 
      (ex.sets || [])
        .filter(s => s.completed)
        .map(s => ({
          exercise_name: ex.name,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed
        }))
    )

    const result = await saveWorkout(
      user,
      template!.name,
      allSets,
      durationMinutes,
      totalPoints
    )

    setSaving(false)

    if (result.success) {
      setIsWorkoutComplete(true)
      setShowCelebration(true)
    } else {
      alert('Error saving workout. Please try again.')
    }
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

  const pointsEarned = completedSets * 10
  const allSetsComplete = completedSets === totalSets && totalSets > 0
  const totalPoints = pointsEarned + (allSetsComplete ? 20 : 0)

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
                  <motion.div
                    key={setIdx}
                    initial={false}
                    animate={{
                      backgroundColor: set.completed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(63, 63, 70, 0.3)',
                      borderColor: set.completed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(82, 82, 91, 0.5)',
                    }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2`}
                  >
                    <AnimatedSetCheckbox
                      completed={set.completed}
                      setNumber={setIdx + 1}
                      onToggle={() => toggleSetComplete(exerciseIdx, setIdx)}
                    />

                    <div className="flex-1 flex gap-2">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) =>
                          updateSetValue(exerciseIdx, setIdx, 'weight', parseInt(e.target.value) || 0)
                        }
                        onBlur={() => handleSetBlur(exerciseIdx, setIdx)}
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
                        onBlur={() => handleSetBlur(exerciseIdx, setIdx)}
                        placeholder="reps"
                        className="w-20 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-center"
                      />
                    </div>
                  </motion.div>
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
              disabled={completedSets === 0 || saving}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : completedSets === 0 
                  ? 'Complete at least 1 set to finish' 
                  : `Complete Workout (+${totalPoints} pts${allSetsComplete ? ' 🔥' : ''})`
              }
            </button>
          </div>
        </div>
      </div>

      <WorkoutCelebration
        isOpen={showCelebration}
        points={totalPoints}
        duration={formatTime(elapsedSeconds)}
        allSetsComplete={allSetsComplete}
        onClose={() => router.push('/')}
      />
    </main>
  )
}
