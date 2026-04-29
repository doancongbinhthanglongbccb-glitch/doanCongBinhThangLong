import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Noto Sans'", "sans-serif"],
        serif: ["'Noto Serif'", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        admin: {
          border: "hsl(var(--admin-border))",
          "border-muted": "hsl(var(--admin-border-muted))",
          "border-empty": "hsl(var(--admin-border-empty))",
          "surface-muted": "hsl(var(--admin-surface-muted))",
          stat: {
            primary: {
              border: "hsl(var(--admin-stat-primary-border))",
              bg: "hsl(var(--admin-stat-primary-bg))",
              fg: "hsl(var(--admin-stat-primary-fg))",
            },
            success: {
              border: "hsl(var(--admin-stat-success-border))",
              bg: "hsl(var(--admin-stat-success-bg))",
              fg: "hsl(var(--admin-stat-success-fg))",
            },
            warning: {
              border: "hsl(var(--admin-stat-warning-border))",
              bg: "hsl(var(--admin-stat-warning-bg))",
              fg: "hsl(var(--admin-stat-warning-fg))",
            },
            secondary: {
              border: "hsl(var(--admin-stat-secondary-border))",
              bg: "hsl(var(--admin-stat-secondary-bg))",
              fg: "hsl(var(--admin-stat-secondary-fg))",
            },
          },
        },
      },
      spacing: {
        "admin-card": "var(--admin-pad-card)",
        "admin-card-sm": "var(--admin-pad-card-sm)",
        "admin-section": "var(--admin-gap-section)",
        "admin-grid": "var(--admin-gap-grid)",
        "admin-stack": "var(--admin-gap-stack)",
        "admin-tight": "var(--admin-gap-tight)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "admin-card": "var(--admin-radius-card)",
      },
      letterSpacing: {
        "admin-label": "0.18em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
