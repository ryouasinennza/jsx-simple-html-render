import React from 'react'
import { Button } from '../components/Button'
export default ({ relativePath }) => {
  return (
    <html>
      <body>
        {[1, 2, 3, 4].map((value) => {
          return <Button key={value} />
        })}
        <script src={`${relativePath}js/example.js`} />
      </body>
    </html>
  )
}
