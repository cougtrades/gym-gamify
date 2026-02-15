'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    load()
  }, [])

  const handleUpgrade = async () => {
    if (!user || user.is_guest) {
      alert('Sign up first to upgrade to premium')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert('Error: ' + error)
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <Link href="/" className="text-zinc-400 hover:text-white text-sm">
            ← Back to home
          </Link>
          <h1 className="text-5xl font-bold text-white mt-4 mb-4">
            ✨ Go Premium
          </h1>
          <p className="text-zinc-400 text-lg">
            Unlock custom workouts, exclusive leaderboard, and workout history
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-blue-300 text-sm font-medium mb-2">COMPETITIVE EDGE</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-bold text-white">$7</span>
              <span className="text-zinc-400 text-xl">/month</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-white font-medium">Custom Workout Templates</p>
                <p className="text-zinc-400 text-sm">Create your own splits - Upper/Lower, Arnold, Bro split, whatever you want</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <p className="text-white font-medium">Premium Badge + Exclusive Leaderboard</p>
                <p className="text-zinc-400 text-sm">Stand out with a premium badge and compete on the VIP-only leaderboard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-white font-medium">Workout History + PR Tracking</p>
                <p className="text-zinc-400 text-sm">See all your past workouts and track personal records over time</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            disabled={loading || user?.is_guest}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-6 text-lg"
          >
            {loading ? 'Loading...' : user?.is_guest ? 'Sign up first' : 'Upgrade to Premium'}
          </Button>

          {user?.is_guest && (
            <p className="text-center text-zinc-500 text-sm mt-4">
              Create an account to unlock premium features
            </p>
          )}
        </div>

        {/* FAQ */}
        <div className="text-center text-zinc-500 text-sm space-y-2">
          <p>✓ Cancel anytime, no questions asked</p>
          <p>✓ Instant access after payment</p>
          <p>✓ Secure checkout powered by Stripe</p>
        </div>
      </div>
    </main>
  )
}
