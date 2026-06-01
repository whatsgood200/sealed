import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          50: "#f4f4f8",
          100: "#e8e8f0",
          200: "#c6c6d8",
          300: "#9494b4",
          400: "#6a6a96",
          500: "#4a4a78",
          600: "#33335a",
          700: "#22223c",
          800: "#14141f",
          900: "#0A0A0F",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FDE68A",
          dark: "#92400E",
        },
        emerald: {
          DEFAULT: "#10B981",
          light: "#A7F3D0",
          dark: "#065F46",
        },
        crimson: {
          DEFAULT: "#EF4444",
          light: "#FCA5A5",
          dark: "#7F1D1D",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "tick": "tick 1s steps(1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-in": "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245, 158, 11, 0)" },
        },
        tick: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, #22223c 1px, transparent 1px)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.08) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
