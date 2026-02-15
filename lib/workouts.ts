import { supabase } from './supabase'
import { User, updateGuestUser } from './auth'
import { updateStreak } from './streaks'

export type WorkoutSet = {
  exercise_name: string
  weight: number
  reps: number
  completed: boolean
}

export async function saveWorkout(
  user: User,
  templateName: string,
  sets: WorkoutSet[],
  durationMinutes: number,
  pointsEarned: number
) {
  if (user.is_guest) {
    // Guest mode - save to localStorage
    const workouts = JSON.parse(localStorage.getItem('guest_workouts') || '[]')
    workouts.push({
      id: Date.now().toString(),
      template_name: templateName,
      completed_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
      points: pointsEarned,
      sets
    })
    localStorage.setItem('guest_workouts', JSON.stringify(workouts))
    
    // Update guest user points
    updateGuestUser({
      points: user.points + pointsEarned
    })
    
    // Update streak
    await updateStreak(user.id, true)
    
    return { success: true }
  }

  // Authenticated user - save to Supabase
  try {
    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        template_name: templateName,
        duration_minutes: durationMinutes
      })
      .select()
      .single()

    if (workoutError) throw workoutError

    // Save all sets
    const setsToInsert = sets
      .filter(s => s.completed)
      .map(s => ({
        workout_id: workout.id,
        exercise_name: s.exercise_name,
        weight: s.weight,
        reps: s.reps,
        completed: s.completed
      }))

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert)

      if (setsError) throw setsError
    }

    // Update user points
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        points: user.points + pointsEarned 
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Update streak
    await updateStreak(user.id, false)

    return { success: true }
  } catch (error) {
    console.error('Error saving workout:', error)
    return { success: false, error }
  }
}
