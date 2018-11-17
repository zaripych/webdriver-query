module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: 'last 2 versions, IE 10, IE 11'
        }
      }
    ],
    '@babel/typescript'
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread'
  ]
}
