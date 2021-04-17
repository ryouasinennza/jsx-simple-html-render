import React from 'react'
import { Button } from './components/Button'
import { Remove } from './Remove'

export default ({ relativePath }) => {
  return (
    <html>
      <body>
        <Button />
        <Remove />
        <script src={`${relativePath}js/example.js`} />
      </body>
    </html>
  )
}
