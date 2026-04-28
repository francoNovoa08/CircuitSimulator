/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        circuit: {
          bg: '#0e0f0f',
          surface: '#151617',
          raised: '#1c1e1f',
          border: '#2a2d2e',
          dim: '#4a5056',
          muted: '#6b7580',
          text: '#c8ced4',
          strong: '#e8edf0',
          accent: '#4dff91',
          'accent-dim': '#1a5c38',
          'accent-active': '#a0ffcc',
          warn: '#ffb340',
          error: '#ff5c5c'
        }
      },
      fontFamily: {
        'plex-sans': ['"IBM Plex Sans"', 'sans-serif'],
        'plex-mono': ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}