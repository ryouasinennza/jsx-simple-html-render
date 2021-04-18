const root = require('app-root-path')
const ConvertJSXToHTML = require('./dist/index')
const isDevEnv = process.env.NODE_ENV === 'development'

module.exports = {
  mode: process.env.NODE_ENV,
  devServer: {
    contentBase: `${root}/example-dist`,
    watchContentBase: true
  },
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
      throwFlag: !isDevEnv,
      watch: isDevEnv,
      src: 'example-src/jsx',
      relativeRoot: 'example-dist',
      output: 'example-dist',
      replace: [
        {
          regexp: /<!-- replace -->/,
          value: 'hello'
        }
      ]
    })
  ]
}
