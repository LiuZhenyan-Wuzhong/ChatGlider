/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%'
      }
    }
  },
  plugins: []
}
