import express from 'express'
import {
  getAllExpenses,
  getTodayExpenses,
  getMonthExpenses,
  getRangeExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expense.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/',       protect, getAllExpenses)
router.get('/today',  protect, getTodayExpenses)
router.get('/month',  protect, getMonthExpenses)
router.get('/range',protect,getRangeExpenses)
router.post('/',      protect, createExpense)
router.delete('/:id', protect, deleteExpense)

export default router