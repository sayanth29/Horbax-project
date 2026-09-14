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

// IST offset in milliseconds (+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/**
 * Get IST "start of day" and "end of day" as UTC Date objects.
 * This ensures that "today" in IST maps correctly even when the
 * server runs in UTC (e.g. Vercel).
 */
const getISTDayBounds = (date: Date = new Date()) => {
  // Current UTC time + IST offset = IST clock time
  const istNow = new Date(date.getTime() + IST_OFFSET_MS)

  // Start of day in IST (00:00:00.000 IST → subtract offset to get UTC)
  const startIST = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()))
  const start = new Date(startIST.getTime() - IST_OFFSET_MS)

  // End of day in IST (23:59:59.999 IST → subtract offset to get UTC)
  const endIST = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(), 23, 59, 59, 999))
  const end = new Date(endIST.getTime() - IST_OFFSET_MS)

  return { start, end }
}

/**
 * Parse a YYYY-MM-DD string as an IST date and return UTC bounds.
 */
const getISTDayBoundsFromString = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)

  // Start of day in IST → UTC
  const startIST = new Date(Date.UTC(year, month - 1, day))
  const start = new Date(startIST.getTime() - IST_OFFSET_MS)

  // End of day in IST → UTC
  const endIST = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
  const end = new Date(endIST.getTime() - IST_OFFSET_MS)

  return { start, end }
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

/**
 * Fetch orders for a given date range using COLLECTION logic:
 * - Completed orders → filter by completedAt (when money was collected)
 * - Pending/ready orders → filter by createdAt (when order was placed)
 *
 * This ensures that an order placed yesterday but collected today
 * shows in today's collection — because the money came in today.
 */
const fetchCollectionOrders = async (start: Date, end: Date) => {
  const dateRange = { $gte: start, $lte: end }

  // Two parallel queries for the two different date fields
  const [completedOrders, pendingOrders] = await Promise.all([
    // Completed orders: filter by completedAt (collection date)
    Order.find({
      status: 'completed',
      completedAt: dateRange,
    }).sort({ completedAt: -1 }).lean(),

    // Pending/ready orders: filter by createdAt (order date)
    Order.find({
      status: { $in: ['pending', 'ready'] },
      createdAt: dateRange,
    }).sort({ createdAt: -1 }).lean(),
  ])

  return [...completedOrders, ...pendingOrders]
}

// GET /api/collection/today
// Returns today's collection: completed orders collected today + pending orders created today
export const getTodayCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = getISTDayBounds()
    const orders = await fetchCollectionOrders(start, end)

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
    const { start, end } = getISTDayBoundsFromString(date as string)
    const orders = await fetchCollectionOrders(start, end)

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/collection/month
// Returns current month's collection
export const getMonthCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current IST date
    const istNow = new Date(Date.now() + IST_OFFSET_MS)
    const year = istNow.getUTCFullYear()
    const month = istNow.getUTCMonth()

    // First day of month in IST → UTC
    const startIST = new Date(Date.UTC(year, month, 1))
    const start = new Date(startIST.getTime() - IST_OFFSET_MS)

    // Last day of month in IST → UTC
    const lastDay = new Date(Date.UTC(year, month + 1, 0))
    const endIST = new Date(Date.UTC(year, month, lastDay.getUTCDate(), 23, 59, 59, 999))
    const end = new Date(endIST.getTime() - IST_OFFSET_MS)

    const orders = await fetchCollectionOrders(start, end)

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

    const { start } = getISTDayBoundsFromString(from as string)
    const { end } = getISTDayBoundsFromString(to as string)

    const orders = await fetchCollectionOrders(start, end)

    res.json({ summary: calcSummary(orders), orders })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
