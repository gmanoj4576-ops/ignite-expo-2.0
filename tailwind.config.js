/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0a0a0a",
        neon: {
          blue: "#00f3ff",
          purple: "#bc13fe",
          pink: "#ff00ff",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00f3ff, 0 0 40px #00f3ff',
        'neon-purple': '0 0 10px #bc13fe, 0 0 40px #bc13fe',
        'btn-shadow': '0 0 20px rgba(0,243,255,0.4)',
      }
    },
  },
  plugins: [],
}
