import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Index } from '../src/html/Index'
import fs from 'fs-extra'
import appRoot from 'app-root-path'
import prettier from 'prettier'
const prettierConfig = require(`${appRoot}/prettier.config.js`)
const { exec } = require('child_process')

module.exports.htmlCommand = () => {
  exec(`babel-node ${appRoot}/lib/html-build`, (err, stdout, stderr) => {
    if (err) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })
}

export const getPrettierHtmlConfig = config => {
  if (config.overrides) {
    const configObj = config.overrides.find(val => {
      return /html/.test(val.files)
    })

    return configObj.options
  } else {
    config.parser = 'html'
    return config
  }
}

const html = '<!DOCTYPE>' + ReactDOMServer.renderToStaticMarkup(<Index />)
const html2 = prettier.format(html, getPrettierHtmlConfig(prettierConfig))
fs.writeFileSync(`${appRoot}/dist/index.html`, html2)
console.log('htmlBuild')
