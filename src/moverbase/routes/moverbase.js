import express from 'express'

import { requestEstimate } from '../controllers/moverbase'

const moverbase = express.Router()

moverbase.post('/:appName/request-estimate', requestEstimate)

export default moverbase
