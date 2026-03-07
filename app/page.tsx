'use client'

import React, { useEffect, useState } from 'react'
import workoutTemplates from '@/data/workout-templates.json'

// Simple version without any hooks that could cause mismatch
export default function Home() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a simple version during SSR, full version after mount
  if (!mounted) {
    return (
      <main className="min-h-[100dvh] bg-zinc-950 text-white">
        <div className="max-w-lg mx-auto px-4 pb-24">
          <header className="flex items-center justify-between pt-4 pb-6">
            <h1 className="text-xl font-bold tracking-tight">Gym Gamify</h1>
          </header>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <div className="h-8 w-12 animate-pulse rounded bg-white/5 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {workoutTemplates.templates.map((template) => (
              <div key={template.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold">{template.name}</h3>
                <p className="text-sm text-zinc-500">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // After mount, render the full client component
  const HomeClient = React.lazy(() => import('./home-client'))
  
  return (
    <React.Suspense fallback={
      <main className="min-h-[100dvh] bg-zinc-950 text-white">
        <div className="max-w-lg mx-auto px-4 pb-24">
          <div className="h-8 w-32 animate-pulse rounded bg-white/5 mb-8" />
        </div>
      </main>
    }>
      <HomeClient templates={workoutTemplates.templates} />
    </React.Suspense>
  )
}