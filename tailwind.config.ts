import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8B4D',
        secondary: '#D4A574',
        accent: '#A8D5BA',
        light: '#FFF9F5',
        dark: '#2C2C2C',
      },
    },
  },
  plugins: [],
} satisfies Config
