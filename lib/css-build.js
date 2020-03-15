const fs = require('fs')
const sass = require('node-sass')
const postcss = require('postcss')
const prettier = require('prettier')
const appRoot = require('app-root-path')
const autoPreFixer = require('autoprefixer')
const scssConfig = require(`${appRoot}/scss.config.js`)
import { getPrettierCssConfig } from './geter'

const distPath = `${appRoot}/${scssConfig.outputDir}`
const prettierCssConfig = getPrettierCssConfig()

const cssBuild = async (changePath, env) => {
  const isDevEnv = env === 'development'
  fs.mkdir(`${appRoot}/dist/css`, () => {})

  // scss -> css 変換
  const build = (from, to) => {
    try {
      const cssObj = sass.renderSync({
        file: from,
        outputStyle: isDevEnv ? 'nested' : 'compressed',
        sourceComments: isDevEnv
      })

      postcss([autoPreFixer])
        .process(cssObj.css, { from, to })
        .then(result => {
          if (isDevEnv) {
            fs.writeFileSync(to, prettier.format(result.css, prettierCssConfig))
            console.log('>>> scss compile OK!')
          } else {
            fs.writeFileSync(to, result.css)
            console.log('>>> scss compile OK!')
          }
        })
    } catch (e) {
      throw e.message
    }
    return true
  }

  // entry全て
  const loop = () => {
    for (const [index, data] of Object.keys(scssConfig.entry).entries()) {
      const from = `${appRoot}/${scssConfig.entry[data]}`
      const to = `${distPath + data}.css`
      build(from, to)
    }
  }

  // entry個別
  if (changePath) {
    const replacePath = changePath.replace(/(\\|\/)/g, '/')
    const path = Object.keys(scssConfig.entry).find(key => {
      return replacePath === scssConfig.entry[key]
    })
    if (path) {
      const from = `${appRoot}/${scssConfig.entry[path]}`
      const to = `${distPath + path}.css`
      await build(from, to)
    } else {
      await loop()
    }
  } else {
    await loop()
  }
}

const changePath = process.argv[2]
const env = process.argv[3]
cssBuild(changePath, env).then()
