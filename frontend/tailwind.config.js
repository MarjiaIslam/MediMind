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
          100: "#E3EBE3",
          300: "#BCCFB4",
          500: "#8A9A5B",
          700: "#5F6F46",
        },
        lavender: {
          100: "#F3F3FC",
          300: "#DCDCF7",
          500: "#B6B6E5",
          700: "#8A8AC2",
        }
      }
    },
  },
  plugins: [],
}