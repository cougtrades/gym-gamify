import { supabase } from './supabase'

export type User = {
  id: string
  email?: string
  username?: string
  points: number
  streak_count: number
  is_guest: boolean
}

// Generate a guest user ID
export function generateGuestId(): string {
  return `guest_${Math.random().toString(36).substring(2, 15)}`
}

// Get or create guest user in localStorage
export function getGuestUser(): User {
  if (typeof window === 'undefined') return null as any

  const stored = localStorage.getItem('guest_user')
  if (stored) {
    return JSON.parse(stored)
  }

  // Create new guest
  const guestUser: User = {
    id: generateGuestId(),
    points: 0,
    streak_count: 0,
    is_guest: true
  }
  
  localStorage.setItem('guest_user', JSON.stringify(guestUser))
  return guestUser
}

// Update guest user points locally
export function updateGuestUser(updates: Partial<User>) {
  if (typeof window === 'undefined') return

  const current = getGuestUser()
  const updated = { ...current, ...updates }
  localStorage.setItem('guest_user', JSON.stringify(updated))
}

// Sign in with magic link
export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  return { error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error && typeof window !== 'undefined') {
    localStorage.removeItem('guest_user')
  }
  return { error }
}

// Get current user (auth or guest)
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (authUser) {
    // Fetch from database
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (data) {
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        points: data.points,
        streak_count: data.streak_count,
        is_guest: false
      }
    }
  }
  
  // Return guest user
  return getGuestUser()
}
