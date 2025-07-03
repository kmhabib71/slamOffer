/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
      },
      colors: {
        'cosmic-dark': '#0a0f1c',
        'cosmic-slate': '#1a1f2e',
        'cosmic-light': '#f8fafc',
        'cosmic-gray': '#64748b',
        'electric-blue': '#0ea5e9',
        'purple-magic': '#8b5cf6',
        'success-green': '#22c55e',
        'warning-orange': '#f97316',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
        'magic-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 70%, #0f172a 100%)',
      },
      boxShadow: {
        'magic-glow': '0 0 30px rgba(14, 165, 233, 0.4)',
        'purple-glow': '0 0 30px rgba(139, 92, 246, 0.4)',
        cosmic: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
