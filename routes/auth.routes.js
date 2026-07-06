import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import authUser from "../middlewares/auth.middleware.js";

const authRouter=Router()

authRouter.post("/register", authController.registerUserController)
authRouter.post("/login", authController.loginUserController)
authRouter.get("/logout", authController.logoutUserController)
authRouter.get("/get-me",authUser,authController.getMeController)

export default authRouter