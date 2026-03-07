'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, User } from '@/lib/auth'
import { getFeatureRequests, createFeatureRequest, toggleUpvote, FeatureRequest } from '@/lib/feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ChevronUp, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function FeedbackClient({ initialRequests }: { initialRequests: FeatureRequest[] }) {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState(initialRequests)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      if (currentUser && !currentUser.is_guest) {
        const reqs = await getFeatureRequests(currentUser.id)
        setRequests(reqs)
      }
    }
    loadUser()
  }, [])

  const reloadRequests = async () => {
    const reqs = await getFeatureRequests(user?.is_guest ? undefined : user?.id)
    setRequests(reqs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.is_guest) return

    setSubmitting(true)
    try {
      await createFeatureRequest(user.id, title, description)
      setTitle('')
      setDescription('')
      setModalOpen(false)
      reloadRequests()
    } catch {
      alert('Error submitting request')
    }
    setSubmitting(false)
  }

  const handleUpvote = async (requestId: string) => {
    if (!user || user.is_guest) return
    await toggleUpvote(user.id, requestId)
    reloadRequests()
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white">
      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between pt-4 pb-2">
          <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors -ml-1 p-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Feature Requests</h1>
          <div className="w-14" />
        </header>

        <p className="text-sm text-zinc-500 text-center mb-6">Vote on what we build next</p>

        {/* Submit button */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <button
              disabled={!user || user.is_guest}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-4 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Request a feature
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Feature</DialogTitle>
              <DialogDescription>Tell us what you&apos;d like to see</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Feature title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Describe the feature (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none focus:border-zinc-500 focus:outline-none"
              />
              <Button type="submit" className="w-full" disabled={submitting || !title.trim()}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Guest warning */}
        {user?.is_guest && (
          <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-zinc-400">Sign up to submit and vote on features</p>
          </div>
        )}

        {/* Requests */}
        {requests.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">
            <p className="text-base mb-1">No requests yet</p>
            <p className="text-sm">Be the first to suggest something</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <button
                  onClick={() => handleUpvote(request.id)}
                  disabled={!user || user.is_guest}
                  className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all flex-shrink-0 min-w-[44px] ${
                    request.user_has_upvoted
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{request.upvotes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5">{request.title}</h3>
                  {request.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{request.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <span>{request.username}</span>
                    <span>·</span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
