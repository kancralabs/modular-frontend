// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError, createApiClient, joinUrl } from './api-client'

const itemSchema = z.object({ id: z.string() })

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

// Never resolves; rejects with the abort reason like the real fetch does.
const neverRespondingFetch: typeof fetch = (_input, init) =>
  new Promise((_resolve, reject) => {
    const signal = init?.signal
    if (signal?.aborted) return reject(signal.reason)
    signal?.addEventListener('abort', () => reject(signal.reason))
  })

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('Expected promise to reject')
}

describe('joinUrl', () => {
  it('joins base URL and path with a single slash', () => {
    expect(joinUrl('/api/', '/items')).toBe('/api/items')
    expect(joinUrl('https://api.example.com', 'items')).toBe('https://api.example.com/items')
  })
})

describe('createApiClient', () => {
  it('sends the latest access token and returns the validated body', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: '1' }))
    const client = createApiClient({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
      getAccessToken: () => 'token-123',
    })

    await expect(client.request('/items/1', { schema: itemSchema })).resolves.toEqual({ id: '1' })

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('https://api.example.com/items/1')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('maps 401 to unauthorized and notifies the auth layer', async () => {
    const onUnauthorized = vi.fn()
    const client = createApiClient({
      baseUrl: '/api',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 401)),
      onUnauthorized,
    })

    const error = await captureError(client.request('/me', { schema: itemSchema }))
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('unauthorized')
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('maps 403 to forbidden without triggering re-authentication', async () => {
    const onUnauthorized = vi.fn()
    const client = createApiClient({
      baseUrl: '/api',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 403)),
      onUnauthorized,
    })

    const error = await captureError(client.request('/admin', { schema: itemSchema }))
    expect((error as ApiError).kind).toBe('forbidden')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('rejects responses that do not match the schema', async () => {
    const client = createApiClient({
      baseUrl: '/api',
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: 1 })),
    })

    const error = await captureError(client.request('/items/1', { schema: itemSchema }))
    expect((error as ApiError).kind).toBe('invalid-response')
  })

  it('reports a timeout when the request exceeds timeoutMs', async () => {
    const client = createApiClient({ baseUrl: '/api', fetch: neverRespondingFetch, timeoutMs: 10 })

    const error = await captureError(client.request('/slow', { schema: itemSchema }))
    expect((error as ApiError).kind).toBe('timeout')
  })

  it('propagates caller cancellation unchanged', async () => {
    const client = createApiClient({ baseUrl: '/api', fetch: neverRespondingFetch })
    const controller = new AbortController()

    const pending = captureError(
      client.request('/slow', { schema: itemSchema, signal: controller.signal }),
    )
    controller.abort()

    const error = await pending
    expect(error).not.toBeInstanceOf(ApiError)
    expect((error as Error).name).toBe('AbortError')
  })
})
