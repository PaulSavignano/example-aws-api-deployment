import express from 'express'
import bodyParser from 'body-parser'
import dns from 'dns'
import expressValidator from 'express-validator'
import helmet from 'helmet'
import path from 'path'
import compression from 'compression'
import RateLimit from 'express-rate-limit'

import mongoose from './db/mongoose'
import setAppName from './middleware/setAppName'
import forceSSL from './middleware/forceSSL'
import router from './routes/index'

const port = process.env.PORT
const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})

const app = express()

app.use(limiter)
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
    <div style="display: flex; flex-flow: column; justify-content: center; align-items: center; height: 85vh;">
      <h1 style="font-weight: 300; font-family: Helvetica Neue, Open Sans, sans-serif;">Savignano.io API</h1>
    </div>
  `)
})

app.use((err, req, res, next) => {
  console.error('error: ', err)
  console.error('error field: ', err.field)
  console.error('error message: ', err.message)
  const statusCode = err.statusCode || 400
  res.status(statusCode).send(err)
})

app.listen(port, () => console.info(`Server running at port: ${port}`))

export default app
