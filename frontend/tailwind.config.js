/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09091a",
        foreground: "#ffffff",
        card: "#111122",
        border: "#1e1e3a",
        primary: "#00e5ff",
      },
    },
  },
  plugins: [],
}