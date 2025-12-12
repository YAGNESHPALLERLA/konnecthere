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
        // Premium Modern Grey Palette (Option 2 - Recommended)
        // Backgrounds
        background: {
          primary: "#F8F9FA", // Soft grey main background
          secondary: "#FFFFFF", // White for cards/components
        },
        foreground: {
          primary: "#1D1D1F", // Near-black primary text
          secondary: "#6E6E73", // Medium grey secondary text
        },
        
        // Surfaces / cards
        surface: {
          DEFAULT: "#FFFFFF", // Primary card background
          alt: "#F8F9FA", // Subtle alternate surface
          card: "#FFFFFF", // Card surface
        },
        
        // Primary brand accent (indigo-violet)
        primary: {
          DEFAULT: "#6366F1", // Primary accent (indigo-500)
          foreground: "#FFFFFF",
          hover: "#4F46E5", // Darker indigo on hover
          active: "#4338CA", // Active state
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        
        // Accent colors (semantic)
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          active: "#4338CA",
          muted: "#EEF2FF", // Light indigo background
        },
        
        // Secondary accent (success / highlights)
        secondary: {
          DEFAULT: "#10B981", // Emerald green
          foreground: "#FFFFFF",
        },
        
        // Destructive
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        
        // Status colors
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        
        // Muted colors
        muted: {
          DEFAULT: "#F8F9FA", // Muted background
          foreground: "#6E6E73", // Muted text
        },
        
        // Border
        border: {
          DEFAULT: "#D2D2D7", // Light grey border
          subtle: "#D2D2D7",
          hover: "#A1A1AA", // Darker on hover
        },
        
        // Text colors
        text: {
          primary: "#1D1D1F",
          secondary: "#6E6E73",
          muted: "#9CA3AF",
        },
        
        // Dark sections (header/footer accents)
        dark: {
          DEFAULT: "#1D1D1F",
          alt: "#0F172A",
          deep: "#020617",
        },
        
        // Slate palette for consistency (kept for backward compatibility)
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
        ring: "#6366F1",
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
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.02)", // Cards default - softer
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)", // Cards hover - premium feel
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        nav: "0 1px 2px 0 rgba(0, 0, 0, 0.04)", // Nav & sticky header
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)", // Card shadow
        "card-hover": "0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Card hover elevation
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Smooth easing
      },
    },
  },
  plugins: [],
}

export default config

