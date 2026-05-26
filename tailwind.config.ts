import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4d9a8',
          300: '#ecbe6e',
          400: '#e29e3a',
          500: '#d4841e',
          600: '#b86815',
          700: '#964f14',
          800: '#7a3f17',
          900: '#653516',
        },
        surface: {
          50:  '#fafaf9',
          100: '#f4f3f0',
          200: '#e8e5df',
          300: '#d4cfc6',
          400: '#b8b0a4',
          500: '#9c9286',
          600: '#7d7368',
          700: '#635a50',
          800: '#4a4039',
          900: '#1a1512',
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}

export default config
