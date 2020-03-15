import appRoot from 'app-root-path'
const browserSync = require('browser-sync').create()
const { execSync } = require('child_process')
;(async () => {
  const htmlStb = execSync(`babel-node ${appRoot}/lib/html-build`)
  const cssStb = execSync(`babel-node ${appRoot}/lib/css-build null development`)
  console.log(htmlStb.toString())
  console.log(cssStb.toString())
})().then(() => {
  browserSync.init({
    ui: false,
    notify: false,
    server: 'dist',
    post: 3000,
    watch: true,
    watchOptions: {
      ignoreInitial: true,
      ignored: 'dist/**/*'
    },
    files: [
      'src/**/*',
      {
        match: ['src/**/*'],
        fn: function(event, file) {
          const replacePath = file.replace(/(\\|\/)/g, '/')
          console.log(replacePath)
          if (/src\/html/.test(replacePath)) {
            const htmlStb = execSync(`babel-node ${appRoot}/lib/html-build`)
            console.log(htmlStb.toString())
          }

          if (/src\/scss/.test(replacePath)) {
            const cssStb = execSync(`babel-node ${appRoot}/lib/css-build ${file} development`)
            console.log(cssStb.toString())
          }

          if (/src\/js/.test(replacePath)) {
            const jsStb = execSync(`babel-node ${appRoot}/lib/js-build`)
            console.log(jsStb.toString())
          }
        }
      }
    ]
  })
})
