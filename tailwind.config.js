/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#F0F4FF',
          900: '#E8EEFF',
          800: '#F8FAFC',
          700: '#E2E8F0',
          600: '#CBD5E1',
        },
        electric: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        cyan: {
          scan: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0F9689',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.4)', opacity: '0' },
        },
        pulseOut: {
          '0%':   { transform: 'scale(0.7)', opacity: '0.6' },
          '100%': { transform: 'scale(2.0)', opacity: '0' },
        },
        scanSweep: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        coreBreathe: {
          '0%, 100%': { transform: 'scale(1)',     filter: 'brightness(1)' },
          '50%':       { transform: 'scale(1.08)',  filter: 'brightness(1.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease forwards',
        pulseRing: 'pulseRing 2s ease-in-out infinite',
        pulseOut:  'pulseOut 3s ease-out infinite',
        scanSweep: 'scanSweep 2.5s linear infinite',
        coreBreathe:'coreBreathe 2.4s ease-in-out infinite',
        shimmer: 'shimmer 3s ease infinite',
      },
    },
  },
  plugins: [],
}
