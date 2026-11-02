import type { RouteObject } from 'react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { PageLoader } from '@/shared/components/PageLoader'
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary'

// Pages and feature domains are lazy-loaded at the route boundary.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/HomePage')
          return { Component: HomePage }
        },
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]
