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
          50: '#FDFBF7',
          100: '#F7F3EA',
          200: '#EFE8DA',
          300: '#E2D5C0',
          400: '#CFC0A4',
        },
        espresso: {
          950: '#140D08',
          900: '#1E140D',
          850: '#2A1C13',
          800: '#38261B',
          700: '#4D3627',
          600: '#644734',
        },
        coffee: {
          50: '#FAF5F0',
          100: '#F2E8DC',
          200: '#E5D2BE',
          300: '#D2B699',
          400: '#B6916F',
          500: '#8C6543',
          600: '#734E31',
          700: '#5C3C24',
          800: '#462C19',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FCEBE6',
          200: '#F9D4C8',
          300: '#F4B49F',
          400: '#EB8A6D',
          500: '#DE6441',
          600: '#C84D2A',
          700: '#A4391C',
        },
        caramel: {
          50: '#FEF9EE',
          100: '#FDF1D5',
          200: '#FBE1AA',
          300: '#F8CD75',
          400: '#F4B340',
          500: '#E2971B',
          600: '#C27612',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(42, 28, 19, 0.06), 0 2px 6px -1px rgba(42, 28, 19, 0.04)',
        'warm-md': '0 10px 25px -3px rgba(42, 28, 19, 0.08), 0 4px 10px -2px rgba(42, 28, 19, 0.05)',
        'warm-lg': '0 20px 35px -4px rgba(42, 28, 19, 0.12), 0 8px 16px -4px rgba(42, 28, 19, 0.08)',
        'warm-xl': '0 25px 50px -12px rgba(42, 28, 19, 0.18)',
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
