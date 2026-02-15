'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Premium!
        </h1>
        <p className="text-zinc-400 mb-8">
          You now have access to custom workouts, exclusive leaderboard, and workout history.
        </p>
        <Link href="/">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl">
            Start Building Custom Workouts
          </button>
        </Link>
        <p className="text-zinc-500 text-sm mt-6">
          Redirecting to home in 5 seconds...
        </p>
      </div>
    </main>
  )
}
