/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': '#0c0c10',
        'surface': '#fff',
        'muted': '#6b7280',
        'border': '#e5e7eb',
        'pill': '#f3f4f6',
        'green': '#16a34a',
        'amber': '#d97706',
        'blue': '#2563eb',
        'red': '#dc2626',
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}