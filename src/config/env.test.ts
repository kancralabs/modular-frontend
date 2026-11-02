import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from './env'

describe('loadConfig', () => {
  it('uses build-time values when no runtime config is present', () => {
    expect(loadConfig(undefined, { VITE_APP_NAME: 'App', VITE_API_BASE_URL: '/api' })).toEqual({
      appName: 'App',
      apiBaseUrl: '/api',
    })
  })

  it('prefers non-empty runtime values over build-time values', () => {
    const config = loadConfig(
      { appName: 'Runtime App', apiBaseUrl: '' },
      { VITE_APP_NAME: 'App', VITE_API_BASE_URL: '/api' },
    )
    expect(config).toEqual({ appName: 'Runtime App', apiBaseUrl: '/api' })
  })

  it('throws a ConfigError listing every missing value', () => {
    expect.assertions(2)
    try {
      loadConfig(undefined, {})
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError)
      expect((error as ConfigError).issues).toHaveLength(2)
    }
  })
})
