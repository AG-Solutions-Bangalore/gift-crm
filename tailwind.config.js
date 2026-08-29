/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#110e2e',       // Deep navy/indigo sidebar background
          darker: '#0b091f',     // Even darker navy for borders/accents
          card: '#1a163d',       // Slightly lighter navy for sidebar active item/hover
          purple: '#6c5ce7',     // Main vibrant purple ribbon/button color
          purpleHover: '#5a4bcf',
          lightPurple: '#f0eeff',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
