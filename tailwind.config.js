/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f3f4f6',
          text: '#111827',
          'text-secondary': '#6b7280',
          border: '#e5e7eb',
        },
        // Dark mode colors (default)
        dark: {
          bg: '#000000',
          'bg-secondary': '#0a0a0a',
          text: '#ffffff',
          'text-secondary': '#9ca3af',
          border: '#1f2937',
        },
        // OMEGA Design System
        omega: {
          dark: '#050505', // Fondo principal
          card: '#0F1115', // Paneles
          border: '#1E293B',
        },
        neon: {
          green: '#00FF94', // Bullish / Win
          red: '#FF0055',   // Bearish / Risk
          blue: '#00D2FF',  // Neural / AI
          yellow: '#FFD600' // Warning
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
};
