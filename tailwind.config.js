/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#08211C',
          900: '#123B33',
          700: '#165A4A',
          500: '#1E826C',
        },
        pine: {
          50: '#e8f3f1',
          100: '#c5e2dd',
          600: '#125950',
          700: '#0D4740',
          800: '#093630',
          900: '#062420',
          950: '#031714',
        },
        lime: {
          100: '#f1fbe5',
          200: '#e0f6c8',
          300: '#d0f0ab',
          400: '#C2E8A2',
          500: '#addb88',
          600: '#8ec464',
        },
        sage: {
          50: '#F8FAF9',
          100: '#EDF4F1',
          200: '#E1EAE7',
          300: '#D1DFDC',
          400: '#B0C4BF',
          500: '#7D9692',
          600: '#5C7470',
          700: '#3E5450',
          800: '#263B37',
          900: '#122A26',
        },
        semantic: {
          warning: '#DC8B17',
          critical: '#D92D20',
          success: '#16845B',
          legal: '#6B21A8',
          info: '#2563EB',
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '28px',
      }
    },
  },
  plugins: [],
}
