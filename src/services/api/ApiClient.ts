export interface ApiFailure {
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim()
  if (!configuredUrl) {
    if (import.meta.env.PROD) {
      throw new Error('VITE_API_URL must be set to the deployed API origin for production builds.')
    }
    return ''
  }

  let apiUrl: URL
  try {
    apiUrl = new URL(configuredUrl)
  } catch {
    throw new Error('VITE_API_URL must be an absolute API origin, such as https://api.example.com.')
  }

  if (apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash || apiUrl.username || apiUrl.password) {
    throw new Error('VITE_API_URL must be the API origin only, without credentials, path, query, or hash.')
  }
  const hostname = apiUrl.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  const isLoopbackHost = hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname === '::1'
    || hostname === '0.0.0.0'
    || /^127(?:\.\d{1,3}){3}$/.test(hostname)
  if (import.meta.env.PROD && (apiUrl.protocol !== 'https:' || isLoopbackHost)) {
    throw new Error('Production API requests require a public HTTPS VITE_API_URL, not localhost.')
  }

  return apiUrl.origin
}

export const apiClient = {
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${getApiBaseUrl()}/api${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })

    if (response.status === 204) return undefined as T

    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const errorPayload = typeof payload === 'object' && payload !== null && 'error' in payload
        ? (payload as { error: ApiFailure }).error
        : null
      throw new ApiError(
        response.status,
        errorPayload?.code ?? 'REQUEST_FAILED',
        errorPayload?.message ?? 'The request could not be completed.',
        errorPayload?.details,
      )
    }
    return payload as T
  },
}
