import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blacklist.model.js"

const authUser=async(req,res,next)=>{
const token =req.cookies.token

if(!token){
    return res.status(401).json({message:"unauthorized request , not token provided"})
}
const isTokenBlacklisted=await tokenBlacklistModel.findOne({token})

if(isTokenBlacklisted){
    return res.status(401).json({
        message:"invalid token"
    })
}
try {
const decoded= jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded
    console.log(req.user)
    next()
} catch (error) {
    return res.status(401).json({message:"invalid token"})
}

}

export default authUser