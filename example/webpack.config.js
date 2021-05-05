const path = require('path')
const JsxSimpleHtmlRender = require('jsx-simple-html-render')
const isDevEnv = process.env.NODE_ENV === 'development'

module.exports = {
  mode: process.env.NODE_ENV,
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    watchContentBase: true
  },
  devtool: false,
  entry: './src/js/index.js',
  output: {
    filename: './js/example.js',
    path: path.resolve(__dirname, 'dist')
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
    new JsxSimpleHtmlRender({
      throwFlag: !isDevEnv,
      watch: isDevEnv,
      src: 'src/jsx',
      relativeRoot: 'dist',
      output: 'dist',
      replace: [
        {
          regexp: /<!-- replace -->/,
          value: 'hello'
        }
      ]
    })
  ]
}
