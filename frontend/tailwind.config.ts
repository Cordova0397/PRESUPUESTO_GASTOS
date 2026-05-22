import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f7ff",
          100: "#dcecff",
          200: "#bddbff",
          300: "#8fc3ff",
          400: "#59a1ff",
          500: "#2f7cf6",
          600: "#1f63d8",
          700: "#1d4fae",
          800: "#1d438d",
          900: "#1d3a73"
        },
        ink: {
          950: "#0f172a"
        },
        mist: "#eef4fb",
        sand: "#f8f4ed"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "dashboard-glow":
          "radial-gradient(circle at top left, rgba(47, 124, 246, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(15, 23, 42, 0.12), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
