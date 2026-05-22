import type { Config } from "tailwindcss";

function token(name: string) {
  return `hsl(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          foreground: token("primary-foreground"),
          soft: token("primary-soft"),
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          foreground: token("accent-foreground"),
        },
        success: {
          DEFAULT: token("success"),
          soft: token("success-soft"),
          foreground: token("success-foreground"),
        },
        warning: {
          DEFAULT: token("warning"),
          soft: token("warning-soft"),
          foreground: token("warning-foreground"),
        },
        danger: {
          DEFAULT: token("danger"),
          soft: token("danger-soft"),
          foreground: token("danger-foreground"),
        },
        bg: token("bg"),
        surface: {
          DEFAULT: token("surface"),
          muted: token("surface-muted"),
          strong: token("surface-strong"),
        },
        overlay: token("overlay"),
        dark: {
          DEFAULT: token("dark"),
          soft: token("dark-soft"),
          foreground: token("dark-foreground"),
          "foreground-muted": token("dark-foreground-muted"),
        },
        text: {
          DEFAULT: token("text"),
          muted: token("text-muted"),
          subtle: token("text-subtle"),
          inverse: token("text-inverse"),
        },
        border: {
          DEFAULT: token("border"),
          strong: token("border-strong"),
        },
        ring: token("ring"),
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 4px 10px -2px rgb(0 0 0 / 0.08), 0 2px 6px -1px rgb(0 0 0 / 0.06)",
        nav: "0 2px 4px 0 rgb(0 0 0 / 0.08)",
        elevated: "0 10px 30px -10px rgb(0 0 0 / 0.18)",
      },
      maxWidth: {
        page: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
