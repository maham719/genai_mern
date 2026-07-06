import mongoose ,{Schema} from "mongoose"

const behavioralQuestionsSchema=new Schema({
      question:{
        type:String,
        required:[true,"technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"intention is required"]
    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{_id:false}
)

const technicalQuestionSchema=new Schema({
    question:{
        type:String,
        required:[true,"technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"intention is required"]
    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{_id:false})

const skillGapsSchema=new Schema({
    skill:{
        type:String,
        required:[true,"skill  is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"severity is required"]
    }
},{_id:false})

const preparationPlanSchema=new Schema({
    day:{
        type:Number,
        required:[true,"day is required"]
    },
    focus:{
        type:String,
        required:[true,"focus is required"]
    },
    tasks:[
        {
            type:String,
            required:[true,"task is required"]
        }
    ]
})

const interviewReportSchema=new Schema({
    jobDescription:{
        type:String,
        required:[true,"job description is required"]
    },
    resume:{
        type:String
    },
    selfDescription:{
        type:String
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    jobtitle:{type:String,required:true},
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionsSchema],
    skillGap:[skillGapsSchema],
    preparationPlan:[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})


const interviewReportModel=mongoose.model("interviewReport",interviewReportSchema)

export default interviewReportModel