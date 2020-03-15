const webpack = require('webpack')
const appRoot = require('app-root-path')
module.exports.jsBuild = (callback) => {
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
      },
      plugins: [
        new webpack.ProgressPlugin({
          activeModules: true,
          entries: true,
          modules: true,
          profile: true,
        })
      ]
    },
    (err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(err)
      }
      if (callback) {
        callback()
      }
    }
  )
}
