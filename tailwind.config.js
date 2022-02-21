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

  content: ['_site/**/*.html'],

  
}