interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiClient(url: string, options: FetchOptions = {}) {
  const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken')

  const headers = new Headers(options.headers || {})
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)

  }
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })
  
  return response
}

export async function apiGet(url: string) {
  return apiClient(url, { method: 'GET' })
}

export async function apiPost(url: string, data?: any) {
  return apiClient(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
}

export async function apiPut(url: string, data?: any) {
  return apiClient(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

export async function apiDelete(url: string) {
  return apiClient(url, { method: 'DELETE' })
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