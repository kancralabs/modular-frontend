import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { getConfig } from '@/config/env'
import '@/styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

const root = createRoot(container)

try {
  getConfig()
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error(error)
  root.render(
    <p role="alert">The application is misconfigured. Please contact an administrator.</p>,
  )
}
