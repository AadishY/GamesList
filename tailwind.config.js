/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-yellow': '#facc15',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899',
        'neon-purple': '#a855f7',
        'neon-green': '#84cc16',
        'neon-orange': '#f97316',
      }
    },
  },
  plugins: [],
}
