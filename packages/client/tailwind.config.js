// Author: Sam Rivera
// Issue: #6 â€” Configure Tailwind content scanning

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        mist: '#f4f7f9',
        line: '#d8e0e7',
        focus: '#1b7f79',
        urgent: '#bf3434',
      },
    },
  },
  plugins: [],
};
