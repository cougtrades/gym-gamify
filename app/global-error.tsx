'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong!</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}