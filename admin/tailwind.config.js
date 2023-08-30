/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("flowbite/plugin")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // from https://htmlcolorcodes.com/color-chart/flat-design-color-chart/  the peter river scheme
        primary: {
          50: "#EBF5FB",
          100: "#D6EAF8",
          200: "#AED6F1",
          300: "#85C1E9",
          400: "#5DADE2",
          500: "#3498DB",
          600: "#2E86C1",
          700: "#2874A6",
          800: "#21618C",
          900: "#1B4F72",
        },
      },
    },
  },
};
