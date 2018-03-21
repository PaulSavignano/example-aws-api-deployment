import express from 'express'

import catchErrors from '../utils/catchErrors'
import { search } from '../controllers/search'

const searches = express.Router()

searches.get('/', catchErrors(search))

export default searches
