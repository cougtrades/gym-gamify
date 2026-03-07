// Store and retrieve last-used weights per exercise
// This makes the app smarter — pre-fills weights from your last session

type ExerciseRecord = {
  weight: number
  reps: number
  timestamp: number
}

const STORAGE_KEY = 'exercise_history'

function getHistory(): Record<string, ExerciseRecord> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getLastWeight(exerciseName: string): { weight: number; reps: number } | null {
  const history = getHistory()
  const record = history[exerciseName.toLowerCase()]
  if (!record) return null
  return { weight: record.weight, reps: record.reps }
}

export function saveExerciseRecord(exerciseName: string, weight: number, reps: number) {
  if (typeof window === 'undefined') return
  const history = getHistory()
  history[exerciseName.toLowerCase()] = {
    weight,
    reps,
    timestamp: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

// Save all completed sets from a workout
export function saveWorkoutHistory(
  exercises: Array<{
    name: string
    sets?: Array<{ weight: number; reps: number; completed: boolean }>
  }>
) {
  for (const exercise of exercises) {
    const completedSets = (exercise.sets || []).filter(s => s.completed && s.weight > 0)
    if (completedSets.length > 0) {
      // Use the heaviest completed set as the "last used" weight
      const heaviest = completedSets.reduce((max, s) => (s.weight > max.weight ? s : max))
      saveExerciseRecord(exercise.name, heaviest.weight, heaviest.reps)
    }
  }
}
