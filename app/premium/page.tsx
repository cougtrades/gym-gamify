'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Crown, Dumbbell, Trophy, BarChart3, Check } from 'lucide-react'

const features = [
  {
    icon: Dumbbell,
    title: 'Custom Workout Templates',
    description: 'Create your own splits — Upper/Lower, Arnold, Bro split, anything',
  },
  {
    icon: Trophy,
    title: 'Premium Badge + Exclusive Leaderboard',
    description: 'Stand out and compete on the VIP-only rankings',
  },
  {
    icon: BarChart3,
    title: 'Workout History + PR Tracking',
    description: 'See all past workouts and track personal records over time',
  },
]

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const handleUpgrade = async () => {
    if (!user || user.is_guest || !user.email) return

    setLoading(true)
    try {
      const freshUser = await getCurrentUser()
      if (!freshUser || freshUser.is_guest) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: freshUser.id, email: freshUser.email }),
      })

      const { url, error } = await response.json()
      if (error) {
        alert('Error: ' + error)
        setLoading(false)
        return
      }

      window.location.href = url
    } catch {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <header className="flex items-center pt-4 pb-6">
          <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
        </header>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 rounded-2xl mb-4">
            <Crown className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Go Premium</h1>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Unlock the full experience and get a competitive edge
          </p>
        </div>

        {/* Price */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold">$7</span>
            <span className="text-zinc-500">/mo</span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">Cancel anytime</p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{feature.title}</p>
                <p className="text-xs text-zinc-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={handleUpgrade}
          disabled={loading || !user || user.is_guest}
          className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-bold py-6 text-base rounded-2xl"
        >
          {loading ? 'Loading...' : user?.is_guest ? 'Sign up first' : 'Upgrade to Premium'}
        </Button>

        {user?.is_guest && (
          <p className="text-center text-zinc-600 text-xs mt-3">Create an account first to unlock premium</p>
        )}

        {/* Trust signals */}
        <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3" /> Secure checkout via Stripe
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3" /> Cancel anytime, no questions
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3" /> Instant access after payment
          </div>
        </div>
      </div>
    </main>
  )
}
