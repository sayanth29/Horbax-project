import mongoose, { Document, Schema } from 'mongoose'

// Shape of one cloth item inside an order
export interface IClothItem {
  qty:   number
  cloth: string
  wash:  string
  price: number
}

// Full order shape
export interface IOrder extends Document {
  orderId:          string
  customerName:     string
  phone:            string
  items:            IClothItem[]
  total:            number
  paymentMethod:    'cash_pending' | 'cash_paid' | 'upi' | 'upi_cash'
  upiAmount:        number
  cashAmount:       number
  status:           'pending' | 'ready' | 'completed'
  deliveryType:     'takeaway' | 'home_delivery'   // 👈 add here
  deliveryAddress?: string                          // 👈 add here
  deliveryCharge:   number                          // 👈 add here
  deliveryDate?:    string
  notes?:           string
  completedAt?:     Date
}

// Sub-schema for cloth items
const clothItemSchema = new Schema<IClothItem>({
  qty:   { type: Number, required: true, min: 1 },
  cloth: { type: String, required: true },
  wash:  { type: String, required: true },
  price: { type: Number, default: 0 },
})

// Main order schema
const orderSchema = new Schema<IOrder>(
  {
    orderId:      { type: String, unique: true },
    customerName: { type: String, required: true, trim: true },
    phone:        { type: String, required: true },
    items:        [clothItemSchema],
    total:        { type: Number, required: true, default: 0 },
    paymentMethod: {
      type:    String,
      enum:    ['cash_pending', 'cash_paid', 'upi', 'upi_cash'],
      default: 'cash_pending',
    },
    upiAmount:  { type: Number, default: 0 },
    cashAmount: { type: Number, default: 0 },
    status: {
      type:    String,
      enum:    ['pending', 'ready', 'completed'],
      default: 'pending',
    },
    deliveryType: {                                  // 👈 add here inside schema
      type:    String,
      enum:    ['takeaway', 'home_delivery'],
      default: 'takeaway',
    },
    deliveryAddress: { type: String },               // 👈 add here
    deliveryCharge:  { type: Number, default: 0 },   // 👈 add here
    deliveryDate: { type: String },
    notes:        { type: String },
    completedAt:  { type: Date },
  },
  { timestamps: true }  // ✅ this is the second argument to Schema()
)

// Auto generate orderId like LP0001 before saving
orderSchema.pre('save', async function () {
  if (this.orderId) return
  const lastOrder = await mongoose.model('Order')
    .findOne({}, { orderId: 1 })
    .sort({ _id: -1 })
  let nextNum = 1
  if (lastOrder?.orderId) {
    const parsed = parseInt(lastOrder.orderId.replace('LP', ''), 10)
    if (!isNaN(parsed)) nextNum = parsed + 1
  }
  this.orderId = 'LP' + String(nextNum).padStart(4, '0')
})

const Order = mongoose.model<IOrder>('Order', orderSchema)

export default Order