/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070C12",
        panel: "#101823",
        panelSoft: "#122131",
        line: "#213449",
        brand: "#10B981",
        accent: "#22D3EE",
        textMain: "#E5EDF7",
        textSub: "#96A6B8",
        danger: "#FB7185",
        warning: "#FBBF24"
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.08)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.14), transparent 35%)"
      },
      animation: {
        ticker: "ticker 22s linear infinite"
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};
