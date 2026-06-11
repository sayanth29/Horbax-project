import express from 'express'
import { getTodayCollection, getMonthCollection, getAllCollection, getDateCollection,getRangeCollection} from '../controllers/collection.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/today', protect, getTodayCollection)
router.get('/month', protect, getMonthCollection)
router.get('/all', protect, getAllCollection)
router.get('/date/:date', protect, getDateCollection)
router.get('/range',protect,getRangeCollection)

export default router
