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
        cosmic: {
          dark: '#0a0f1c',
          slate: '#1a1f2e',
          light: '#f8fafc',
          gray: '#64748b',
        },
        electric: {
          blue: '#0ea5e9',
        },
        purple: {
          magic: '#8b5cf6',
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
        'magic-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 70%, #0f172a 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}