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
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "2rem",
        xl: "2rem",
      },
    },
    extend: {
      maxWidth: {
        site: "1200px",
      },
      colors: {
        // Base backgrounds
        background: "#f3f4f6", // Soft warm gray for main page background
        foreground: "#020617", // Primary text color
        
        // Surfaces / cards
        surface: {
          DEFAULT: "#ffffff", // Primary card background
          alt: "#f9fafb", // Subtle alternate surface
        },
        
        // Primary brand accent (indigo)
        primary: {
          DEFAULT: "#4f46e5", // Primary accent
          foreground: "#FFFFFF",
          hover: "#4338ca", // Primary accent hover
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        
        // Secondary accent (success / highlights)
        secondary: {
          DEFAULT: "#22c55e", // Success / highlights
          foreground: "#FFFFFF",
        },
        
        // Destructive
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        
        // Muted colors
        muted: {
          DEFAULT: "#f9fafb", // Muted background
          foreground: "#6b7280", // Muted text
        },
        
        // Border
        border: "#e5e7eb",
        
        // Dark sections (header/footer accents)
        dark: {
          DEFAULT: "#0f172a",
          alt: "#0b1220",
          deep: "#020617",
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
        
        // Focus ring
        ring: "#4f46e5",
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
        "section-lg": "3rem",
        "section-sm": "1.5rem",
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

