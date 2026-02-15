import { supabase } from './supabase'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
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
