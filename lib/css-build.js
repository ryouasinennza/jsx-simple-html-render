const fs = require('fs')
const sass = require('node-sass')
const postcss = require('postcss')
const prettier = require('prettier')
const appRoot = require('app-root-path')
const autoPreFixer = require('autoprefixer')
const prettierConfig = require(`${appRoot}/prettier.config.js`)
const scssConfig = require(`${appRoot}/scss.config.js`)

const getPrettierCssConfig = config => {
  if (config.overrides) {
    const configObj = config.overrides.find(val => {
      return /css/.test(val.files)
    })

    return configObj.options
  } else {
    config.parser = 'css'
    return config
  }
}

const distPath = `${appRoot}/${scssConfig.outputDir}`
const prettierCssConfig = getPrettierCssConfig(prettierConfig)

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

  // entryポイント全て
  const loop = () => {
    for (const [index, data] of Object.keys(scssConfig.entry).entries()) {
      const from = `${appRoot}/${scssConfig.entry[data]}`
      const to = `${distPath + data}.css`
      build(from, to)
    }
  }

  // entryポイント 個別
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

module.exports.cssBuild = (changePath, env) => cssBuild(changePath, env)
