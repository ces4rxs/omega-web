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
      },
    },
  },
  plugins: [],
};
