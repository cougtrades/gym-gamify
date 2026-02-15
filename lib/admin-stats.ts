import { supabase } from './supabase'

export type AdminStats = {
  totalUsers: number
  dailySignups: number
  weeklyActiveUsers: number
  totalWorkouts: number
  mrr: number
}

export async function getAdminStats(): Promise<AdminStats> {
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Daily signups (registered today)
  const today = new Date().toISOString().split('T')[0]
  const { count: dailySignups } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)

  // Weekly active users (completed workout in last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: activeUsers } = await supabase
    .from('workouts')
    .select('user_id')
    .gte('completed_at', weekAgo.toISOString())

  const uniqueActiveUsers = new Set(activeUsers?.map(w => w.user_id) || [])

  // Total workouts
  const { count: totalWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })

  // Calculate MRR ($7 per premium user)
  const { count: premiumUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true)

  const mrr = (premiumUsers || 0) * 7

  return {
    totalUsers: totalUsers || 0,
    dailySignups: dailySignups || 0,
    weeklyActiveUsers: uniqueActiveUsers.size,
    totalWorkouts: totalWorkouts || 0,
    mrr
  }
}

export async function getRecentSignups(limit: number = 10) {
  const { data } = await supabase
    .from('users')
    .select('username, email, created_at, points')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function getRecentWorkouts(limit: number = 20) {
  const { data } = await supabase
    .from('workouts')
    .select(`
      id,
      template_name,
      duration_minutes,
      completed_at,
      users (username)
    `)
    .order('completed_at', { ascending: false })
    .limit(limit)

  return data || []
}
