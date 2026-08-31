/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#0D0F12",
          surface: "#151922",
          card: "#1C212E",
          border: "#2A3245",
          muted: "#8A99AD",
        },
        accent: {
          DEFAULT: "#E5A93B",
          hover: "#F3B84F",
          glow: "rgba(229, 169, 59, 0.15)",
        },
      },
      boxShadow: {
        skeuo: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.5)",
        "skeuo-inset": "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
        "skeuo-btn": "0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
      },
    },
  },
  plugins: [],
};
