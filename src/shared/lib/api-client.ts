import type { ZodType } from 'zod'

export type ApiErrorKind =
  | 'unauthorized' // 401 — session missing or expired
  | 'forbidden' // 403 — authenticated but not permitted
  | 'http' // any other non-2xx response
  | 'network' // request never reached the server
  | 'timeout'
  | 'invalid-response' // response did not match the expected contract

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  readonly body: unknown

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; body?: unknown; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
    this.body = options.body
  }
}

export interface ApiClientOptions {
  baseUrl: string
  timeoutMs?: number
  /** Called per request so the latest valid token is always used. */
  getAccessToken?: () => string | undefined | Promise<string | undefined>
  /** Hook for the auth layer, e.g. to trigger re-authentication. */
  onUnauthorized?: () => void
  fetch?: typeof fetch
}

export interface RequestOptions<T> extends Omit<RequestInit, 'body'> {
  /** Validates the response body and defines the return type. */
  schema: ZodType<T>
  /** Serialized as JSON. */
  body?: unknown
}

const DEFAULT_TIMEOUT_MS = 30_000

export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function createApiClient(options: ApiClientOptions) {
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  async function request<T>(
    path: string,
    { schema, body, headers, signal, ...init }: RequestOptions<T>,
  ): Promise<T> {
    const requestHeaders = new Headers(headers)
    requestHeaders.set('Accept', 'application/json')
    if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

    const token = await options.getAccessToken?.()
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

    const timeoutSignal = AbortSignal.timeout(timeoutMs)
    const signals = signal ? [signal, timeoutSignal] : [timeoutSignal]

    let response: Response
    try {
      response = await fetchImpl(joinUrl(options.baseUrl, path), {
        ...init,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.any(signals),
      })
    } catch (error) {
      if (timeoutSignal.aborted) {
        throw new ApiError('timeout', `Request timed out after ${timeoutMs}ms`, {
          cause: error,
        })
      }
      // Caller-initiated cancellation (e.g. TanStack Query) propagates unchanged.
      if (signal?.aborted) throw error
      throw new ApiError('network', 'Network request failed', { cause: error })
    }

    const responseBody = await readBody(response)

    if (!response.ok) {
      const status = response.status
      if (status === 401) {
        options.onUnauthorized?.()
        throw new ApiError('unauthorized', 'Authentication required', {
          status,
          body: responseBody,
        })
      }
      if (status === 403) {
        throw new ApiError('forbidden', 'Access denied', { status, body: responseBody })
      }
      throw new ApiError('http', `Request failed with status ${status}`, {
        status,
        body: responseBody,
      })
    }

    const parsed = schema.safeParse(responseBody)
    if (!parsed.success) {
      throw new ApiError('invalid-response', 'Response did not match the expected schema', {
        status: response.status,
        body: responseBody,
        cause: parsed.error,
      })
    }
    return parsed.data
  }

  return { request }
}

export type ApiClient = ReturnType<typeof createApiClient>
