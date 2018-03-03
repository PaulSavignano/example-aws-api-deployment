import express from 'express'
import bodyParser from 'body-parser'
import dns from 'dns'
import expressValidator from 'express-validator'
import helmet from 'helmet'
import path from 'path'

import mongoose from './db/mongoose'
import forceSSL from './middleware/forceSSL'

import catchErrors from './utils/catchErrors'
import addresses from './routes/addresses'
import apiConfigs from './routes/apiConfigs'
import blogs from './routes/blogs'
import brands from './routes/brands'
import carts from './routes/carts'
import components from './routes/components'
import orders from './routes/orders'
import pages from './routes/pages'
import products from './routes/products'
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

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/addresses', addresses)
app.use('/api/api-configs', apiConfigs)
app.use('/api/blogs', blogs)
app.use('/api/brands', brands)
app.use('/api/carts', carts)
app.use('/api/components', components)
app.use('/api/orders', orders)
app.use('/api/pages', pages)
app.use('/api/products', products)
app.use('/api/sections', sections)
app.use('/api/themes', themes)
app.use('/api/users', users)

app.use('/api/moverbase', moverbase)

app.get('/', (req, res) => {
  res.send(`
    <div style="display: flex; flex-flow: column; justify-content: center; align-items: center; height: 85vh;">
      <h1 style="font-weight: 300; font-family: Helvetica Neue, Open Sans, sans-serif;">Savignano.io API</h1>
    </div>
  `)
})

app.use((err, req, res, next) => {
  console.log('error: ', err)
  console.log('error field: ', err.field)
  console.log('error message: ', err.message)
  const statusCode = err.statusCode || 400
  res.status(statusCode).send(err)
})

app.listen(port, () => console.info(`Api running at port: ${port}`))

export default app
