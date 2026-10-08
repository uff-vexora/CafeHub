/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          25: '#FCFAF7',
          50: '#F9F6F0',
          100: '#F3EDE2',
          200: '#E9DFC9',
          300: '#DCB894',
          400: '#C7A277',
        },
        espresso: {
          950: '#120B07',
          900: '#18100A',
          850: '#23160F',
          800: '#322016',
          700: '#462E20',
          600: '#5F3E2B',
        },
        coffee: {
          50: '#F8F4EE',
          100: '#EEE4D5',
          200: '#DECAB1',
          300: '#C9A986',
          400: '#A9825F',
          500: '#845F40',
          600: '#6B4A30',
          700: '#533722',
          800: '#3D2717',
        },
        terracotta: {
          50: '#FAF3F0',
          100: '#F6E5E0',
          200: '#EDC8BD',
          300: '#E0A391',
          400: '#D2765E',
          500: '#C2573B',
          600: '#AD4329',
          700: '#8D321D',
        },
        caramel: {
          50: '#FDFBF4',
          100: '#FAF4E3',
          200: '#F3E4C0',
          300: '#E8CD94',
          400: '#D9B064',
          500: '#C6933B',
          600: '#A77526',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E4EDE7',
          200: '#C8DBD0',
          300: '#A3C2B0',
          400: '#7FA68E',
          500: '#5E896F',
          600: '#4A6E58',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(24, 16, 10, 0.05), 0 2px 6px -1px rgba(24, 16, 10, 0.03)',
        'warm-md': '0 10px 25px -3px rgba(24, 16, 10, 0.08), 0 4px 10px -2px rgba(24, 16, 10, 0.04)',
        'warm-lg': '0 20px 35px -4px rgba(24, 16, 10, 0.12), 0 8px 16px -4px rgba(24, 16, 10, 0.06)',
        'warm-xl': '0 25px 50px -12px rgba(24, 16, 10, 0.18)',
        'ceramic': '0 12px 30px -6px rgba(18, 11, 7, 0.25), 0 4px 12px -2px rgba(18, 11, 7, 0.15)',
        'glow-dawn': '0 0 60px rgba(217, 176, 100, 0.22), 0 0 100px rgba(194, 87, 59, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
