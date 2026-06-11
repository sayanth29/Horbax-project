export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#006591",
        "primary-container": "#0ea5e9",
        "primary-fixed": "#c9e6ff",
        "primary-fixed-dim": "#89ceff",
        "surface": "#faf8ff",
        "surface-container": "#eaedff",
        "surface-container-low": "#f2f3ff",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#131b2e",
        "on-surface-variant": "#3e4850",
        "outline": "#6e7881",
        "outline-variant": "#bec8d2",
        "secondary": "#3c627d",
        "secondary-container": "#b8dffe",
        "tertiary": "#8a5100",
        "tertiary-fixed-dim": "#ffb86e",
        "background": "#faf8ff",
      },
      fontFamily: {
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}