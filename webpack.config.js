const path = require('path')
const babelConfig = require('./babel.browsers.config')

const commonBrowser = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    library: 'sbq',
    libraryTarget: 'window'
  },
  module: {
    rules: [
      {
        test: /(\.ts(x?)$)/,
        loader: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: babelConfig.presets,
              plugins: babelConfig.plugins
            }
          }
        ],
        exclude: [/__tests__/, /node_modules/]
      }
    ]
  }
}

const browserBundle = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'browser.bundle': './src/browser/index.ts'
  },
  ...commonBrowser
}

const browserBundleMin = {
  mode: 'production',
  entry: {
    'browser.bundle.min': './src/browser/index.ts'
  },
  ...commonBrowser,
  optimization: {
    minimize: true
  }
}

module.exports = [browserBundle, browserBundleMin]
