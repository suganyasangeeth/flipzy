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
        primary: "#071B37",
        "on-primary": "#ffffff",
        "primary-container": "#1A6FEF",
        "on-primary-container": "#D4E8FF",
        "primary-fixed": "#D4E8FF",
        "primary-fixed-dim": "#A3C8FF",
        "on-primary-fixed": "#001B3E",
        "on-primary-fixed-variant": "#1454B5",
        "inverse-primary": "#A3C8FF",

        secondary: "#1688F7",
        "on-secondary": "#ffffff",
        "secondary-container": "#4DA3FF",
        "on-secondary-container": "#003A75",
        "secondary-fixed": "#D4E8FF",
        "secondary-fixed-dim": "#A3C8FF",
        "on-secondary-fixed": "#001B3E",
        "on-secondary-fixed-variant": "#004A8A",

        tertiary: "#FFC20A",
        "on-tertiary": "#000000",
        "tertiary-container": "#FFD54F",
        "on-tertiary-container": "#3D2E00",
        "tertiary-fixed": "#FFE082",
        "tertiary-fixed-dim": "#FFD54F",
        "on-tertiary-fixed": "#3D2E00",
        "on-tertiary-fixed-variant": "#6B5200",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#F5F0E8",
        "on-background": "#071B37",

        surface: "#F5F0E8",
        "on-surface": "#071B37",
        "surface-variant": "#E3DED5",
        "on-surface-variant": "#494454",
        "surface-dim": "#DDD8CF",
        "surface-bright": "#F5F0E8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F5F0E8",
        "surface-container": "#EDE8DF",
        "surface-container-high": "#E8E3DA",
        "surface-container-highest": "#E3DED5",
        "surface-tint": "#071B37",

        outline: "#7b7486",
        "outline-variant": "#cbc3d7",

        "inverse-surface": "#071B37",
        "inverse-on-surface": "#FFFFFF",

        "accent-space": "#35A2FF",
        "accent-food": "#FFC20A",
        "accent-objects": "#1688F7",

        "arcade-surface": "#FFFFFF",
        "arcade-border": "#E8E3DA",

        "btn-shadow-primary": "#041225",

        "background-gradient-start": "#F5F0E8",
        "background-gradient-end": "#E8E3DA",
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
        "chunky-primary": "6px 6px 0px 0px #071B37",
        "chunky-secondary": "6px 6px 0px 0px #1688F7",
        "chunky-error": "6px 6px 0px 0px #ba1a1a",
        "arcade-card": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        "arcade-ambient": "0 0 50px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
