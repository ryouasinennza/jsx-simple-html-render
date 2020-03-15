import appRoot from 'app-root-path'

const prettierConfig = require(`${appRoot}/prettier.config.js`)

export const getPrettierHtmlConfig = () => {
  if (prettierConfig.overrides) {
    const configObj = prettierConfig.overrides.find(val => {
      return /html/.test(val.files)
    })

    return configObj.options
  } else {
    return { ...prettierConfig, ...{ parser: 'html' } }
  }
}

export const getPrettierCssConfig = () => {
  if (prettierConfig.overrides) {
    const configObj = prettierConfig.overrides.find(val => {
      return /css/.test(val.files)
    })

    return configObj.options
  } else {
    return { ...prettierConfig, ...{ parser: 'css' } }
  }
}
