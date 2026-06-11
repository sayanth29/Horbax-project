import  express from "express";

import { getSettings,
         addWashType,
         deleteWashType,
         updateWashType,
         addClothType,
         deleteClothType,
         updateClothType
 } from "../controllers/setting.controller.js";
 import { protect } from "../middleware/auth.middleware.js";

 const router = express.Router();

 router.get('/',protect,getSettings);

 //wash types routes

 router.post('/wash',protect,addWashType);
 router.patch('/wash/:index',protect,updateWashType);
 router.delete('/wash/:index',protect,deleteWashType);

 //cloth type routes
 router.post('/cloth',protect,addClothType);
 router.post('/cloth/:index',protect,updateClothType)
 router.delete('/cloth/:index',protect,deleteClothType);
 

 export default router;