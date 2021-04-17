const root = require('app-root-path')
const ConvertJSXToHTML = require('./dist/ConvertJSXToHTML')
const isDevEnv = process.env.NODE_ENV === 'development'

module.exports = {
  mode: process.env.NODE_ENV,
  watch: isDevEnv,
  devtool: false,
  entry: './example-src/js/index.js',
  output: {
    filename: './js/example.js',
    path: `${root}/example-dist`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new ConvertJSXToHTML({
      src: 'example-src/jsx',
      dist: 'example-dist',
      output: 'example-dist/html',
      watch: isDevEnv,
      dev: isDevEnv
    })
  ]
}
