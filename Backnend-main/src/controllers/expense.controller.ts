import { Request, Response } from 'express'
import Expense from '../models/expense.js'

// GET /api/expenses — all expenses newest first
export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/expenses/today
export const getTodayExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const expenses = await Expense.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 })

    const total      = expenses.reduce((sum, e) => sum + e.amount, 0)
    const shopTotal  = expenses.filter(e => e.expenseType === 'shop').reduce((sum, e) => sum + e.amount, 0)
    const ownerTotal = expenses.filter(e => e.expenseType === 'owner').reduce((sum, e) => sum + e.amount, 0)

    const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    res.json({ total, shopTotal, ownerTotal, byCategory, expenses })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/expenses/month
export const getMonthExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const now   = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const expenses = await Expense.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 })

    const total      = expenses.reduce((sum, e) => sum + e.amount, 0)
    const shopTotal  = expenses.filter(e => e.expenseType === 'shop').reduce((sum, e) => sum + e.amount, 0)
    const ownerTotal = expenses.filter(e => e.expenseType === 'owner').reduce((sum, e) => sum + e.amount, 0)

    const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    res.json({ total, shopTotal, ownerTotal, byCategory, expenses })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/expenses/range?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getRangeExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query

    const start = new Date(from as string)
    start.setHours(0, 0, 0, 0)

    const end = new Date(to as string)
    end.setHours(23, 59, 59, 999)

    const expenses = await Expense.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 })

    const total      = expenses.reduce((sum, e) => sum + e.amount, 0)
    const shopTotal  = expenses.filter(e => e.expenseType === 'shop').reduce((sum, e) => sum + e.amount, 0)
    const ownerTotal = expenses.filter(e => e.expenseType === 'owner').reduce((sum, e) => sum + e.amount, 0)

    const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    res.json({ total, shopTotal, ownerTotal, byCategory, expenses })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/expenses
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemName, amount, category, expenseType, notes } = req.body

    if (!itemName || !amount || !category || !expenseType) {
      res.status(400).json({ message: 'All fields are required' })
      return
    }

    const expense = await Expense.create({
      itemName, amount, category, expenseType, notes
    })
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/expenses/:id
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' })
      return
    }
    res.json({ message: 'Expense deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}