/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F4F0E8',
          200: '#EAE4D8',
          300: '#DDD5C4',
          400: '#C7BC9F',
          500: '#AFA284',
          600: '#8E8164',
          700: '#6E634A',
          800: '#504835',
          900: '#342F23',
        },
        bronze: {
          DEFAULT: '#845625',
          light: '#9E7844',
          dark: '#684218',
        },
        ink: {
          DEFAULT: '#19181B',
          soft: '#2D2C31',
          muted: '#5E5B66',
          light: '#8E8A96',
        }
      },
      fontFamily: {
        thai: ['"IBM Plex Sans Thai"', '"Prompt"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Thai"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(25, 24, 27, 0.04), 0 2px 6px -1px rgba(25, 24, 27, 0.02)',
        'soft-hover': '0 12px 32px -4px rgba(25, 24, 27, 0.08), 0 4px 12px -2px rgba(25, 24, 27, 0.03)',
        'modal': '0 24px 60px -12px rgba(25, 24, 27, 0.16)',
      }
    },
  },
  plugins: [],
}
