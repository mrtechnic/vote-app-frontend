/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb', // Light gray 
        foreground: '#111827', // Dark text 
        border: '#e5e7eb',
        primary: {
          500: '#8b5cf6', // Purple-500
          600: '#7c3aed', // Purple-600
          700: '#6d28d9', // Purple-700
        },
      },
    },
  },
  plugins: [],
}
