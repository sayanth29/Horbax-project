import { Request, Response } from 'express'
import Order from '../models/Order.js'
import Customer from '../models/customer.js'



// GET /api/orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// GET /api/orders/pending
export const getPendingOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ status: { $in: ['pending', 'ready'] } }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// POST /api/orders
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      phone,
      items,
      total,
      deliveryDate,
      deliveryType,
      deliveryAddress,
      deliveryCharge,
      notes,
    } = req.body

    // Input validation
    if (!customerName || !phone) {
      res.status(400).json({ message: 'Customer name and phone are required' })
      return
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'At least one item is required' })
      return
    }
    if (!total || total <= 0) {
      res.status(400).json({ message: 'Total must be greater than 0' })
      return
    }

    // Auto create customer if not exists
    const existingCustomer = await Customer.findOne({ phone })
    if (!existingCustomer) {
      await Customer.create({ name: customerName, phone })
    }

    const order = await Order.create({
      customerName,
      phone,
      items,
      total,
      deliveryDate,
      deliveryType:    deliveryType    || 'takeaway',
      deliveryAddress: deliveryAddress || '',
      deliveryCharge:  deliveryCharge  || 0,
      notes,
      status :'pending',
      paymentMethod:'cash_pending' // by defult
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// PATCH /api/orders/:id
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      'customerName', 'phone', 'items', 'total',
      'paymentMethod', 'upiAmount', 'cashAmount',
      'status', 'deliveryDate', 'deliveryType',
      'deliveryAddress', 'deliveryCharge', 'notes'
    ] as const

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    // If marking as completed, record the time
    if (updates.status === 'completed') {
      updates.completedAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )

    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// DELETE /api/orders/:id
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }
    res.json({ message: 'Order deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}



// PATCH /api/orders/:id/collect
// Called when customer comes to pick up
export const collectOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentMethod, total, upiAmount, cashAmount } = req.body

    // Validate paymentMethod
    const validMethods = ['cash_paid', 'upi', 'upi_cash']
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      res.status(400).json({ message: 'Invalid payment method' })
      return
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        paymentMethod,
        total,
        upiAmount:   upiAmount   || 0,
        cashAmount:  cashAmount  || 0,
        completedAt: new Date(),
      },
      { new: true }
    )

    if (!order) {
      res.status(404).json({ message: 'Order not found' })
      return
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}


//path //api/orders/:id/ready
//called when cloths are washed and ready for pickup


export const markAsReady = async (req:Request,res:Response): Promise<void> =>{
  try{
   const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'ready' },
      { new: true }
    )

    if(!order){
      res.status(404).json({message: 'Order not found'})
      return
    }
    res.json(order)
  }
  catch(error){
    res.status(500).json({message: 'server error'})
  }
}