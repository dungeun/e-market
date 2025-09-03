interface FetchOptions extends RequestInit {
  token?: string
  requireAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function apiClient(url: string, options: FetchOptions = {}) {
  const { requireAuth = true, ...fetchOptions } = options
  
  // Check if running in browser
  if (typeof window === 'undefined') {
    throw new Error('apiClient can only be used in browser environment')
  }
  
  const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken')
  
  console.log('[API Client] Request to:', url)
  console.log('[API Client] Token exists:', !!token)
  console.log('[API Client] Require auth:', requireAuth)

  const headers = new Headers(fetchOptions.headers || {})
  
  // Check if auth is required but no token available
  if (requireAuth && !token) {
    console.error('[API Client] No authentication token available')
    // Redirect to login if in admin area
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname)
    }
    throw new Error('Authentication required - No token found')
  }
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include'
  })
  
  console.log('[API Client] Response status:', response.status)
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    console.error('[API Client] 401 Unauthorized - Token may be invalid')
    // Clear invalid token
    localStorage.removeItem('accessToken')
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    
    // Redirect to login if in admin area
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname)
    }
    throw new Error('Authentication failed - Invalid token')
  }
  
  // Handle 403 Forbidden
  if (response.status === 403) {
    console.error('[API Client] 403 Forbidden - Insufficient permissions')
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Forbidden - Admin access required')
  }
  
  return response
}

export async function apiGet(url: string, options?: FetchOptions) {
  return apiClient(url, { ...options, method: 'GET' })
}

export async function apiPost(url: string, data?: unknown, options?: FetchOptions) {
  return apiClient(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
}

export async function apiPut(url: string, data?: unknown, options?: FetchOptions) {
  return apiClient(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

export async function apiDelete(url: string, options?: FetchOptions) {
  return apiClient(url, { ...options, method: 'DELETE' })
}

export async function apiUpload(url: string, formData: FormData) {
  const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken')
  
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include'
  })
}

// Helper function for admin API calls with better error handling
export async function adminApiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    console.log('[Admin API] Calling:', url)
    const response = await apiClient(url, { ...options, requireAuth: true })
    
    let data
    try {
      data = await response.json()
    } catch (e) {
      console.error('[Admin API] Failed to parse JSON response')
      return {
        success: false,
        error: 'Invalid response format'
      }
    }
    
    if (!response.ok) {
      console.error('[Admin API] Request failed:', response.status, data)
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${response.status}`,
        data: data.details
      }
    }
    
    console.log('[Admin API] Success:', data)
    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('[Admin API] Call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}