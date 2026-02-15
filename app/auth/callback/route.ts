import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Successfully authenticated
      // TODO: Migrate guest data to authenticated user
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
