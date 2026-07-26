import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9f8", 100: "#d9efee", 200: "#b3dfde", 300: "#80c9c7", 400: "#4dabaa", 500: "#2d8d8c", 600: "#1f6f6e", 700: "#1a5857", 800: "#174847", 900: "#143c3b", DEFAULT: "#1f6f6e",
        },
        secondary: {
          50: "#faf7f2", 100: "#f3ece0", 200: "#e6d8c2", 300: "#d4bd9c", 400: "#bf9d72", 500: "#ad8453", 600: "#946b44", 700: "#785538", 800: "#5f4530", 900: "#4d3828", DEFAULT: "#946b44",
        },
        accent: {
          50: "#fdf8ed", 100: "#faedca", 200: "#f4d98e", 300: "#eec052", 400: "#e9a82c", 500: "#d98f1f", 600: "#b86f18", 700: "#935316", 800: "#794218", 900: "#673818", DEFAULT: "#b86f18",
        },
        success: {
          50: "#f0faf3", 100: "#dcf2e3", 200: "#b9e5ca", 300: "#88d3a4", 400: "#54b978", 500: "#2f9d57", 600: "#1f7e42", 700: "#1a6537", 800: "#17512e", 900: "#134226", DEFAULT: "#1f7e42",
        },
        warning: {
          50: "#fdf8ed", 100: "#faedca", 200: "#f5d78a", 300: "#efbf4d", 400: "#e9a52c", 500: "#d98a1f", 600: "#b86d18", 700: "#935116", 800: "#793e18", 900: "#673318", DEFAULT: "#b86d18",
        },
        error: {
          50: "#fdf2f2", 100: "#fae0e0", 200: "#f5c4c4", 300: "#ee9b9b", 400: "#e36b6b", 500: "#d14545", 600: "#b03030", 700: "#8f2828", 800: "#752222", 900: "#621e1e", DEFAULT: "#b03030",
        },
        neutral: {
          50: "#f7f5f2", 100: "#eee9e2", 200: "#ddd5c8", 300: "#c4b8a4", 400: "#a5967f", 500: "#8a7a63", 600: "#6f6150", 700: "#5a4e40", 800: "#463d33", 900: "#3a322a", 950: "#2a241e", DEFAULT: "#6f6150",
        },
        surface: "#faf8f4",
        ink: "#2a241e",
      },
      fontFamily: {
        sans: ['"Noto Sans Arabic"', "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.65" }],
        sm: ["1rem", { lineHeight: "1.65" }],
        base: ["1.125rem", { lineHeight: "1.65" }],
        lg: ["1.25rem", { lineHeight: "1.65" }],
        xl: ["1.5rem", { lineHeight: "1.35" }],
        "2xl": ["1.875rem", { lineHeight: "1.35" }],
        "3xl": ["2.25rem", { lineHeight: "1.35" }],
        "4xl": ["3rem", { lineHeight: "1.35" }],
      },
      borderRadius: {
        sm: "6px", md: "10px", lg: "14px", xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(42, 36, 30, 0.06)",
        md: "0 2px 8px rgba(42, 36, 30, 0.08)",
        lg: "0 4px 16px rgba(42, 36, 30, 0.10)",
      },
      spacing: {
        "0.5": "0.5rem", "1.5": "1.5rem",
      },
      transitionDuration: { DEFAULT: "200ms" },
      transitionTimingFunction: { DEFAULT: "ease-out" },
    },
  },
  plugins: [],
};

export default config;
