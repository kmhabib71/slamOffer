import { useState, useEffect, useCallback } from 'react'

interface BackgroundJob {
  id: string
  offerId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  createdAt: string
  updatedAt: string
  processingStartedAt?: string
  completedAt?: string
}

interface UseBackgroundJobsReturn {
  jobs: BackgroundJob[]
  loading: boolean
  error: string | null
  startBackgroundGeneration: (
    offerId: string,
    businessContext: any,
    isRegeneration?: boolean
  ) => Promise<string>
  checkJobStatus: (jobId: string) => Promise<BackgroundJob | null>
  refreshJobs: () => Promise<void>
  getJobByOfferId: (offerId: string) => BackgroundJob | null
  hasCompletedJob: (offerId: string) => boolean
  hasFailedJob: (offerId: string) => boolean
  isPending: (offerId: string) => boolean
  isProcessing: (offerId: string) => boolean
}

export function useBackgroundJobs(): UseBackgroundJobsReturn {
  const [jobs, setJobs] = useState<BackgroundJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all user's background jobs
  const refreshJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/background-generation')
      if (!response.ok) {
        throw new Error('Failed to fetch background jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Start a background generation job
  const startBackgroundGeneration = useCallback(
    async (
      offerId: string,
      businessContext: any,
      isRegeneration: boolean = false
    ): Promise<string> => {
      try {
        const response = await fetch('/api/background-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offerId,
            businessContext,
            isRegeneration,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to start background generation')
        }

        const data = await response.json()

        // Refresh jobs to include the new one
        await refreshJobs()

        return data.jobId
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        throw err
      }
    },
    [refreshJobs]
  )

  // Check specific job status
  const checkJobStatus = useCallback(async (jobId: string): Promise<BackgroundJob | null> => {
    try {
      const response = await fetch(`/api/background-generation?jobId=${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to check job status')
      }

      const data = await response.json()
      return data.job
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [])

  // Helper functions to check job status by offer ID
  const getJobByOfferId = useCallback(
    (offerId: string): BackgroundJob | null => {
      return jobs.find(job => job.offerId === offerId) || null
    },
    [jobs]
  )

  const hasCompletedJob = useCallback(
    (offerId: string): boolean => {
      const job = getJobByOfferId(offerId)
      return job?.status === 'completed'
    },
    [getJobByOfferId]
  )

  const hasFailedJob = useCallback(
    (offerId: string): boolean => {
      const job = getJobByOfferId(offerId)
      return job?.status === 'failed'
    },
    [getJobByOfferId]
  )

  const isPending = useCallback(
    (offerId: string): boolean => {
      const job = getJobByOfferId(offerId)
      return job?.status === 'pending'
    },
    [getJobByOfferId]
  )

  const isProcessing = useCallback(
    (offerId: string): boolean => {
      const job = getJobByOfferId(offerId)
      return job?.status === 'processing'
    },
    [getJobByOfferId]
  )

  // Auto-refresh jobs periodically
  useEffect(() => {
    // Initial fetch
    refreshJobs()

    // Set up periodic refresh for active jobs
    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(
        job => job.status === 'pending' || job.status === 'processing'
      )

      if (hasActiveJobs) {
        refreshJobs()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [refreshJobs, jobs])

  // Listen for page visibility changes to refresh when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshJobs()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshJobs])

  return {
    jobs,
    loading,
    error,
    startBackgroundGeneration,
    checkJobStatus,
    refreshJobs,
    getJobByOfferId,
    hasCompletedJob,
    hasFailedJob,
    isPending,
    isProcessing,
  }
}

// Hook for tracking a specific job
export function useBackgroundJob(jobId: string | null) {
  const [job, setJob] = useState<BackgroundJob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    if (!jobId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/background-generation?jobId=${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to check job status')
      }

      const data = await response.json()
      setJob(data.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  // Auto-refresh while job is active
  useEffect(() => {
    if (!jobId) return

    // Initial check
    checkStatus()

    // Set up periodic refresh for active jobs
    const interval = setInterval(() => {
      if (job?.status === 'pending' || job?.status === 'processing') {
        checkStatus()
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [jobId, job?.status, checkStatus])

  return {
    job,
    loading,
    error,
    checkStatus,
    isCompleted: job?.status === 'completed',
    isFailed: job?.status === 'failed',
    isPending: job?.status === 'pending',
    isProcessing: job?.status === 'processing',
  }
}
