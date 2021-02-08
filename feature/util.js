const fs = require('fs')
const jsxReg = new RegExp(/\.jsx/, 'g')
module.exports.Util = class {
  // 対象ディレクトリのファイルパスを再帰的に取得する
  read(root) {
    const files = []
    const readDir = (dirArray, prefix) => {
      prefix = prefix ? `${prefix}/` : ''
      for (let i = 0; i < dirArray.length; i++) {
        if (!!dirArray[i].match(/\./g)) {
          files.push(`${root}${prefix}${dirArray[i]}`)
        } else {
          const recursionDir = fs.readdirSync(`${root}${prefix}${dirArray[i]}`)
          readDir(recursionDir, `${prefix}${dirArray[i]}`)
        }
      }
    }
    readDir(fs.readdirSync(root))
    return files
  }

  // .jsxのみの配列を返す
  getJSXFilePaths(targetDir) {
    return this.read(targetDir).filter(filePath => filePath.match(jsxReg))
  }

  // .jsx から .htmlに変換する
  getOutputPath(target, entry, output) {
    return target.replace(entry, output).replace(/\.jsx/, '.html')
  }
}
