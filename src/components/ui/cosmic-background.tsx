'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  color: string
}

export function CosmicBackground() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const colors = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f97316']
    const newStars: Star[] = []

    // Reduced number of stars for cleaner look
    for (let i = 0; i < 25; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5, // Smaller, more subtle stars
        duration: Math.random() * 4 + 3, // Slower animation
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Much darker gradient background for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

      {/* Minimal accent elements with better visibility */}
      <div className="absolute top-20 right-20 w-1 h-32 bg-gradient-to-b from-electric-blue/30 to-transparent rounded-full" />
      <div className="absolute bottom-20 left-20 w-1 h-24 bg-gradient-to-t from-purple-magic/30 to-transparent rounded-full" />

      {/* More subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '25px 25px',
        }}
      />
    </div>
  )
}
