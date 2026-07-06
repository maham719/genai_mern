import express from "express"
import "dotenv/config"
import connectToDB from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import interviewRouter from "./routes/interview.routes.js"

connectToDB()
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(cors({
   origin: [
      "http://localhost:5173",
      "https://genai-mern-frontend.vercel.app",
    ],
    credentials:true
}))
app.use("/api/auth",authRouter)
app.use("/api/interview" ,interviewRouter)
app.listen(3005,()=>{
    console.log("server is listening on port 3005")
})
