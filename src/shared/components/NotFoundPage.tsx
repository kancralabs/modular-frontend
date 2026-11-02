import { Link } from 'react-router'
import styles from './StatusPage.module.css'

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>The page you are looking for does not exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}
