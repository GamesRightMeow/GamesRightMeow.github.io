// this file does not trigger rebuilds, must restart server!
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

module.exports = {
  // TODO: where did enabled flag go?
  // purge: {
  //   enabled: process.env.NODE_ENV === 'production',
  //   content: ['_site/**/*.html'],
  //   options: {
  //     safelist: [],
  //   },
  // },

  content: ['src/**/*.liquid'],

  plugins: [
    require('@tailwindcss/typography'),
  ],

  theme: {
    fontFamily: {
      sans: [
        'Roboto',
        'sans-serif',
      ],
      mono: [
        'Roboto Slab',
        'sans-serif',
      ],
    },
    fontSize: {
      'xs': '.75rem',
      'sm': '.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },

    extend: {
      spacing: {
        '192': '48rem',
      }
    }
  },
}