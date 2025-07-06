import { useState, useEffect } from 'react'

export function useTestMode() {
  const [isTestMode, setIsTestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage first for faster initial load
    const storedMode = localStorage.getItem('slam_offer_test_mode')
    if (storedMode) {
      setIsTestMode(storedMode === 'true')
      setIsLoading(false)
    }
  }, [])

  return {
    isTestMode,
    isLoading,
  }
}
