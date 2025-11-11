/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#020617",
          "bg-secondary": "#0b1220",
          text: "#f8fafc",
          "text-secondary": "#94a3b8",
          border: "#1e293b",
        },
        accent: {
          cyan: "#22d3ee",
          amber: "#fbbf24",
        },
      },
      boxShadow: {
        glow: "0 0 45px rgba(34, 211, 238, 0.25)",
      },
    },
  },
  plugins: [],
}
