import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A81D1D",
        "on-primary": "#ffffff",
        "primary-container": "#6b38d4",
        "on-primary-container": "#ddcdff",
        "primary-fixed": "#e9ddff",
        "primary-fixed-dim": "#d0bcff",
        "on-primary-fixed": "#23005c",
        "on-primary-fixed-variant": "#5517be",
        "inverse-primary": "#d0bcff",

        secondary: "#9d4300",
        "on-secondary": "#ffffff",
        "secondary-container": "#fd761a",
        "on-secondary-container": "#5c2400",
        "secondary-fixed": "#ffdbca",
        "secondary-fixed-dim": "#ffb690",
        "on-secondary-fixed": "#341100",
        "on-secondary-fixed-variant": "#783200",

        tertiary: "#005020",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#006b2d",
        "on-tertiary-container": "#7eec93",
        "tertiary-fixed": "#8cfa9f",
        "tertiary-fixed-dim": "#6fdd85",
        "on-tertiary-fixed": "#002109",
        "on-tertiary-fixed-variant": "#005321",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#D9F2F2",
        "on-background": "#111c2d",

        surface: "#D9F2F2",
        "on-surface": "#111c2d",
        "surface-variant": "#d8e3fb",
        "on-surface-variant": "#494454",
        "surface-dim": "#cfdaf2",
        "surface-bright": "#D9F2F2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        "surface-tint": "#6d3bd6",

        outline: "#7b7486",
        "outline-variant": "#cbc3d7",

        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",

        "accent-space": "#60a5fa",
        "accent-food": "#A81D1D",
        "accent-objects": "#fbbf24",

        "arcade-surface": "#FFFDF5",
        "arcade-border": "#bae6fd",

        "btn-shadow-primary": "#5a0000",

        "background-gradient-start": "#e0f2f1",
        "background-gradient-end": "#b2dfdb",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      spacing: {
        unit: "8px",
        gutter: "16px",
        "container-padding": "24px",
        "stack-gap": "20px",
        "card-padding": "32px",
        "touch-target-min": "56px",
      },
      fontFamily: {
        "display-hero": ['"Baloo 2"', "sans-serif"],
        "headline-lg": ['"Baloo 2"', "sans-serif"],
        "headline-md": ['"Baloo 2"', "sans-serif"],
        "body-lg": ['"Baloo 2"', "sans-serif"],
        "body-md": ['"Baloo 2"', "sans-serif"],
        "label-caps": ['"Baloo 2"', "sans-serif"],
      },
      fontSize: {
        "display-hero": [
          "48px",
          {
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            fontWeight: "800",
          },
        ],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", fontWeight: "800" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "32px", fontWeight: "700" },
        ],
        "body-lg": [
          "20px",
          { lineHeight: "28px", fontWeight: "600" },
        ],
        "body-md": [
          "18px",
          { lineHeight: "26px", fontWeight: "500" },
        ],
        "label-caps": [
          "16px",
          {
            lineHeight: "24px",
            letterSpacing: "0.05em",
            fontWeight: "700",
          },
        ],
      },
      boxShadow: {
        "chunky-primary": "6px 6px 0px 0px #A81D1D",
        "chunky-secondary": "6px 6px 0px 0px #9d4300",
        "chunky-error": "6px 6px 0px 0px #ba1a1a",
        "arcade-card": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        "arcade-ambient": "0 0 50px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
