import express, { Router }  from "express";
import { getAllOrders,
         getPendingOrders,
         getOrderById,
         createOrder,
         updateOrder,
         deleteOrder,
         collectOrder,
         markAsReady
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

//all routes protected

router.get('/',protect, getAllOrders);       // ✅ was '/getALL'
router.get('/pending',protect, getPendingOrders);   // ✅ was '/pendig' (typo)
router.get('/:id',protect, getOrderById);       // ✅ was '/ordersID' (missing :id)
router.post('/',protect, createOrder);        // ✅ was '/creating'
router.patch('/:id',protect, updateOrder);        // ✅ was PUT '/upate' (typo + missing :id)
router.delete('/:id',protect, deleteOrder);        // ✅ was '/delet' (typo + missing :id)
router.patch('/:id/ready',protect,markAsReady)    // make to status is ready
router.patch('/:id/collect',protect, collectOrder);    // ✅ was '/collection' (missing :id)

 export default router;

