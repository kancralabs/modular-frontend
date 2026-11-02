import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ApiError } from '@/shared/lib/api-client'

const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Retrying cannot fix authentication, permission, or contract errors.
  if (error instanceof ApiError && error.kind !== 'network' && error.kind !== 'timeout') {
    return false
  }
  return failureCount < MAX_RETRIES
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: shouldRetry },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
