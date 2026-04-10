import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fbf8f2",
          100: "#f4eee3",
          200: "#e5dac8",
          300: "#d2c3aa"
        },
        ink: {
          900: "#172126",
          800: "#24353d",
          700: "#35505b",
          600: "#4c6973"
        },
        sage: {
          500: "#5f8073",
          600: "#456457"
        },
        rust: {
          400: "#c28d70",
          500: "#a56f53"
        },
        mist: {
          100: "#eef2f2",
          200: "#d9e2e0"
        }
      },
      fontFamily: {
        sans: ["SF Pro Display", "PingFang TC", "Noto Sans TC", "Helvetica Neue", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Noto Serif TC", "serif"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(20, 34, 40, 0.08)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        rise: "rise 0.55s ease-out both",
        pulseLine: "pulseLine 3.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
