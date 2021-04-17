require('@babel/register')
const fs = require('fs-extra')
const chalk = require('chalk')
const { JSXDependencyTree } = require('./JSXDependencyTree')
const Hook = require('console-hook')
const chokidar = require('chokidar')
const root = require('app-root-path')

class ConvertJSXToHTML {
  constructor({ src, dist, output, watch, dev }) {
    this.dev = dev
    this.src = this.makePath(src)
    this.dist = dist
    this.output = this.makePath(output)
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
    const pathLength = pathArray.length - pathArray.indexOf(this.dist) - 1
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
      return htmlMin
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/charSet=/g, 'charset=')
        .replace(/frameBorder=/g, 'frameborder=')
        .replace(/replaceonclick/g, 'onclick')
        .replace(/replacehistory/g, 'href')
        .replace(/hrefLang/g, 'hreflang')
        .replace(/colSpan/g, 'colspan')
        .replace(/&#x27;/g, "'")
        .replace(/replacechecked/g, 'checked')
        .replace(/replacedataytid/g, 'data-ytMovieId')
        .replace(/replacedatayttype/g, 'data-ytMovieType')
        .replace(/async=""/g, 'async')
    } catch (e) {
      console.log('\n', e)
      if (this.dev) {
        return 'Error'
      }
      throw ''
    } finally {
      process.env.NODE_ENV = env
    }
  }

  apply(compiler) {}
}

module.exports = ConvertJSXToHTML
