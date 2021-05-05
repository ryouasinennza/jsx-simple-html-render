import { isArray } from 'util'

require('@babel/register')
import chokidar from 'chokidar'
import { outputFileSync } from 'fs-extra'
import { replaceList } from './replaceList'
import { ReplaceList, TreeObject } from './@types/types'
import { JSXDependencyTree } from './JSXDependencyTree'
import { log, errorHook, makeFullPath, replaceLoop, getJSXFilePaths } from './utility'

const env = process.env.NODE_ENV
process.env.NODE_ENV = 'development'
const { renderToStaticMarkup } = require('react-dom/server')
process.env.NODE_ENV = env

type Constructor = {
  throwFlag: boolean
  watch: boolean
  src: string
  relativeRoot: string
  output: string
  replace: ReplaceList
}

class JsxSimpleHtmlRender {
  private readonly replace: ReplaceList
  private readonly throwFlag: boolean
  private readonly relativeRoot: string
  private readonly src: string
  private output: string
  private DTI: any

  constructor({ throwFlag, watch, src, relativeRoot, output, replace = [] }: Constructor) {
    this.replace = replace
    this.throwFlag = throwFlag
    this.relativeRoot = relativeRoot
    this.src = makeFullPath(src)
    this.output = makeFullPath(output)
    if (watch) {
      this.DTI = new JSXDependencyTree(this.src)
      this.exportHTML(this.DTI.tree)
      this.watch()
    } else {
      this.exportHTML(getJSXFilePaths<TreeObject>(this.src, true))
    }
  }

  watch(): void {
    const watcher = chokidar.watch(this.src, {
      persistent: true
    })
    watcher.on('ready', () => {
      watcher.on('change', (path: string) => {
        this.exportHTML(this.DTI.findDependencyFiles(path))
      })
      watcher.on('add', (path: string) => {
        this.exportHTML(this.DTI.setTree(path))
      })
      watcher.on('unlink', (path: string) => {
        this.DTI.removeDependency(path)
      })
    })
  }

  getOutputPath(target: string) {
    return target.replace(this.src, this.output).replace(/\.jsx/, '.html')
  }

  exportHTML(fileNames: TreeObject): void {
    log.y('> export html')
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const hook = errorHook()
    for (const jsxPath in fileNames) {
      if (fileNames.hasOwnProperty(jsxPath)) {
        const outputPath = this.getOutputPath(jsxPath)
        outputFileSync(outputPath, this.getHTML(renderToStaticMarkup, jsxPath, this.getRelativePath(outputPath)))
      }
    }
    hook.detach()
    process.env.NODE_ENV = env
  }

  getRelativePath(targetPath: string): string {
    const pathArray = targetPath.split('/')
    const pathLength = pathArray.length - pathArray.indexOf(this.relativeRoot) - 1
    let relativePath = ''
    if (pathLength === 1) return relativePath
    for (let i = 1; i < pathLength; i++) {
      relativePath = `${relativePath}../`
    }
    return relativePath
  }

  getHTML(renderToStaticMarkup: any, targetPath: string, relativePath: string): string {
    try {
      const html = this.codeReplace(renderToStaticMarkup(require(targetPath).default({ relativePath })))
      log.b(targetPath)
      return html
    } catch (e) {
      log.r(targetPath)
      log.r(e)
      if (this.throwFlag) {
        throw ''
      }
      return 'Error'
    }
  }

  codeReplace(htmlCode: string): string {
    return replaceLoop(htmlCode, this.replace.length === 0 ? replaceList : [...replaceList, ...this.replace])
  }

  apply() {}
}

module.exports = JsxSimpleHtmlRender
