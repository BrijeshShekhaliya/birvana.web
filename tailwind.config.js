/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#070707",
          card: "#111111",
          elevated: "#1A1A1A",
          active: "#222222",
          borderSubtle: "#1F1F1F",
          borderStrong: "#2A2A2A",
          primary: "#1DB954",
          accentDim: "#0C3320",
          accentGlow: "rgba(29,185,84,0.15)",
          textPrimary: "#FFFFFF",
          textSecondary: "#AAAAAA",
          textMuted: "#555555",
          danger: "#E24B4A",
          warning: "#EF9F27"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      animation: {
        'aurora-slow': 'aurora 20s infinite alternate ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out'
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95) rotate(240deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(360deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}
