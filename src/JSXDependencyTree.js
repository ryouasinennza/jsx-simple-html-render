const chalk = require('chalk')
const cliProgress = require('cli-progress')
const dependencyTree = require('dependency-tree')
const getJSXFilePaths = require('./getJSXFilePaths')

class JSXDependencyTree {
  constructor(JSXDirectory) {
    this.tree = {}
    this.JSXDirectory = JSXDirectory
    this.setTreeAll()
  }

  setTree(targetPath) {
    if (targetPath.match(/\.jsx$/) && !this.tree[targetPath]) {
      this.tree[targetPath] = this.getDependencyTree(targetPath)
      return { [targetPath]: [] }
    }
  }

  setTreeAll() {
    console.log(chalk.yellow('> set JSX dependency tree'))
    const JSXPaths = getJSXFilePaths(this.JSXDirectory, false)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar.start(JSXPaths.length, 1)
    for (let i = 0; i < JSXPaths.length; i++) {
      this.tree[JSXPaths[i]] = this.getDependencyTree(JSXPaths[i])
      bar.update(i + 1)
    }
    bar.stop()
  }

  getDependencyTree(filename) {
    return dependencyTree.toList({
      filename: filename,
      directory: this.JSXDirectory,
      nodeModulesConfig: {
        entry: 'module'
      },
      filter: (path) => path.indexOf('node_modules') === -1,
      nonExistent: []
    })
  }

  findDependencyFiles(targetPath) {
    if (targetPath.match(/\.jsx$/)) {
      if (this.tree[targetPath]) {
        this.clearRequireCache(targetPath)
        return { [targetPath]: [] }
      } else {
        this.setTreeAll()
        return this.tree
      }
    } else {
      let JSXPaths = {}
      for (const propJSXPath in this.tree) {
        if (this.tree.hasOwnProperty(propJSXPath)) {
          if (this.tree[propJSXPath].some((childrenPath) => childrenPath === targetPath)) {
            this.clearRequireCache(propJSXPath)
            JSXPaths = {
              ...JSXPaths,
              [propJSXPath]: []
            }
          }
        }
      }
      return JSXPaths
    }
  }

  clearRequireCache(JSXPath) {
    delete require.cache[JSXPath]
    for (let i = 0; i < this.tree[JSXPath].length; i++) {
      delete require.cache[this.tree[JSXPath][i]]
    }
  }

  removeDependency(targetPath) {
    if (targetPath.match(/\.jsx$/)) {
      delete this.tree[targetPath]
    }
  }
}

module.exports = JSXDependencyTree
