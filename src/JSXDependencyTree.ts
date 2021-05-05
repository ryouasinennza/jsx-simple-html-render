import cliProgress from 'cli-progress'
import dependencyTree from 'dependency-tree'
import { TreeObject } from './@types/types'
import { log, getJSXFilePaths } from './utility'

export class JSXDependencyTree {
  private readonly tree: TreeObject
  private readonly JSXDirectory: string

  constructor(JSXDirectory: string) {
    this.tree = {}
    this.JSXDirectory = JSXDirectory
    this.setTreeAll()
  }

  setTree(targetPath: string): TreeObject | null {
    if (targetPath.match(/\.jsx$/) && !this.tree[targetPath]) {
      this.tree[targetPath] = this.getDependencyTree(targetPath)
      return { [targetPath]: [] }
    }
    return null
  }

  setTreeAll(): void {
    log.y('> set JSX dependency tree')
    const JSXPaths = getJSXFilePaths<string[]>(this.JSXDirectory, false)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar.start(JSXPaths.length, 1)
    for (let i = 0; i < JSXPaths.length; i++) {
      this.tree[JSXPaths[i]] = this.getDependencyTree(JSXPaths[i])
      bar.update(i + 1)
    }
    bar.stop()
  }

  getDependencyTree(filename: string): string[] {
    return dependencyTree.toList({
      filename: filename,
      directory: this.JSXDirectory,
      nodeModulesConfig: {
        entry: 'module'
      },
      filter: (path: string) => path.indexOf('node_modules') === -1,
      nonExistent: []
    })
  }

  findDependencyFiles(targetPath: string): TreeObject {
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
          if (this.tree[propJSXPath].some((childrenPath: string) => childrenPath === targetPath)) {
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

  clearRequireCache(JSXPath: string): void {
    delete require.cache[JSXPath]
    for (let i = 0; i < this.tree[JSXPath].length; i++) {
      delete require.cache[this.tree[JSXPath][i]]
    }
  }

  removeDependency(targetPath: string): void {
    if (targetPath.match(/\.jsx$/)) {
      delete this.tree[targetPath]
    }
  }
}
