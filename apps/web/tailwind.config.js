/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8f4e00',
          container: '#ff9f43',
          fixed: '#ffdcc2',
          'fixed-dim': '#ffb77a',
          dark: '#6d3a00',
        },
        secondary: {
          DEFAULT: '#006d34',
          container: '#54fd8f',
          fixed: '#62ff95',
          'fixed-dim': '#2fe378',
        },
        tertiary: {
          DEFAULT: '#b52330',
          container: '#ff9a98',
          fixed: '#ffdad8',
          'fixed-dim': '#ffb3b0',
        },
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#cfdaf2',
          bright: '#f9f9ff',
          container: '#e7eeff',
          'container-lowest': '#ffffff',
          'container-low': '#f0f3ff',
          'container-high': '#dee8ff',
          'container-highest': '#d8e3fb',
          variant: '#d8e3fb',
        },
        'on-surface': '#111c2d',
        'on-surface-variant': '#544437',
        'inverse-surface': '#263143',
        'inverse-on-surface': '#ecf1ff',
        outline: '#877365',
        'outline-variant': '#dac2b1',
        background: '#FFF7F0',
      },
      fontFamily: {
        headline: ['Epilogue', 'sans-serif'],
        body: ['Roboto Flex', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
