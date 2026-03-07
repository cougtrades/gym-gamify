'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import workoutTemplates from '@/data/workout-templates.json'
import { getCurrentUser, User } from '@/lib/auth'
import { saveWorkout, WorkoutSet } from '@/lib/workouts'
import { AnimatedSetCheckbox } from '@/components/animated-set-checkbox'
import { WorkoutCelebration } from '@/components/workout-celebration'
import { ArrowLeft, Clock, CheckCircle2, Timer } from 'lucide-react'
import { getLastWeight, saveWorkoutHistory } from '@/lib/exercise-history'
import { RestTimer } from '@/components/rest-timer'

type Exercise = {
  name: string
  default_sets: number
  default_reps: number
  sets?: Array<{ weight: number; reps: number; completed: boolean }>
}

function initExercises(template: typeof workoutTemplates.templates[0]): Exercise[] {
  return template.exercises.map((ex) => {
    // Pre-fill from last workout's weights
    const lastUsed = getLastWeight(ex.name)
    return {
      ...ex,
      sets: Array(ex.default_sets).fill(null).map(() => ({
        weight: lastUsed?.weight || 0,
        reps: lastUsed?.reps || ex.default_reps,
        completed: false
      }))
    }
  })
}

export default function WorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string

  const template = workoutTemplates.templates.find((t) => t.id === workoutId)

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (!template) return []
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(`workout-draft-${workoutId}`)
      if (savedDraft) {
        try { return JSON.parse(savedDraft) } catch { /* fall through */ }
      }
    }
    return initExercises(template)
  })

  const [startTime] = useState<Date>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`workout-start-${workoutId}`)
      if (saved) return new Date(saved)
    }
    return new Date()
  })

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`workout-elapsed-${workoutId}`)
      if (saved) return parseInt(saved)
    }
    return 0
  })

  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)

  useEffect(() => { getCurrentUser().then(setUser) }, [])

  // Save draft
  useEffect(() => {
    if (exercises.length > 0 && !isWorkoutComplete) {
      localStorage.setItem(`workout-draft-${workoutId}`, JSON.stringify(exercises))
      localStorage.setItem(`workout-start-${workoutId}`, startTime.toISOString())
      localStorage.setItem(`workout-elapsed-${workoutId}`, elapsedSeconds.toString())
    }
  }, [exercises, startTime, elapsedSeconds, workoutId, isWorkoutComplete])

  // Clear draft on complete
  useEffect(() => {
    if (isWorkoutComplete) {
      localStorage.removeItem(`workout-draft-${workoutId}`)
      localStorage.removeItem(`workout-start-${workoutId}`)
      localStorage.removeItem(`workout-elapsed-${workoutId}`)
    }
  }, [isWorkoutComplete, workoutId])

  // Timer
  useEffect(() => {
    if (isWorkoutComplete) return
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

  const toggleSetComplete = useCallback((exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      const exercise = { ...updated[exerciseIdx] }
      const sets = [...(exercise.sets || [])]
      const wasCompleted = sets[setIdx].completed
      sets[setIdx] = { ...sets[setIdx], completed: !wasCompleted }
      exercise.sets = sets
      updated[exerciseIdx] = exercise

      // Show rest timer when completing a set (not unchecking)
      if (!wasCompleted) {
        setShowRestTimer(true)
      }

      return updated
    })
  }, [])

  const updateSetValue = useCallback((exerciseIdx: number, setIdx: number, field: 'weight' | 'reps', value: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      const exercise = { ...updated[exerciseIdx] }
      const sets = [...(exercise.sets || [])]
      sets[setIdx] = { ...sets[setIdx], [field]: value }
      exercise.sets = sets
      updated[exerciseIdx] = exercise
      return updated
    })
  }, [])

  const handleSetBlur = useCallback((exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev]
      const exercise = { ...updated[exerciseIdx] }
      const sets = [...(exercise.sets || [])]
      const set = sets[setIdx]
      if (set.weight > 0 && set.reps > 0 && !set.completed) {
        sets[setIdx] = { ...set, completed: true }
        exercise.sets = sets
        updated[exerciseIdx] = exercise
        setShowRestTimer(true)
      }
      return updated
    })
  }, [])

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

    const result = await saveWorkout(user, template!.name, allSets, durationMinutes, totalPoints)
    setSaving(false)

    if (result.success) {
      // Save weights for next session's pre-fill
      saveWorkoutHistory(exercises)
      setIsWorkoutComplete(true)
      setShowCelebration(true)
    } else {
      alert('Error saving workout. Please try again.')
    }
  }

  if (!template) {
    return (
      <main className="min-h-[100dvh] bg-zinc-950 p-6 text-white">
        <div className="max-w-lg mx-auto text-center mt-20">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to home</Link>
        </div>
      </main>
    )
  }

  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)
  const completedSets = exercises.reduce(
    (acc, ex) => acc + (ex.sets?.filter((s) => s.completed).length || 0), 0
  )
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  const pointsEarned = completedSets * 10
  const allSetsComplete = completedSets === totalSets && totalSets > 0
  const totalPoints = pointsEarned + (allSetsComplete ? 20 : 0)

  return (
    <main className="min-h-[100dvh] bg-zinc-950 pb-28">
      <div className="max-w-lg mx-auto px-4">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-900 -mx-4 px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="text-lg font-bold">{template.name}</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRestTimer(!showRestTimer)}
                className={`p-1.5 rounded-lg transition-colors ${showRestTimer ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-500 hover:text-white'}`}
                title="Rest timer"
              >
                <Timer className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-mono tabular-nums">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-zinc-600">{completedSets}/{totalSets} sets</span>
            <span className="text-xs text-zinc-600">+{totalPoints} pts</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4 mt-4">
          {exercises.map((exercise, exerciseIdx) => {
            const exerciseCompleted = exercise.sets?.every(s => s.completed) || false
            return (
              <motion.div
                key={exerciseIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: exerciseIdx * 0.04 }}
                className={`bg-zinc-900 border rounded-2xl p-4 transition-colors ${
                  exerciseCompleted ? 'border-green-500/30' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      {exercise.name}
                      {exerciseCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                    </h3>
                    {(() => {
                      const last = getLastWeight(exercise.name)
                      return last ? (
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          Last: {last.weight}lbs × {last.reps}
                        </p>
                      ) : null
                    })()}
                  </div>
                  <span className="text-xs text-zinc-600">
                    {exercise.sets?.filter(s => s.completed).length}/{exercise.sets?.length}
                  </span>
                </div>

                {/* Header row */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <div className="w-12" />
                  <div className="flex-1 flex gap-2">
                    <span className="w-20 text-center text-[10px] font-medium text-zinc-600 uppercase tracking-wider">lbs</span>
                    <span className="w-4" />
                    <span className="w-20 text-center text-[10px] font-medium text-zinc-600 uppercase tracking-wider">reps</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {exercise.sets?.map((set, setIdx) => (
                    <motion.div
                      key={setIdx}
                      initial={false}
                      animate={{
                        backgroundColor: set.completed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(24, 24, 27, 0.5)',
                      }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-3 p-2 rounded-xl"
                    >
                      <AnimatedSetCheckbox
                        completed={set.completed}
                        setNumber={setIdx + 1}
                        onToggle={() => toggleSetComplete(exerciseIdx, setIdx)}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.weight || ''}
                          onChange={(e) =>
                            updateSetValue(exerciseIdx, setIdx, 'weight', parseInt(e.target.value) || 0)
                          }
                          onBlur={() => handleSetBlur(exerciseIdx, setIdx)}
                          placeholder="0"
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-center text-sm font-medium focus:border-zinc-500 focus:outline-none transition-colors"
                        />
                        <span className="text-zinc-600 text-sm">×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps || ''}
                          onChange={(e) =>
                            updateSetValue(exerciseIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                          }
                          onBlur={() => handleSetBlur(exerciseIdx, setIdx)}
                          placeholder={`${exercise.default_reps}`}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-center text-sm font-medium focus:border-zinc-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Complete button - fixed */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-12">
          <div className="max-w-lg mx-auto">
            <button
              onClick={completeWorkout}
              disabled={completedSets === 0 || saving}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl text-base transition-all disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving
                ? 'Saving...'
                : completedSets === 0
                  ? 'Complete a set to finish'
                  : `Finish workout → +${totalPoints} pts${allSetsComplete ? ' 🔥' : ''}`
              }
            </button>
          </div>
        </div>
      </div>

      <RestTimer
        isOpen={showRestTimer}
        onClose={() => setShowRestTimer(false)}
      />

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
