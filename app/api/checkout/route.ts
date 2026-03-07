import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    // Just use the email passed from the frontend
    // User profile should already exist from auth flow
    const session = await createCheckoutSession(
      userId,
      email,
      process.env.STRIPE_PRICE_ID!
    )

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
