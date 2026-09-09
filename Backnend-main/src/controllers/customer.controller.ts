import { Request, Response } from 'express'
import Customer from '../models/customer.js'
import Order from '../models/Order.js'

// GET /api/customers
// Returns all customers with their order stats
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }).lean()

    // Single aggregation to get order stats for ALL customers at once
    // (replaces N+1 individual queries — massive speed improvement)
    const orderStats = await Order.aggregate([
      { $group: {
        _id: '$phone',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' }
      }}
    ])

    const statsMap = new Map(
      orderStats.map((s: { _id: string; totalOrders: number; totalSpent: number }) => [s._id, s])
    )

    const result = customers.map(customer => ({
      ...customer,
      totalOrders: statsMap.get(customer.phone)?.totalOrders || 0,
      totalSpent: statsMap.get(customer.phone)?.totalSpent || 0,
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/customers/:id
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id).lean()
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    // Get full order history for this customer
    const orders = await Order.find({ phone: customer.phone }).sort({ createdAt: -1 }).lean()
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

    res.json({
      ...customer,
      totalOrders: orders.length,
      totalSpent,
      orders,           // full order history
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/customers/phone/:phone
// Useful for auto filling name when admin types phone in new order
export const getCustomerByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone }).lean()
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    // Sum up all pending dues for this customer
    const dueResult = await Order.aggregate([
      { $match: { phone: req.params.phone, dueAmount: { $gt: 0 } } },
      { $group: { _id: null, totalDue: { $sum: '$dueAmount' } } }
    ])
    const totalDue = dueResult[0]?.totalDue || 0

    res.json({ ...customer, totalDue })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/customers
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body



    // Check if phone already exists
    const existing = await Customer.findOne({ phone })
    if (existing) {
      res.status(400).json({ message: 'Customer with this phone already exists' })
      return
    }

    const customer = await Customer.create({ name, phone })
    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/customers/:id
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true }
    )

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }

    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/customers/:id
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' })
      return
    }
    res.json({ message: 'Customer deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}


// from- t0 date

