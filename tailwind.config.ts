import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#ea580c',
          600: '#dc2626',
        }
      },
      keyframes: {
        'pulse-orange': {
          '0%': { boxShadow: '0 0 0 0 rgba(234,88,12,0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(234,88,12,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(234,88,12,0)' },
        }
      },
      animation: {
        'pulse-orange': 'pulse-orange 1.8s infinite',
      }
    },
  },
  plugins: [],
}
export default config
