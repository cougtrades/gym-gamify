import { getLeaderboard } from '@/lib/leaderboard'
import { LeaderboardClient } from './leaderboard-client'

export const dynamic = 'force-dynamic' // Always fetch fresh data

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard(100, false)

  return <LeaderboardClient initialLeaderboard={leaderboard} />
}
