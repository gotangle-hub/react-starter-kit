import type { Config } from "tailwindcss";

/**
 * Tangle Tailwind theme — ported from tokens/*.css and app/theme.jsx.
 * Colours resolve to CSS variables defined in src/index.css, so the
 * G15 light/dark swap lives in one place (the .dark overrides) and
 * every utility (bg-tg-yellow, text-tg-blue-accent, …) swaps for free.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* shadcn/ui semantic */
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        /* Tangle brand palette (these are what the swap acts on) */
        tg: {
          blue: "var(--tg-blue)", // FILL-only, never swaps
          "blue-accent": "var(--tg-blue-accent)", // text/icon/border — swaps to yellow in dark
          yellow: "var(--tg-yellow)", // chip bg — swaps to blue in dark
          ink: "var(--tg-ink)",
          "ink-soft": "var(--tg-ink-soft)",
          brown: "var(--tg-brown)",
          "brown-soft": "var(--tg-brown-soft)",
          bg: "var(--tg-bg)",
          stone2: "var(--tg-stone2)",
          card: "var(--tg-card)",
          line: "var(--tg-line)",
          "line-soft": "var(--tg-line-soft)",
          cream: "var(--tg-cream)",
          terra: "var(--tg-terra)",
          purple: "var(--tg-purple)",
          emph: "var(--tg-emph)",
          "emph-text": "var(--tg-emph-text)",
          inv: "var(--tg-inv)",
          "inv-text": "var(--tg-inv-text)",
          "page-board": "var(--tg-page-board)",
          "board-line": "var(--tg-board-line)",
          "feed-bg": "var(--tg-feed-bg)",
          /* Verified tick — fixed, never swaps (G15 exception) */
          "verified-badge": "var(--tg-verified-badge)",
          "verified-check": "var(--tg-verified-check)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
        marker: "var(--font-marker)",
      },
      borderRadius: {
        chip: "var(--radius-chip)",
        sm: "var(--radius-sm)",
        md: "calc(var(--radius) - 2px)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "999px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        swipe: "var(--shadow-swipe)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        entrance: "var(--ease-entrance)",
      },
      transitionDuration: {
        fast: "140ms",
        base: "240ms",
        slow: "480ms",
      },
      letterSpacing: {
        display: "-0.04em",
        "display-tight": "-0.06em",
        body: "-0.01em",
        chip: "0.13em",
        meta: "0.02em",
        eyebrow: "0.18em",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--dur-base) var(--ease-entrance)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
