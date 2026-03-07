'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function AuthCallbackHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have auth tokens in the hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')
      const error = hashParams.get('error')
      const error_description = hashParams.get('error_description')

      if (error) {
        console.error('Auth error:', error, error_description)
        router.push('/?error=auth_failed')
        return
      }

      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/?error=auth_failed')
          return
        }

        // Clear the hash and redirect to home
        router.push('/')
        router.refresh()
      }
    }

    handleAuthCallback()
  }, [router])

  return null
}
