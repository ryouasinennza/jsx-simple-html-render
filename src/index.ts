require('@babel/register')
const { yellow, blue, red } = require('chalk')
const { outputFileSync } = require('fs-extra')
const chokidar = require('chokidar')
const root = require('app-root-path')
const Hook = require('console-hook')
const getFilePaths = require('./getJSXFilePaths')
const jsxDependencyTree = require('./JSXDependencyTree')
const replaceList = require('./replaceList')

type Constructor = {
  throwFlag: boolean
  watch: boolean
  src: string
  relativeRoot: string
  output: string
  replace: string[]
}

class JsxSimpleHtmlRender {
  private readonly replace: string[]
  private readonly throwFlag: boolean
  private readonly relativeRoot: string
  private readonly src: string
  private output: string
  private DTI: any

  constructor({ throwFlag, watch, src, relativeRoot, output, replace = [] }: Constructor) {
    this.replace = replace
    this.throwFlag = throwFlag
    this.relativeRoot = relativeRoot
    this.src = this.makePath(src)
    this.output = this.makePath(output)
    if (watch) {
      this.DTI = new jsxDependencyTree(this.src)
      this.exportHTML(this.DTI.tree)
      this.watch()
    } else {
      this.exportHTML(getFilePaths(this.src, true))
    }
  }

  watch() {
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

  makePath(path: string) {
    let replacePath = path
    if (replacePath.match(/\/$/)) {
      replacePath = replacePath.replace(/\/$/, '')
    }

    if (replacePath.match(/^\//)) {
      replacePath = replacePath.replace(/^\//, '')
    }
    return `${root}/${replacePath}/`
  }

  getOutputPath(target: string) {
    return target.replace(this.src, this.output).replace(/\.jsx/, '.html')
  }

  exportHTML(fileNames: object) {
    console.log(yellow('> export html'))
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const { renderToStaticMarkup } = require('react-dom/server')
    const errorHook = this.errorHook()
    for (const jsxPath in fileNames) {
      if (fileNames.hasOwnProperty(jsxPath)) {
        const outputPath = this.getOutputPath(jsxPath)
        outputFileSync(outputPath, this.getHTML(renderToStaticMarkup, jsxPath, this.getRelativePath(outputPath)))
      }
    }
    errorHook.detach()
    process.env.NODE_ENV = env
  }

  getRelativePath(targetPath: string) {
    const pathArray = targetPath.split('/')
    const pathLength = pathArray.length - pathArray.indexOf(this.relativeRoot) - 1
    let relativePath = ''
    if (pathLength === 1) return relativePath
    for (let i = 1; i < pathLength; i++) {
      relativePath = `${relativePath}../`
    }
    return relativePath
  }

  errorHook() {
    return Hook().attach((method: string, args: string) => {
      if (method.match(/(error|wran)/)) {
        throw `${Object.entries(args)
          .map(([, value]) => value)
          .join()}`
      }
    })
  }

  getHTML(renderToStaticMarkup: any, targetPath: string, relativePath: string) {
    try {
      const htmlMin = renderToStaticMarkup(require(targetPath).default({ relativePath }))
      console.log(blue(targetPath))
      return this.codeReplace(htmlMin)
    } catch (e) {
      console.log(red(targetPath))
      console.log(red(e))
      if (this.throwFlag) {
        throw ''
      }
      return 'Error'
    }
  }

  codeReplace(htmlCode: string) {
    let code = htmlCode
    const replace = this.replace.length === 0 ? replaceList : [...replaceList, ...this.replace]
    for (let i = 0; i < replace.length; i++) {
      code = code.replace(replace[i].regexp, replace[i].value)
    }
    return code
  }

  apply() {}
}

module.exports = JsxSimpleHtmlRender
