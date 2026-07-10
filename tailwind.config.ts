import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // MULTIPLY OS brand palette (pulled from the logo)
        brand: {
          orange: "#EA7B1B",
          "orange-dark": "#C9650F",
          charcoal: "#4A4A4A",
          gray: "#A6A6A6",
          ink: "#0A0A0A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
