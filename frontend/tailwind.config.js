/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        350: "1400px",
        190: "760px",
      },
      maxWidth: {
        350: "1400px",
      },
      lineHeight: {
        "20.25": "81px",
      },
    },
  },
  plugins: [],
};
