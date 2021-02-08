const dependencyTree = require('dependency-tree')
const { Util } = require('./Util')

module.exports.DependencyTree = class extends Util {
  constructor(entry) {
    super()
    this.entry = entry
    this.tree = {}
    // 依存関係を取得
    this.setDependencyTree(this.getJSXFilePaths(this.entry))
  }

  // https://www.npmjs.com/package/dependency-tree
  // 依存関係を取得して配列に変換する（見つけやすくするため）
  getDependencyTree(filename, directory) {
    const tree = dependencyTree({
      filename: filename,
      directory: directory,
      nodeModulesConfig: {
        entry: 'module'
      },
      filter: path => path.indexOf('node_modules') === -1,
      nonExistent: []
    })
    // オブジェクト(ツリー)構造になっているので並列に変換
    const str = JSON.stringify(tree).toString()
    return str.match(/(?<="\/).*?(?=")/g).filter((value, index, self) => self.indexOf(value) === index)
  }

  // 各ファイルパスに依存関係をpushする
  setDependencyTree(filePaths) {
    for (let i = 0; i < filePaths.length; i++) {
      this.tree[filePaths[i]] = this.getDependencyTree(filePaths[i], this.entry)
    }
  }

  // 依存関係を初期化
  resetDependencyTree() {
    this.tree = []
    const jsxFilePaths = this.getJSXFilePaths(this.entry)
    for (let i = 0; i < jsxFilePaths.length; i++) {
      this.tree[jsxFilePaths[i]] = this.getDependencyTree(jsxFilePaths[i], this.entry)
    }
    return jsxFilePaths
  }

  // 依存関係から対象のパスを検索して当てはまるものだけ返す
  getDependencyFiles(fullPath) {
    let list = []
    for (const prop in this.tree) {
      if (this.tree.hasOwnProperty(prop)) {
        if (this.tree[prop].some(val => `/${val}` === fullPath)) {
          list.push(prop)
        }
      }
    }
    return list
  }

  // 依存関係から対象のパスを検索
  findDependencyFiles(fullPath) {
    // 1: 新しいページ
    // 2: 既存
    // 3: なし
    if (fullPath.match(/\.jsx$/)) {
      // jsxならページ
      return this.tree[fullPath] ? 2 : 1
    } else {
      // jsならコンポーネント
      for (const prop in this.tree) {
        if (this.tree.hasOwnProperty(prop)) {
          if (this.tree[prop].some(val => `/${val}` === fullPath)) {
            return 2
          }
        }
      }
    }

    return 3
  }

  // requireのキャッシュを削除する
  // これをしないとキャッシュを使ってしまうので変更が反映されない
  clearRequireCache(fullPath) {
    const fileNames = this.getDependencyFiles(fullPath)
    // 見つかった依存関係をリセット
    this.setDependencyTree(fileNames)
    delete require.cache[fullPath]
    for (let i = 0; i < fileNames.length; i++) {
      for (let i2 = 0; i2 < this.tree[fileNames[i]].length; i2++) {
        delete require.cache[`/${this.tree[fileNames[i]][i2]}`]
      }
    }
    return fileNames
  }
}
