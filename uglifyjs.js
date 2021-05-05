const fsExtra = require('fs-extra')
const UglifyJS = require('uglify-js')
const read = require('fs-readdir-recursive')
const files = read('dist')
files.forEach((fileName) => {
  const { code } = UglifyJS.minify(fsExtra.readFileSync(`dist/${fileName}`, 'utf-8'))
  fsExtra.outputFileSync(`dist/${fileName}`, code)
})
