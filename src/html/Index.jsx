import React from 'react'
import { Main } from './Main'

export const Index = () => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>Title</title>
        <link rel="stylesheet" href="./css/myPage.css" />
        <link rel="stylesheet" href="./css/subPage.css" />
      </head>
      <body>
        {Main()}
        <script src="./js/app.js" />
      </body>
    </html>
  )
}
