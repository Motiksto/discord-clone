/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0d0d0f',
        'bg-panel': '#12101a',
        'bg-sidebar': '#0f0d16',
        'accent-purple': '#9d4edd',
        'accent-red': '#ff2d55',
        'text-main': '#e8e0f0',
        'text-muted': '#7c6f8a'
      }
    }
  },
  plugins: []
}
