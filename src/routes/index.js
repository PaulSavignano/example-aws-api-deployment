import express from 'express'

import addresses from './addresses'
import apps from './apps'
import blogs from './blogs'
import brands from './brands'
import carts from './carts'
import comments from './comments'
import components from './components'
import configs from './configs'
import orders from './orders'
import pages from './pages'
import products from './products'
import reviews from './reviews'
import searches from './searches'
import sections from './sections'
import themes from './themes'
import users from './users'

import moverbase from '../moverbase/routes/moverbase'

const router = express.Router()

router.use('/addresses', addresses)
router.use('/apps', apps)
router.use('/blogs', blogs)
router.use('/brands', brands)
router.use('/carts', carts)
router.use('/comments', comments)
router.use('/components', components)
router.use('/configs', configs)
router.use('/orders', orders)
router.use('/pages', pages)
router.use('/products', products)
router.use('/reviews', reviews)
router.use('/searches', searches)
router.use('/sections', sections)
router.use('/themes', themes)
router.use('/users', users)

router.use('/moverbase', moverbase)

export default router
