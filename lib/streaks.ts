import { supabase } from './supabase'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Calculate streak from workout history
export function calculateStreakFromWorkouts(workouts: Array<{ completed_at: string }>): number {
  if (!workouts || workouts.length === 0) return 0
  
  // Get unique workout dates (sorted newest first)
  const workoutDates = [...new Set(
    workouts.map(w => w.completed_at.split('T')[0])
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  if (workoutDates.length === 0) return 0
  
  const today = getToday()
  const yesterday = getYesterday()
  
  // Check if worked out today or yesterday (streak is alive)
  const mostRecent = workoutDates[0]
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0 // Streak broken
  }
  
  // Count consecutive days
  let streak = 1
  for (let i = 1; i < workoutDates.length; i++) {
    const current = new Date(workoutDates[i - 1])
    const previous = new Date(workoutDates[i])
    
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      streak++
    } else if (diffDays === 0) {
      // Same day, continue (multiple workouts in one day)
      continue
    } else {
      break // Streak broken
    }
  }
  
  return streak
}

// Get guest streak from localStorage workouts
export function getGuestStreak(): number {
  if (typeof window === 'undefined') return 0
  
  const workouts = JSON.parse(localStorage.getItem('guest_workouts') || '[]')
  return calculateStreakFromWorkouts(workouts)
}

export async function updateStreak(userId: string, isGuest: boolean) {
  if (isGuest) {
    // Guest mode - update localStorage
    const guestUser = localStorage.getItem('guest_user')
    if (!guestUser) return

    const user = JSON.parse(guestUser)
    const today = getToday()
    const lastWorkout = user.last_workout_date

    if (!lastWorkout || lastWorkout === today) {
      // First workout or already worked out today - set to 1
      user.streak_count = 1
    } else if (lastWorkout === getYesterday()) {
      // Worked out yesterday - increment streak
      user.streak_count = (user.streak_count || 0) + 1
    } else {
      // Missed a day - reset to 1
      user.streak_count = 1
    }

    user.last_workout_date = today
    localStorage.setItem('guest_user', JSON.stringify(user))
    return
  }

  // Authenticated user - update database
  const { data: user } = await supabase
    .from('users')
    .select('last_workout_date, streak_count')
    .eq('id', userId)
    .single()

  if (!user) return

  const today = getToday()
  const lastWorkout = user.last_workout_date

  let newStreak = 1

  if (!lastWorkout || lastWorkout === today) {
    // First workout or already worked out today
    newStreak = 1
  } else if (lastWorkout === getYesterday()) {
    // Worked out yesterday - increment
    newStreak = (user.streak_count || 0) + 1
  } else {
    // Missed a day - reset
    newStreak = 1
  }

  await supabase
    .from('users')
    .update({
      streak_count: newStreak,
      last_workout_date: today
    })
    .eq('id', userId)
}
