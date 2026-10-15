import typography from '@tailwindcss/typography'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // we'll toggle dark mode manually (always dark in this setup)
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
}
