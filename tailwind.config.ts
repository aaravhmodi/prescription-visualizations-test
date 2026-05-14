import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ag: {
          green: '#2d6a4f',
          light: '#52b788',
          dark: '#1b4332',
          soil: '#6b4c3b',
          grain: '#c9a84c',
        },
      },
    },
  },
  plugins: [],
}

export default config
