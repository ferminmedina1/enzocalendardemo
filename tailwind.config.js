/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/**/**/**/**/*.{js,ts,jsx,tsx}',
    './src/**/**/**/**/**/**/**/**/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { opacity: 0, transform: 'translateX(100%)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
};
