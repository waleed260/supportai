export interface ApiClientConfig {
  baseUrl: string
  getAuthToken: () => Promise<string | null>
  onError?: (error: ApiError) => void
  timeout?: number
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public endpoint: string,
  ) {
    super(`API ${status}: ${body}`)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(public originalError: unknown) {
    super('Network request failed')
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(public endpoint: string) {
    super(`Request timed out: ${endpoint}`)
    this.name = 'TimeoutError'
  }
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getAuthToken, onError, timeout = 30000 } = config

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { signal?: AbortSignal },
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const token = await getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal ?? controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        const error = new ApiError(res.status, text, path)
        onError?.(error)
        throw error
      }

      if (res.status === 204) return undefined as T
      return res.json()
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof ApiError) throw err
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new TimeoutError(path)
      }
      throw new NetworkError(err)
    }
  }

  return {
    get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, { signal }),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
  }
}
