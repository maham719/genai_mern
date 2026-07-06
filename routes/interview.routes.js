import {Router} from "express";
import authUser from "../middlewares/auth.middleware.js";
import * as interviewController from "../controllers/interview.controller.js"
import upload from "../middlewares/file.middleware.js";

const interviewRouter=Router()

interviewRouter.post("/",authUser,upload.single("resume"),interviewController.generateInterviewReportController)
interviewRouter.get("/report/:interviewID",authUser,interviewController.getInterviewReportByIDController)

interviewRouter.get("/",authUser,interviewController.getAllInterviewReports)

interviewRouter.post("/resume/pdf/:interviewID",authUser,interviewController.generateResumePdfController)

export default interviewRouter