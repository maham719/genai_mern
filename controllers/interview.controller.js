import extract from "pdf-extraction";
import {generateInterviewReport,generateResumePdf} from "../services/ai.service.js"
import interviewReportModel from "../models/interviewRport.model.js"

const generateInterviewReportController=async(req,res)=>{
   console.log(req.file);
    
    const resumeContent = await extract(req.file.buffer);
    
const {selfDescription,jobDescription}=req.body

const interviewReportByAi=await generateInterviewReport({resumeContent,selfDescription,jobDescription})

const interviewReport=await interviewReportModel.create({
    user:req.user.id,
    resume:resumeContent.text,
    jobDescription,
   selfDescription,
   ...interviewReportByAi
})

res.status(201).json({
    message:"interview report generated successfully",
    interviewReport
})
}

const getInterviewReportByIDController=async(req,res)=>{
  const {interviewID}=req.params

  const interviewReport=await interviewReportModel.findOne({_id:interviewID,user:req.user.id})
  if(!interviewReport){
    return res.status(400).json({message:"interview report not found"})
  }

  res.status(200).json({
    message:"interview report found successfully",
    interviewReport
  })
}

const getAllInterviewReports=async(req,res)=>{
     const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGap -preparationPlan")
      res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


const generateResumePdfController=async(req,res)=>{
  const {interviewID}=req.params
  const interviewReport=await interviewReportModel.findById(interviewID)

  if(!interviewReport){
    return res.status(400).json({
      message:"interview report not found"
    })
  }

  const {resume,selfDescription,jobDescription}=interviewReport

  const pdfBuffer=await generateResumePdf({resume,jobDescription,selfDescription})

  res.set({
  "Content-Type": "application/pdf",
  "Content-Disposition": "inline; filename=resume.pdf",
});

  res.send(pdfBuffer)
}



export {generateInterviewReportController,getInterviewReportByIDController,getAllInterviewReports,generateResumePdfController}