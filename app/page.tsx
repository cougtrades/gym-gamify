import { redirect } from 'next/navigation'

export default function Home() {
  // Simple redirect to avoid hydration issues
  redirect('/workout/push')
}