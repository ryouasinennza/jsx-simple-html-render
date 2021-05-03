const { readdirSync } = require('fs-extra')

module.exports = (root: string, returnObj: boolean) => {
  const files: any = returnObj ? {} : []
  const readDir = (dirArray: string[], prefix: string | boolean) => {
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
        const recursionDir = readdirSync(`${root}${prefix}${dirArray[i]}`)
        readDir(recursionDir, `${prefix}${dirArray[i]}`)
      }
    }
  }
  readDir(readdirSync(root), false)

  return files
}
