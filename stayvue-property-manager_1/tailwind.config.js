/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f4f7f2', 100:'#e4ebe0', 200:'#c9d7c1', 300:'#a6bd99', 400:'#7f9e6e', 500:'#5A7F4B', 600:'#476B3A', 700:'#385530', 800:'#2d4427', 900:'#243820' },
        surface: { 50:'#fafaf8', 100:'#f5f5f2', 200:'#eae9e4', 300:'#d9d7d1' },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
