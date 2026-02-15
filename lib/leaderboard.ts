import { supabase } from './supabase'

export type LeaderboardEntry = {
  id: string
  username: string
  points: number
  streak_count: number
  rank: number
}

export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, points, streak_count')
    .order('points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data.map((user, index) => ({
    ...user,
    rank: index + 1
  }))
}

export async function getUserRank(userId: string): Promise<number | null> {
  const { data: user } = await supabase
    .from('users')
    .select('points')
    .eq('id', userId)
    .single()

  if (!user) return null

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('points', user.points)

  return (count || 0) + 1
}
