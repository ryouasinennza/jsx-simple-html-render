import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Index } from '../src/html/Index'
import fs from 'fs-extra'
import appRoot from 'app-root-path'
import prettier from 'prettier'
import { getPrettierHtmlConfig } from './geter'

const html = '<!DOCTYPE>' + ReactDOMServer.renderToStaticMarkup(<Index />)
const html2 = prettier.format(html, getPrettierHtmlConfig())
fs.writeFileSync(`${appRoot}/dist/index.html`, html2)
console.log('htmlBuild')
