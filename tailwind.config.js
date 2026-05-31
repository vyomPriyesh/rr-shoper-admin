/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#B06A8D",
        primaryDark: "#9A5A7C",
        secondary: "#C89AB5",
        background: "#F8F1F5",
        borderColor: "#E8DDE3",
        heading: "#1E1E1E",
        paragraph: "#5F6673",
      }
    },
  },
  plugins: [],
}

