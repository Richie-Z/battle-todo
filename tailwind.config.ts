import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{tsx,ts,jsx,js,html}"],
  theme: {
    extend: {
      animation: {
        shake: "shake 0.3s ease-in-out",
        float: "float 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease",
        "damage-pop": "damage-pop 1s ease-out forwards",
        "heal-pop": "heal-pop 1s ease-out forwards",
        "winner-celebrate": "winner-celebrate 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "damage-pop": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-60px) scale(1.5)", opacity: "0" },
        },
        "heal-pop": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-60px) scale(1.5)", opacity: "0" },
        },
        "winner-celebrate": {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%": { transform: "scale(1.05) rotate(2deg)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
