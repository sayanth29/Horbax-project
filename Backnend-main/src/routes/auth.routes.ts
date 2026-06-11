import  express  from "express";
import { setupAdmin,loginAdmin,changePassword,changeUsername } from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/setup',setupAdmin);
router.post('/login',loginAdmin);
router.post('/change-password',protect,changePassword)
router.post('/change-username',protect,changeUsername)

export default router