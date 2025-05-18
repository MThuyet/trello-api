import express from 'express'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'

const Router = express.Router()

// Board API
Router.use('/boards', boardRoute)

// Column API
Router.use('/columns', columnRoute)

export const APIs_V1 = Router
