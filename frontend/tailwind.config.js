/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'med-blue': '#007BFF',
        'med-bg': '#F8FAFC',
        'med-white': '#FFFFFF',
      },
      borderRadius: {
        'med': '12px',
      }
    },
  },
  plugins: [],
}
