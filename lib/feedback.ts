import { supabase } from './supabase'

export type FeatureRequest = {
  id: string
  user_id: string
  title: string
  description: string | null
  upvotes: number
  status: string
  created_at: string
  username?: string
  user_has_upvoted?: boolean
}

export async function getFeatureRequests(currentUserId?: string): Promise<FeatureRequest[]> {
  const { data: requests } = await supabase
    .from('feature_requests')
    .select(`
      *,
      users (username)
    `)
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: false })

  if (!requests) return []

  // Check if current user has upvoted each request
  if (currentUserId) {
    const { data: userUpvotes } = await supabase
      .from('feature_upvotes')
      .select('request_id')
      .eq('user_id', currentUserId)

    const upvotedIds = new Set(userUpvotes?.map(u => u.request_id) || [])

    return requests.map((req: any) => ({
      ...req,
      username: req.users?.username,
      user_has_upvoted: upvotedIds.has(req.id)
    }))
  }

  return requests.map((req: any) => ({
    ...req,
    username: req.users?.username,
    user_has_upvoted: false
  }))
}

export async function createFeatureRequest(
  userId: string,
  title: string,
  description: string
) {
  const { data, error } = await supabase
    .from('feature_requests')
    .insert({
      user_id: userId,
      title,
      description,
      upvotes: 1 // Start with 1 (creator's implicit upvote)
    })
    .select()
    .single()

  if (error) throw error

  // Auto-upvote from creator
  await supabase.from('feature_upvotes').insert({
    user_id: userId,
    request_id: data.id
  })

  return data
}

export async function toggleUpvote(userId: string, requestId: string) {
  // Check if already upvoted
  const { data: existing } = await supabase
    .from('feature_upvotes')
    .select('*')
    .eq('user_id', userId)
    .eq('request_id', requestId)
    .single()

  if (existing) {
    // Remove upvote
    await supabase
      .from('feature_upvotes')
      .delete()
      .eq('user_id', userId)
      .eq('request_id', requestId)

    // Decrement count
    await supabase.rpc('decrement_upvotes', { request_id: requestId })
  } else {
    // Add upvote
    await supabase
      .from('feature_upvotes')
      .insert({ user_id: userId, request_id: requestId })

    // Increment count
    await supabase.rpc('increment_upvotes', { request_id: requestId })
  }
}
