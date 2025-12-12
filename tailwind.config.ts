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
        // New professional color palette
        accent: {
          DEFAULT: "#6C5CE7",
          hover: "#5A4ED0",
          active: "#4D3FC0",
          light: "#ECE9FF",
        },
        bg: {
          primary: "#F7F7F5",
          secondary: "#FFFFFF",
          strip: "#F0EFEB",
        },
        text: {
          primary: "#1F2937",
          secondary: "#4B5563",
          muted: "#6B7280",
        },
        border: {
          subtle: "#E5E7EB",
          hover: "#DADCE2",
        },
        
        // Keep for backward compatibility but map to new colors
        background: "#F7F7F5",
        foreground: "#1F2937",
        
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F0EFEB",
        },
        
        primary: {
          DEFAULT: "#6C5CE7",
          foreground: "#FFFFFF",
          hover: "#5A4ED0",
        },
        
        secondary: {
          DEFAULT: "#22c55e",
          foreground: "#FFFFFF",
        },
        
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        
        muted: {
          DEFAULT: "#F0EFEB",
          foreground: "#6B7280",
        },
        
        // Slate palette for consistency
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        
        ring: "#6C5CE7",
      },
      borderColor: {
        subtle: "rgba(0,0,0,0.12)",
        DEFAULT: "rgba(0,0,0,0.12)",
      },
      borderRadius: {
        DEFAULT: "0.75rem", // 12px - rounded-xl default
        sm: "0.5rem", // 8px
        md: "0.625rem", // 10px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px - primary for cards
        "2xl": "1.25rem", // 20px
        full: "9999px", // For pills and rounded buttons
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
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // Cards default
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)", // Cards hover
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        nav: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // Nav & sticky header
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
}

export default config

