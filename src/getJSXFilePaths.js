const fsExtra = require('fs-extra')

function getJSXFilePaths(root, returnObj) {
  const files = returnObj ? {} : []
  const readDir = (dirArray, prefix) => {
    prefix = prefix ? `${prefix}/` : ''
    for (let i = 0; i < dirArray.length; i++) {
      if (!!dirArray[i].match(/\.(js|jsx)$/)) {
        if (dirArray[i].match(/\.jsx$/)) {
          const path = `${root}${prefix}${dirArray[i]}`
          if (returnObj) {
            files[`${path}`] = []
          } else {
            files.push(path)
          }
        }
      } else {
        const recursionDir = fsExtra.readdirSync(`${root}${prefix}${dirArray[i]}`)
        readDir(recursionDir, `${prefix}${dirArray[i]}`)
      }
    }
  }
  readDir(fsExtra.readdirSync(root), false)

  return files
}

module.exports = getJSXFilePaths
