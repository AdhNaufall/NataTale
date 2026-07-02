/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFD', // Even softer background
        card: '#FFFFFF',
        lavender: '#BBA2E3', // Slightly more saturated
        softblue: '#98CFF9', 
        mint: '#A8DFB1',
        slate: '#2C3545', // Deeper, more elegant slate
        rose: '#F4CFDF', // New accent color
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'polaroid': '0 15px 35px -5px rgba(0, 0, 0, 0.04), 0 10px 15px -6px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'clay-card': '8px 8px 16px rgba(0, 0, 0, 0.04), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.03)',
        'clay-btn': '4px 4px 8px rgba(0, 0, 0, 0.04), -4px -4px 8px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.03)',
        'clay-btn-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.04), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
        'clay-input': 'inset 4px 4px 8px rgba(0, 0, 0, 0.04), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
