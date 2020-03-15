const webpack = require('webpack')
const appRoot = require('app-root-path')

webpack(
  {
    mode: 'development',
    watch: false,
    devtool: 'inline-source-map',
    entry: {
      'js/app': `${appRoot}/src/js/myScript/index.js`
    },
    output: {
      path: `${appRoot}/dist/`,
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        }
      ]
    }
  },
  (err, stats) => {
    console.log('js-build')
    if (err || stats.hasErrors()) {
      console.log(err)
    }
  }
)
