import mongoose from "mongoose";

export default async function connectToDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Db is connected")
    } catch (error) {
        console.log(error)
    }
}