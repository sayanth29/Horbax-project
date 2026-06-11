import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

import authRoutes       from './routes/auth.routes.js'
import orderRoutes      from './routes/order.routes.js'
import customerRoutes   from './routes/customer.routes.js'
import settingsRoutes   from './routes/settings.routes.js'
import expenseRoutes    from './routes/expense.routes.js'
import collectionRoutes from './routes/collection.routes.js'

dotenv.config()

const app: Application = express()

// Connect to MongoDB
connectDB()

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/collection', collectionRoutes)

app.get('/', (req, res) => {
  res.json({ message: '🧺 LaundryPro API is running!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})