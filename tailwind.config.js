/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Chakra Petch"', '"Space Grotesk"', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        chassis: {
          950: '#08090B',
          900: '#0E1013',
          850: '#13161A',
          800: '#181C21',
          750: '#1E232A',
          700: '#262C35',
          600: '#353D49',
        },
        crt: {
          bg: '#060908',
          grid: '#11221B',
        },
        signal: {
          phosphor: '#00F59B',
          amber: '#FF5E1A',
          gold: '#FFB800',
          cyan: '#00E5FF',
          magenta: '#FF2A6D',
          lime: '#B8FF01',
        },
      },
    },
  },
  plugins: [],
};
