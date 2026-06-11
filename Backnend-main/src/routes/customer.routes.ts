import express from 'express'
import {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/',               protect, getAllCustomers)
router.get('/phone/:phone',   protect, getCustomerByPhone)  // 👈 before /:id
router.get('/:id',            protect, getCustomerById)
router.post('/',              protect, createCustomer)
router.patch('/:id',          protect, updateCustomer)
router.delete('/:id',         protect, deleteCustomer)

export default router