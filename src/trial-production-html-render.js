const React = require('react')
const { renderToStaticMarkup } = require('react-dom/cjs/react-dom-server.node.development.js')
const fs = require('fs-extra')
const appRoot = require('app-root-path')
const read = require('fs-readdir-recursive')
const child_process = require('child_process')
const fork = child_process.fork(`${appRoot}/task-runner/lib/html/dependencyTree.js`)
const { colorConsoleLog, isDevEnv } = require('../util')
const { targetDir, distDir, indexDir, buildReplaceText_1 } = require('./config')

let dependencyTreeCache = {}

const getRelativePath = targetPath => {
  const pathArray = targetPath.split('/')
  const pathLength = pathArray.length - pathArray.indexOf('template') - 1
  let relativePath = ''
  for (let i = 0; i < pathLength; i++) {
    relativePath = `${relativePath}../`
  }
  return relativePath
}

const render = (targetPath, distPath, env) => {
  try {
    const JSX = require(targetPath)
    const htmlMin = '<!DOCTYPE html>' + renderToStaticMarkup(JSX.default({ PATH: getRelativePath(targetPath) }))
    const result = htmlMin
      .replace(/&lt;!--/g, '<!--')
      .replace(/--&gt;/g, '-->')
      .replace(/&amp;/g, '&')
      .replace('#BUILD_REPLACE_1#', buildReplaceText_1)
      .replace(/charSet=/g, 'charset=')
      .replace(/frameBorder=/g, 'frameborder=')
      .replace(/replaceonclick/g, 'onclick')
      .replace(/replacehistory/g, 'href')
      .replace(/hrefLang/g, 'hreflang')
      .replace(/colSpan/g, 'colspan')
      .replace(/&#x27;/g, "'")
    fs.outputFileSync(distPath, result)
  } catch (e) {
    colorConsoleLog(targetPath, 'red')
    if (!isDevEnv(env)) {
      throw e
    } else {
      console.log(e)
    }
  }
}

const indexRender = env => {
  const target = `${targetDir}index.jsx`
  delete require.cache[target]
  render(target, `${indexDir}index.html`, env)
}

const allBuild = env => {
  // template配下.js&index.jsx&AMPディレクトリ以外の全てのファイルパス取得
  const files = read(targetDir, name => !/(\.js|index\.jsx|\.mdx)$/.test(name) && !/AMP/g.test(name))
  // 依存関係の取得してキャシュする 重いのでfork
  fork.once('message', tree => {
    dependencyTreeCache = tree
  })
  fork.send(files)
  // 入力と出力のパスを作成するため拡張子を削除
  const paths = files.map(val => val.replace(/\.jsx/, ''))
  // レンダリング
  for (let i = 0; i < paths.length; i++) {
    const target = `${targetDir}${paths[i]}.jsx`
    render(target, `${distDir}${paths[i]}.html`, env)
  }
  colorConsoleLog(`Html build all >>> OK`, 'green')
}

const getDependencyFiles = fullPath => {
  let list = []
  for (const prop in dependencyTreeCache) {
    if (dependencyTreeCache.hasOwnProperty(prop)) {
      if (dependencyTreeCache[prop].some(val => `/${val}` === fullPath)) {
        list.push(prop)
      }
    }
  }
  return list
}

const changeBuild = (changePath, env) => {
  const fullPath = `${appRoot}/${changePath}`
  // キャシュから使用しているJSXパスを取得
  const fileNames = getDependencyFiles(fullPath)
  delete require.cache[fullPath]
  for (let i = 0; i < fileNames.length; i++) {
    for (let i2 = 0; i2 < dependencyTreeCache[fileNames[i]].length; i2++) {
      delete require.cache[`/${dependencyTreeCache[fileNames[i]][i2]}`]
    }
    const dist = fileNames[i].replace('.jsx', '.html').replace(targetDir, distDir)
    colorConsoleLog(`change ${dist}`, 'blue')
    render(fileNames[i], dist, env)
  }
  colorConsoleLog(`Html changeBuild >>> OK`, 'green')
}

module.exports = (changePath, env) => {
  try {
    // index.html作成
    indexRender(env)
    if (changePath) {
      changeBuild(changePath, env)
    } else {
      allBuild(env)
    }
  } catch (e) {
    throw e
  }
}
