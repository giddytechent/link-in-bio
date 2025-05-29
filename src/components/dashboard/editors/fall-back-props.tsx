import { useState } from 'react';

interface ErrorDetails {
  message: string
  stack?: string
}

interface FallbackProps {
  error: ErrorDetails;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetErrorBoundary()
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="p-4 border border-red-500 rounded-lg">
      <p className="text-red-500">Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button
        onClick={handleReset}
        disabled={isResetting}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        {isResetting ? 'Resetting...' : 'Try again'}
      </button>
    </div>
  )
}