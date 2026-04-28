/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A00",
        fresh: "#16A34A",
        navy: "#0F172A",
        canvas: "#F8FAFC",
        softOrange: "#FFF7ED",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.10)",
        glow: "0 18px 60px rgba(255, 122, 0, 0.24)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
