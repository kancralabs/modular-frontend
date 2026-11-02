import { isRouteErrorResponse, useRouteError } from 'react-router'
import { NotFoundPage } from './NotFoundPage'
import styles from './StatusPage.module.css'

// Vite reports a failed lazy chunk (e.g. after a redeploy) with one of these messages.
const CHUNK_LOAD_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i

export function RouteErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  const isChunkLoadError = error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)

  return (
    <section className={styles.page} role="alert">
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.message}>
        {isChunkLoadError
          ? 'A new version of the application is available. Reload the page to continue.'
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <button type="button" className={styles.action} onClick={() => window.location.reload()}>
        Reload page
      </button>
    </section>
  )
}
