require('@babel/register')
const chalk = require('chalk')
const fsExtra = require('fs-extra')
const chokidar = require('chokidar')
const Hook = require('console-hook')
const root = require('app-root-path')
const replaceList = require('./replaceList')
const getJSXFilePaths = require('./getJSXFilePaths')
const JSXDependencyTree = require('./JSXDependencyTree')

class JsxSimpleHtmlRender {
  constructor({ throwFlag, watch, src, relativeRoot, output, replace = [] }) {
    this.replace = replace
    this.throwFlag = throwFlag
    this.relativeRoot = relativeRoot
    this.src = this.makePath(src)
    this.output = this.makePath(output)
    if (watch) {
      this.DTI = new JSXDependencyTree(this.src)
      this.exportHTML(this.DTI.tree)
      this.watch()
    } else {
      this.exportHTML(getJSXFilePaths(this.src, true))
    }
  }

  watch() {
    const watcher = chokidar.watch(this.src, {
      persistent: true
    })
    watcher.on('ready', () => {
      watcher.on('change', (path) => {
        this.exportHTML(this.DTI.findDependencyFiles(path))
      })
      watcher.on('add', (path) => {
        this.exportHTML(this.DTI.setTree(path))
      })
      watcher.on('unlink', (path) => {
        this.DTI.removeDependency(path)
      })
    })
  }

  makePath(path) {
    let replacePath = path
    if (replacePath.match(/\/$/)) {
      replacePath = replacePath.replace(/\/$/, '')
    }

    if (replacePath.match(/^\//)) {
      replacePath = replacePath.replace(/^\//, '')
    }
    return `${root}/${replacePath}/`
  }

  getOutputPath(target) {
    return target.replace(this.src, this.output).replace(/\.jsx/, '.html')
  }

  exportHTML(fileNames) {
    console.log(chalk.yellow('> export html'))
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const { renderToStaticMarkup } = require('react-dom/server')
    const errorHook = this.errorHook()
    for (const jsxPath in fileNames) {
      if (fileNames.hasOwnProperty(jsxPath)) {
        const outputPath = this.getOutputPath(jsxPath)
        fsExtra.outputFileSync(
          outputPath,
          this.getHTML(renderToStaticMarkup, jsxPath, this.getRelativePath(outputPath))
        )
      }
    }
    errorHook.detach()
    process.env.NODE_ENV = env
  }

  getRelativePath(targetPath) {
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
    return Hook().attach((method, args) => {
      if (method.match(/(error|wran)/)) {
        throw `${Object.entries(args)
          .map(([, value]) => value)
          .join()}`
      }
    })
  }

  getHTML(renderToStaticMarkup, targetPath, relativePath) {
    try {
      const htmlMin = renderToStaticMarkup(require(targetPath).default({ relativePath }))
      console.log(chalk.blue(targetPath))
      return this.codeReplace(htmlMin)
    } catch (e) {
      console.log(chalk.red(targetPath))
      console.log(chalk.red(e))
      if (this.throwFlag) {
        throw ''
      }
      return 'Error'
    }
  }

  codeReplace(htmlCode) {
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
