import { wrapper } from '../utils/wrapper.js'
import { Client } from '../models/client-model.js'
import jwt from 'jsonwebtoken'

export const verifyJWTClient = wrapper(async(req, res , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Autorization")?.replace("Bearer ","")   
        console.log(token)
    
        if(!token){
    
            return res.status(401).json({
                status : 401 ,
                message :"unauthorized access"
            })
        }
    
   

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

       
    
        const verifiedClient = await Client.findById(decodedToken?._id).select("_id")
    
        if(!verifiedClient){
            return res.status(401).json({
                status : 401 ,
                message :"Invalid access token"
            })
        }

      
        req.verifiedClientId = verifiedClient

      
        next()

    } catch (error) {
        return res.status(401).json({
                status : 401 ,
                message : error?.message || "invalid Access Token"
            })
       
    }



}) 