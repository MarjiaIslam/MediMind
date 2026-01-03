/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e3ebe5',
          200: '#c5d8c9',
          300: '#9ebca6',
          500: '#5c7a65',
        },
        lavender: {
          50: '#f8f7fc',
          100: '#efebf9',
          200: '#ddd6f3',
          400: '#9d8ec4',
          600: '#6a5a94',
        }
      }
    },
  },
  plugins: [],
}
