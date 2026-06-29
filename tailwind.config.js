/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FE', // Very soft blue-tinted white
        card: '#FFFFFF',
        lavender: '#B39DDB', // Playful purple
        softblue: '#90CAF9', // Soft light blue
        mint: '#A5D6A7', // Fresh mint green
        slate: '#334155', // Elegant dark text instead of brown/black
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'polaroid': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    },
  },
  plugins: [],
}
