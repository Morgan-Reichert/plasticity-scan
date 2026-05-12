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
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease forwards',
        pulseRing: 'pulseRing 2s ease-in-out infinite',
        shimmer: 'shimmer 3s ease infinite',
      },
    },
  },
  plugins: [],
}
