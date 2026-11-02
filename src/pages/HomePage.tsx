import { getConfig } from '@/config/env'

export function HomePage() {
  const { appName } = getConfig()

  return (
    <section>
      <h1>{appName}</h1>
      <p>The application is running.</p>
    </section>
  )
}
