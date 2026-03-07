// Suggest the next workout based on a simple Push/Pull/Legs rotation
// and what the user did last

const ROTATION = ['push', 'pull', 'legs'] as const

export function getSuggestedWorkout(lastTemplateName?: string): typeof ROTATION[number] {
  if (!lastTemplateName) return 'push'

  const normalized = lastTemplateName.toLowerCase().trim()

  if (normalized === 'push') return 'pull'
  if (normalized === 'pull') return 'legs'
  if (normalized === 'legs') return 'push'

  // Default rotation
  return 'push'
}

export function getLastWorkoutTemplate(): string | null {
  if (typeof window === 'undefined') return null

  // Check guest workouts
  const guestWorkouts = localStorage.getItem('guest_workouts')
  if (guestWorkouts) {
    try {
      const workouts = JSON.parse(guestWorkouts)
      if (workouts.length > 0) {
        return workouts[workouts.length - 1].template_name
      }
    } catch { /* ignore */ }
  }

  return null
}

export function getMotivationalMessage(streak: number, points: number): string {
  if (streak >= 7) return "You're on fire! A whole week straight 🔥"
  if (streak >= 3) return `${streak}-day streak! Keep it alive`
  if (streak === 1) return "Streak started — come back tomorrow"
  if (points > 500) return "Over 500 points. Respect."
  if (points > 100) return "Building momentum. Keep stacking."
  return "Let's get to work"
}
