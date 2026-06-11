import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import authRoutes       from '../src/routes/auth.routes.js'
import orderRoutes      from '../src/routes/order.routes.js'
import customerRoutes   from '../src/routes/customer.routes.js'
import settingsRoutes   from '../src/routes/settings.routes.js'
import expenseRoutes    from '../src/routes/expense.routes.js'
import collectionRoutes from '../src/routes/collection.routes.js'

dotenv.config()

const app: Application = express()

// ─── MongoDB connection cache for serverless ───────────────────────────────
// On Vercel, each function invocation may reuse a warm container.
// We cache the connection to avoid opening a new one every request.
let isConnected = false
const connectDB = async () => {
  if (isConnected) return
  try {
    await mongoose.connect(process.env.MONGO_URI as string)
    isConnected = true
    console.log('✅ MongoDB Connected (serverless)')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    throw err
  }
}

// ─── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json())

// ─── Ensure DB is connected before each request ───────────────────────────
app.use(async (_req, _res, next) => {
  await connectDB()
  next()
})

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/customers',  customerRoutes)
app.use('/api/settings',   settingsRoutes)
app.use('/api/expenses',   expenseRoutes)
app.use('/api/collection', collectionRoutes)

app.get('/', (_req, res) => {
  res.json({ message: '🧺 Horbax API is running!' })
})

export default app
