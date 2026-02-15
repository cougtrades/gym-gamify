'use client'

import { useState } from 'react'
import { signInWithEmail } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signInWithEmail(email)

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {sent ? '📧 Check your email' : '🎮 Join the leaderboard'}
          </DialogTitle>
          <DialogDescription>
            {sent
              ? `We sent a magic link to ${email}. Click it to sign in.`
              : 'Sign up or sign in with your email to compete globally and save your progress.'
            }
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </Button>
            <p className="text-xs text-zinc-500 text-center">
              No password needed. We'll email you a link to sign in.
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              variant="outline"
              className="w-full"
            >
              Try different email
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
