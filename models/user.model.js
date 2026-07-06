import mongoose, {Schema} from "mongoose";

const userSchema=new Schema({
    name:{
        type:String,
        unique:[true,"username already taken"],
        required:true
    },
    email:{
        type:String,
        unique:[true,"account already exist with this email"],
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

 const User=mongoose.model("User" ,userSchema)
 
 export default User