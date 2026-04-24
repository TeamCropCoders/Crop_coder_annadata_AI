/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        leaf: "#2E7D32",
        mud: "#6D4C41",
        beige: "#F5F5DC",
        harvest: "#F6C453",
        field: "#DDE7C7"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(79, 64, 43, 0.14)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
