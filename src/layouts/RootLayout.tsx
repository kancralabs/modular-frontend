import { Outlet } from 'react-router'
import { getConfig } from '@/config/env'
import styles from './RootLayout.module.css'

export function RootLayout() {
  const { appName } = getConfig()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>{appName}</span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
