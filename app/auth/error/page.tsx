import Link from 'next/link'

export default function AuthError() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Authentication Error
        </h1>
        <p className="text-zinc-400 mb-8">
          Something went wrong with your sign-in link. It may have expired or already been used.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-zinc-900 font-bold py-3 px-6 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
