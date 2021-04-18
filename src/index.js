require('@babel/register')
const chalk = require('chalk')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const Hook = require('console-hook')
const root = require('app-root-path')
const replaceList = require('./replaceList')
const JSXDependencyTree = require('./JSXDependencyTree')

class JsxSimpleHtmlRender {
  constructor({ throwFlag, watch, src, relativeRoot, output, replace = [] }) {
    this.throwFlag = throwFlag
    this.src = this.makePath(src)
    this.relativeRoot = relativeRoot
    this.output = this.makePath(output)
    this.replace = replace
    this.DTI = new JSXDependencyTree(this.src)
    this.exportHTML(this.DTI.tree)

    if (watch) {
      this.watch()
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
    for (const prop in fileNames) {
      if (fileNames.hasOwnProperty(prop)) {
        const outputPath = this.getOutputPath(prop)
        console.log(chalk.blue(outputPath))
        fs.outputFileSync(outputPath, this.getHTML(prop, this.getRelativePath(outputPath)))
      }
    }
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

  getHTML(targetPath, relativePath) {
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    try {
      const ReactDOMServer = require('react-dom/server')
      const errorHook = this.errorHook()
      const JSX = require(targetPath)
      const htmlMin = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(JSX.default({ relativePath }))}`
      errorHook.detach()
      return this.codeReplace(htmlMin)
    } catch (e) {
      console.log('\n', e)
      if (this.throwFlag) {
        throw ''
      }
      return 'Error'
    } finally {
      process.env.NODE_ENV = env
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

  apply(compiler) {}
}

module.exports = JsxSimpleHtmlRender
