# jsx-simple-html-render
Webpack plugin that simply outputs HTML files using JSX

## Getting Started
**Please install react environment and** `@babel/register` **to use**

```
npm i -D jsx-simple-html-render
```

**webpack.config.js**

```javascript
const ConvertJSXToHTML = require('./dist/index')
  
// ...
plugins: [
    new ConvertJSXToHTML({
      throwFlag: false, // true if you want to throw with react error
      watch: true, // Hot reload
      src: 'src/jsx',// JSX source dir
      relativeRoot: 'dist', // Relative path origin
      output: 'dist', // HTML output dir
      replace: [ // HTML string replacement 
        {
          regexp: /<!-- replace -->/,
          value: 'hello'
        }
      ]
    })
  ]
```

## Usage

- Use `.jsx` extension to output HTML
- `.js` is not output as HTML
- Use `export default` in `.jsx`


```javascript
import React from 'react'

export default ({ relativePath }) => { // You can get relative paths in .jsx
  return (
    <html>
      <body>
        <a href="template/ExampleHTML.html">ExampleHTML</a>
        {'<!-- comment out -->'} {/* HTML comment out output */}
        <script src={`${relativePath}js/example.js`} />
      </body>
    </html>
  )
}
```

## Replace
Some attributes cannot be output as pure HTML because react is used
Replacement list that jsx-simple-html-render puts by default

```javascript
[
  { regexp: /&lt;/g, value: '<' },
  { regexp: /&gt;/g, value: '>' },
  { regexp: /&amp;/g, value: '&' },
  { regexp: /charSet=/g, value: 'charset=' },
  { regexp: /frameBorder=/g, value: 'frameborder=' },
  { regexp: /htmlonclick/g, value: 'onclick' },
  { regexp: /hrefLang/g, value: 'hreflang' },
  { regexp: /colSpan/g, value: 'colspan' },
  { regexp: /&#x27;/g, value: "'" },
  { regexp: /htmlchecked/g, value: 'checked' },
  { regexp: /async=""/g, value: 'async' }
]
```
