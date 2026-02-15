'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, User } from '@/lib/auth'
import { getFeatureRequests, createFeatureRequest, toggleUpvote, FeatureRequest } from '@/lib/feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function FeedbackPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    const reqs = await getFeatureRequests(currentUser?.is_guest ? undefined : currentUser?.id)
    setRequests(reqs)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.is_guest) {
      alert('Sign up to submit feature requests')
      return
    }

    setSubmitting(true)
    try {
      await createFeatureRequest(user.id, title, description)
      setTitle('')
      setDescription('')
      setModalOpen(false)
      loadData()
    } catch (error) {
      alert('Error submitting request')
    }
    setSubmitting(false)
  }

  const handleUpvote = async (requestId: string) => {
    if (!user || user.is_guest) {
      alert('Sign up to upvote features')
      return
    }

    await toggleUpvote(user.id, requestId)
    loadData()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">💡 Feature Requests</h1>
            <p className="text-zinc-400 text-sm">Vote on what we build next</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">← Home</Button>
          </Link>
        </div>

        {/* Submit button */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6" disabled={user?.is_guest}>
              + Request a Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Feature</DialogTitle>
              <DialogDescription>
                Tell us what you'd like to see in the app
              </DialogDescription>
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
                className="w-full min-h-[100px] px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white resize-none"
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Guest warning */}
        {user?.is_guest && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>Sign up to request features and upvote</strong>
            </p>
          </div>
        )}

        {/* Requests list */}
        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-xl mb-2">No feature requests yet</p>
            <p className="text-sm">Be the first to suggest something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-xl p-5 flex gap-4"
              >
                {/* Upvote button */}
                <button
                  onClick={() => handleUpvote(request.id)}
                  disabled={user?.is_guest}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                    request.user_has_upvoted
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">▲</span>
                  <span className="text-sm font-bold">{request.upvotes}</span>
                </button>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">{request.title}</h3>
                  {request.description && (
                    <p className="text-zinc-400 text-sm mb-3">{request.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>by {request.username}</span>
                    <span>•</span>
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
