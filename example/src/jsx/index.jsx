import React from 'react'

export default ({ relativePath }) => {
  return (
    <html>
      <body>
        <a href="template/ExampleHTML.html">ExampleHTML</a>
        <script src={`${relativePath}js/example.js`} />
      </body>
    </html>
  )
}
