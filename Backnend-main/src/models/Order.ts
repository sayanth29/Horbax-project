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
  dueAmount:        number
  status:           'pending' | 'ready' | 'completed'
  deliveryType:     'takeaway' | 'home_delivery'
  deliveryAddress?: string
  deliveryCharge:   number
  deliveryDate?:    string
  orderTime?:       string
  notes?:           string
  completedAt?:     Date
  createdAt:        Date
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
    dueAmount:  { type: Number, default: 0 },
    status: {
      type:    String,
      enum:    ['pending', 'ready', 'completed', 'cancelled'],
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
    orderTime:    { type: String },
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

// ─── Indexes for fast queries ──────────────────────────────────────────────────
orderSchema.index({ status: 1, createdAt: -1 })   // pending/ready/completed + date sort
orderSchema.index({ status: 1, completedAt: -1 }) // collection queries (completed by date)
orderSchema.index({ phone: 1 })                    // customer lookup by phone
orderSchema.index({ createdAt: -1 })               // date-range queries (collection, dashboard)
orderSchema.index({ dueAmount: 1 })                // due/credit filter

const Order = mongoose.model<IOrder>('Order', orderSchema)

export default Order