const browserSync = require('browser-sync')
const { cssBuild } = require('./css-build')
const { jsBuild } = require('./js-build')
const { htmlCommand } = require('./html-build')

const callback = () => {
  cssBuild('', 'development')
    .then(() => {
      htmlCommand()
    })
    .then(() => {
      browserSync.init({
        server: 'dist',
        watch: true,
        files: [
          'src/**/*',
          {
            match: ['src/**/*'],
            fn: async function(event, file) {
              const replacePath = file.replace(/(\\|\/)/g, '/')
              console.log(replacePath)
              if (/src\/scss/.test(replacePath)) {
                await cssBuild(file, 'development')
              }

              if (/src\/js/.test(replacePath)) {
                jsBuild()
              }

              if (/src\/html/.test(replacePath)) {
                htmlCommand()
              }
            }
          }
        ]
      })
    })
}

jsBuild(callback)
