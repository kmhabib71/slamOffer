'use client'

export async function fetchWithAuth(url: string, options: RequestInit) {
  const token = localStorage.getItem('authToken') || ''

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    // Handle unauthorized access
    console.error('Unauthorized access - Token might be expired or invalid')
    // Optionally redirect to login page
  }

  return response
}
