/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: "Inter",
        serif: "Inter",
        mono: "Inter",
      },
      fontSize: {
        "2xl": "4.5rem",
        xl: "4rem",
        lg: "3.38rem",
        md: "2.25rem",
        s: "1.25rem",
        base: "1.13rem",
      },
      colors: {
        blue: {
          400: "#4f9cf9",
          500: "#3986e5",
          900: "#043873",
        },
      },
    },
  },
  plugins: [],
};
