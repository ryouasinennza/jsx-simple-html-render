require('better-logging')(console)
const chokidar = require('chokidar')
const { config } = require('./config')
const { JSXRenderToStaticMarkup } = require('./JSXRenderToStaticMarkup')
// newした時にHTMLが出力される
const Instance = new JSXRenderToStaticMarkup(config)
// ファイル監視
if (process.argv.some(argv => argv === 'watch')) {
  const watcher = chokidar.watch(config.watchRoot, {
    persistent: true
  })
  // ready後にイベントを付けないとスタートした時にeventが動いてしまう
  watcher.on('ready', () => {
    watcher.on('change', path => {
      Instance.changeRender(path)
    })
  })
}
