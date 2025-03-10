// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",           // Vite uses index.html in root
      "./src/**/*.{js,ts,jsx,tsx}", // Your source files
    ],
    theme: {
      extend: {
        fontFamily: {
          poppins: ['Poppins', 'sans-serif'], // Add Poppins font
        },
      },
    },
    plugins: [],
  };