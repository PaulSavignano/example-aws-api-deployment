import express from 'express'

import { requestEstimate } from '../controllers/moverbase'

const moverbase = express.Router()

moverbase.post('/:brandName/request-estimate', requestEstimate)

export default moverbase
