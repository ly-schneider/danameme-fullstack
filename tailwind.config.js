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
        background: "#131313",
        text: "#EFF6F2",
        primary: "#315955",
        secondary: "#28121F",
        accent: "#9E575D",
        placeholder: "#545454",
        muted: "#545454",
        accentBackground: "#080808",
        error: "#ff4141",
        success: "#47db47",
      },
      borderRadius: {
        form: "10px",
        button: "10px",
        div: "10px",
        badge: "5px",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        lato: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
