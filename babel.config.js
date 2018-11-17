'use strict'

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '6.9'
        },
        modules: 'commonjs'
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread'
  ]
}
