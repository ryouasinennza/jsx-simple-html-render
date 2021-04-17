import React from 'react'
import { Button } from '../components/Button'
import { Remove } from '../Remove'
export default ({ relativePath }) => {
  return (
    <html>
      <body>
        {[1, 2, 3, 4].map((value) => {
          return <Button key={value} />
        })}
        <Button />
        <Remove />
        {'<!-- replace -->'}
        {'<!-- comment out -->'}
        <div htmlonclick="console.log('click')">clicasss</div>
        <script src={`${relativePath}js/example.js`} />
      </body>
    </html>
  )
}
