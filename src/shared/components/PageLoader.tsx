import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      Loading…
    </div>
  )
}
