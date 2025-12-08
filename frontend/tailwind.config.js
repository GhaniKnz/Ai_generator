module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'apple-gray': {
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#b0b0b5',
          400: '#86868b',
          500: '#6e6e73',
          600: '#515154',
          700: '#3a3a3c',
          800: '#1d1d1f',
          900: '#000000',
        },
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'apple': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.24)',
      },
      borderRadius: {
        'apple': '18px',
        'apple-lg': '24px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
