/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        background: "#504949",
        backgroundAccent: "#393131",

        textPrimary: "#FFFFFF",
        textSecondary: "#B5B1B1",
        textAccent: "#787878",

        linePrimary: "#4A4A4A",
      },
      borderRadius: {
        posts: "3px",
        bars: "15px",
        buttons: "20px",
        images: "20px",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        gabarito: ["Gabarito", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      }
    },
  },
  plugins: [require("flowbite/plugin")],
};
