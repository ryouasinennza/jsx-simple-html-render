const fs = require('fs-extra')
const root = require('app-root-path')
const ReactDOMServer = require('react-dom/server')
const { DependencyTree } = require('./DependencyTree')
const { Util } = require('./Util')
// Util継承して共通関数を使えるように
module.exports.JSXRenderToStaticMarkup = class extends Util {
  constructor(config) {
    super()
    this.root = `${root}/`
    this.entry = `${root}/${config.entry}/`
    this.output = `${root}/${config.output}/`
    this.relativeRoot = config.output
    // ファイル依存関係を取得
    this.DependencyTreeInstance = new DependencyTree(this.entry)
    // html作成
    this.outputHtml(this.getJSXFilePaths(this.entry))
  }

  // ファイル読み込み用の相対パスを取得できる
  // targetPathは出力先のパス
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

  // .htmlとして出力
  outputHtml(fileNames) {
    for (let i = 0; i < fileNames.length; i++) {
      const outputPath = this.getOutputPath(fileNames[i], this.entry, this.output)
      console.log(outputPath)
      fs.outputFileSync(outputPath, this.getHTML(fileNames[i], this.getRelativePath(outputPath)))
    }
  }

  // 依存関係を見て必要なHTMLのみ作成
  changeRender(changePath) {
    const fullPath = `${this.root}${changePath}`
    switch (this.DependencyTreeInstance.findDependencyFiles(fullPath)) {
      case 1:
        // 新しいページ追加
        // 新しいページであればリセットする
        console.log('add:', changePath)
        this.outputHtml(this.DependencyTreeInstance.resetDependencyTree())
        break
      case 2:
        // 既存更新
        console.log('change:', changePath)
        this.outputHtml(this.DependencyTreeInstance.clearRequireCache(fullPath))
        break
      case 3:
        // 読み込まれていないなら何もしない コンポーネントを作っただけなど
        console.warn(`not used: ${changePath}`)
        break
    }
  }

  // renderToStaticMarkupを使ってHTMLを出力
  // 合わせてエスケープされた文字列の置き換え
  getHTML(targetPath, relativePath) {
    const JSX = require(targetPath)
    const htmlMin = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(JSX.default({ PATH: relativePath }))}`
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
  }
}
