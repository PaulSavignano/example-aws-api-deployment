import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'

import mongoose from './db/mongoose'
import setAppName from './middleware/setAppName'
import forceSSL from './middleware/forceSSL'
import router from './routes/index'
import notFound from './routes/notFound'

const port = process.env.PORT

const app = express()

app.use(forceSSL)
app.use(helmet())
app.use(compression())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, cartId")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token, cartId')
  next()
})

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/:appName', setAppName, router)

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          .text-container {
            display: flex;
            flex-flow: column;
            justify-content: center;
            align-items: center;
            height: 85vh;
          }
          h1 {
            font-weight: 300;
            font-family: Helvetica Neue, Open Sans, sans-serif;
          }
        </style>
        <title>Savignano.io API</title>
        <meta name="description" content="Savignano.io api"/>
      </head>
      <body>
        <div class="text-container">
          <h1>Example AWS API Deployment</h1>
        </div>
      </body>
    </html>
  `)
})

app.use(notFound)

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) return
  const { name, field, message } = err
  const error = {
    name,
    field,
    message,
  }
  const statusCode = err.statusCode || 400
  res.status(statusCode).send(error)
})

app.listen(port, () => console.info(`Server running at port: ${port}`))

export default app
