/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        customGray: '#221f20',
        customGray2: '#f9f9f9',
        customOrange: '#fc6200',
      },
      height: {
        'footer': '180px',
      },
      gridTemplateRows: {
        'layout': '60px 1fr 100px',
      }
    },
  },
  plugins: [],
}

