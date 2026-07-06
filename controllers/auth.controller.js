import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blacklist.model.js";
export const registerUserController=async(req,res)=>{
 const {name,email,password}=req.body

 if(!name || !email || !password){
    return res.status(400).json({
        message:"All fields are required"
    })
 }

 const existingUser=await User.findOne({
    $or:[{name},{email}]
 })
 if(existingUser){
    return status(400).json({
        message:"Account already exists with this email or user name"
    })
 }

 const hash= await bcrypt.hash(password,10)

  const newUser=await User.create({
    name,
    email,
    password:hash
 })

 const token = jwt.sign({
    id:newUser._id,
    name:newUser.name
 },process.env.JWT_SECRET,{expiresIn:"1d"})

 res.cookie("token", token, {
  httpOnly: true,
  secure: true,     
  sameSite: "none", 
});

 res.status(201).json({
    message:"user registered succesfully ",
    user:{
        id:newUser._id,
        name:newUser.name,
        email:newUser.email
    }
 })
}

 export const loginUserController=async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"user not found"
        })
    }

    const isPasswordValid=await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message:"invalid email or password"
        })
    }

     const token = jwt.sign({
    id:user._id,
    name:user.name
 },process.env.JWT_SECRET,{expiresIn:"1d"})

res.cookie("token", token, {
  httpOnly: true,
  secure: true,      // MUST be true in production
  sameSite: "none",  // MUST be "none" for cross-site
});

 res.status(200).json({
    message:"user logged in  succesfully ",
    user:{
        id:user._id,
        name:user.name,
        email:user.email
    }
 })
} 

export const logoutUserController=async(req,res)=>{
    const token=req.cookies.token

    if(token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token")

    res.status(200).json({
        message:"user logged out successfully "
    })
}

export const getMeController=async(req,res)=>{
 const user = await User.findById(req.user.id);
    res.status(200).json({
        messager:"user details fetched successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })
}
