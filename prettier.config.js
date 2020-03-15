module.exports = {
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'none',
  semi: false,
  overrides: [
    {
      files: '*.{css,scss}',
      options: {
        printWidth: 120,
        tabWidth: 2,
        parser: 'css'
      }
    },
    {
      files: '*.html',
      options: {
        printWidth: 180,
        tabWidth: 2,
        parser: 'html'
      }
    }
  ]
}
