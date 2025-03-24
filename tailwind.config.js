module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1a1c2e',
          light: '#2d2f45'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, #1a1c2e 0%, #2d2f45 100%)'
      }
    },
  },
  plugins: [],
} 