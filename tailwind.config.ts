import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        himsols: {
          forest: '#14532d',
          leaf: '#16a34a',
          earth: '#78716c',
          sand: '#f5f5f4',
        },
      },
    },
  },
} satisfies Config;

