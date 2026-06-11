import { NextFunction, Request,Response } from "express";
import jwt  from "jsonwebtoken";
import { JwtPayload } from "../types/type.js";


declare global {
    namespace Express {
        interface Request{
            admin?:JwtPayload
        }
    }
}

export const protect = (req : Request,res:Response,next:NextFunction):void =>{
    try {
        // check token exists in header
        const authHeader = req.headers.authorization
          
        if(!authHeader || ! authHeader.startsWith('Bearer')){
            res.status(401).json({message :'not authorized ,no token'})
            return
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(
            token,process.env.JWT_SECRET as string
        ) as JwtPayload

        req.admin = decoded;
        next()
    }
    catch(error){
        res.status(401).json({message:'Invalid token or expired'})


    }
}


