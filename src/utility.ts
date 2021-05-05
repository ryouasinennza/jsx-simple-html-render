import Hook from 'console-hook'
import root from 'app-root-path'
import { readdirSync } from 'fs-extra'
import { yellow, blue, red } from 'chalk'
import { ReplaceList, TreeObject } from './@types/types'

export const log = {
  r: (text: string) => {
    console.log(red(text))
  },
  b: (text: string) => {
    console.log(blue(text))
  },
  y: (text: string) => {
    console.log(yellow(text))
  }
}

export const makeFullPath = (path: string): string => {
  let replacePath = path
  if (replacePath.match(/\/$/)) {
    replacePath = replacePath.replace(/\/$/, '')
  }

  if (replacePath.match(/^\//)) {
    replacePath = replacePath.replace(/^\//, '')
  }
  return `${root}/${replacePath}/`
}

export const errorHook = () => {
  return Hook().attach((method: string, args: string) => {
    if (method.match(/(error|wran)/)) {
      throw `${Object.entries(args)
        .map(([, value]) => value)
        .join()}`
    }
  })
}

export const replaceLoop = (targetString: string, replaceArray: ReplaceList): string => {
  let str = targetString
  for (let i = 0; i < replaceArray.length; i++) {
    str = str.replace(replaceArray[i].regexp, replaceArray[i].value)
  }
  return str
}

export const getJSXFilePaths = <T>(root: string, returnObj: boolean): T => {
  const files: any = returnObj ? {} : []
  const readDir = (dirArray: string[], prefix: string | boolean) => {
    prefix = prefix ? `${prefix}/` : ''
    for (let i = 0; i < dirArray.length; i++) {
      if (!!dirArray[i].match(/\.(js|jsx)$/)) {
        if (dirArray[i].match(/\.jsx$/)) {
          const path = `${root}${prefix}${dirArray[i]}`
          if (returnObj) {
            files[`${path}`] = []
          } else {
            files.push(path)
          }
        }
      } else {
        const recursionDir = readdirSync(`${root}${prefix}${dirArray[i]}`)
        readDir(recursionDir, `${prefix}${dirArray[i]}`)
      }
    }
  }
  readDir(readdirSync(root), false)

  return files
}
