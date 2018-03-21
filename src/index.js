import express from 'express'
import bodyParser from 'body-parser'
import dns from 'dns'
import expressValidator from 'express-validator'
import helmet from 'helmet'
import path from 'path'

import mongoose from './db/mongoose'
import setAppName from './middleware/setAppName'
import forceSSL from './middleware/forceSSL'

import catchErrors from './utils/catchErrors'
import addresses from './routes/addresses'
import configs from './routes/configs'
import blogs from './routes/blogs'
import brands from './routes/brands'
import carts from './routes/carts'
import components from './routes/components'
import orders from './routes/orders'
import pages from './routes/pages'
import products from './routes/products'
import reviews from './routes/reviews'
import searches from './routes/searches'
import sections from './routes/sections'
import themes from './routes/themes'
import users from './routes/users'

import moverbase from './moverbase/routes/moverbase'

const app = express()
const port = process.env.PORT

app.use(forceSSL)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, cartId")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token, cartId')
  next()
})

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: false }))


app.use('/api/:appName/addresses', setAppName, addresses)
app.use('/api/:appName/configs', setAppName, configs)
app.use('/api/:appName/blogs', setAppName, blogs)
app.use('/api/:appName/brands', setAppName, brands)
app.use('/api/:appName/carts', setAppName, carts)
app.use('/api/:appName/components', setAppName, components)
app.use('/api/:appName/orders', setAppName, orders)
app.use('/api/:appName/pages', setAppName, pages)
app.use('/api/:appName/products', setAppName, products)
app.use('/api/:appName/reviews', setAppName, reviews)
app.use('/api/:appName/searches', setAppName, searches)
app.use('/api/:appName/sections', setAppName, sections)
app.use('/api/:appName/themes', setAppName, themes)
app.use('/api/:appName/users', setAppName, users)

app.use('/api/:appName/moverbase', moverbase)

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
