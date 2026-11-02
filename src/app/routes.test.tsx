import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from './providers'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('routes', () => {
  it('renders the lazy-loaded home page inside the layout', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Test App' })).toBeInTheDocument()
  })

  it('renders the not found page for unknown routes', async () => {
    renderAt('/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
