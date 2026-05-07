import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        saturn: {
          900: "#020617",
          800: "#111827",
          700: "#1f2937",
          600: "#334155",
          500: "#64748b",
          accent: "#7c3aed"
        }
      }
    }
  },
  plugins: []
};

export default config;
