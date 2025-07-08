'use client'

import { getSession } from 'next-auth/react'

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('No authenticated user found')
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

export async function fetchWithAuthServer(url: string, options: RequestInit = {}) {
  // This is for server-side usage where we need to pass session manually
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}
