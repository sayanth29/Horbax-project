import { Request, Response } from 'express'
import Order from '../models/Order.js'

// Shape used by calcSummary — works with both full documents and lean objects
interface OrderData {
  status: string
  upiAmount?: number
  cashAmount?: number
  total: number
  dueAmount?: number
}

// Helper: calculate collection summary from a list of orders
const calcSummary = (orders: OrderData[]) => {
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const pendingOrders = orders.filter((o) => o.status !== 'completed')

  return {
    totalCollected: orders.reduce((sum, o) => sum + (o.upiAmount || 0) + (o.cashAmount || 0), 0),
    totalUPI: orders.reduce((sum, o) => sum + (o.upiAmount || 0), 0),
    totalCash: orders.reduce((sum, o) => sum + (o.cashAmount || 0), 0),
    totalPending: orders.reduce((sum, o) => {
      if (o.status === 'completed') {
        return sum + (o.dueAmount || 0)
      }
      const paid = (o.upiAmount || 0) + (o.cashAmount || 0)
      return sum + Math.max(0, o.total - paid)
    }, 0),
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
  }
}

// GET /api/collection/today
// Returns today's orders with a collection summary
export const getTodayCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).lean()

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/collection/date/:date
// date format: YYYY-MM-DD
export const getDateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params
    const start = new Date(date as string)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date as string)
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).lean()

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/collection/month
// Returns current month's orders with a collection summary
export const getMonthCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    start.setHours(0, 0, 0, 0)

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).lean()

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/collection/all
// Returns all orders with a collection summary
export const getAllCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean()

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }

}

// GET /api/collection/range?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getRangeCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query

    if (!from || !to) {
      res.status(400).json({ message: 'Both "from" and "to" dates are required' })
      return
    }

    const start = new Date(from as string)
    start.setHours(0, 0, 0, 0)

    const end = new Date(to as string)
    end.setHours(23, 59, 59, 999)

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).lean()

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

