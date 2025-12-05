import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
      heading: ["Inter", "ui-sans-serif", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
      mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        accent: {
          DEFAULT: "#F5F5F5",
          subtle: "#E5E5E5",
          line: "rgba(0,0,0,0.08)",
        },
      },
      borderColor: {
        subtle: "rgba(0,0,0,0.12)",
      },
      borderRadius: {
        md: "8px",
        lg: "10px",
      },
      spacing: {
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
}

export default config

