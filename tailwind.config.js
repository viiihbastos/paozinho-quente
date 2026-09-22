/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bread: {
          50: "#fef9ee",
          100: "#fdf0d4",
          200: "#fadda8",
          300: "#f6c471",
          400: "#f1a538",
          500: "#ec8b15",
          600: "#dd7010",
          700: "#b75410",
          800: "#924315",
          900: "#763814",
        },
      },
    },
  },
  plugins: [],
};
