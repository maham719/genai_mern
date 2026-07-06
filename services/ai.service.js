import { GoogleGenAI} from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from 'puppeteer';
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});


const geminiSchema = {
  type: "OBJECT",
  properties: {
    jobtitle:{type:"STRING"},
    matchScore: { type: "INTEGER" },
    technicalQuestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question:  { type: "STRING" },
          intention: { type: "STRING" },
          answer:    { type: "STRING" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question:  { type: "STRING" },
          intention: { type: "STRING" },
          answer:    { type: "STRING" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          skill:    { type: "STRING" },
          severity: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day:   { type: "NUMBER" },
          focus: { type: "STRING" },
          tasks: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGap",
    "preparationPlan",
  ],
};


// ✅ Extract only the inner schema — Gemini doesn't want $schema, definitions, etc.
function toGeminiSchema(zodSchema) {
  const full = zodToJsonSchema(zodSchema, { target: "jsonSchema7" });
  // Strip top-level metadata fields Gemini rejects
  const { $schema, definitions, $ref, ...clean } = full;
  return clean;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const prompt = `Act as an expert Technical Interviewer and Career Coach. 
Your task is to analyze the provided Resume and Job Description (JD) to generate a structured Interview Preparation Report.

### INPUT DATA:
- Resume: ${resume}
- Self Description: ${selfDescription}
- Job Description: ${jobDescription}

### GOAL:
Based on the candidate's background and the JD requirements, generate a JSON object that matches the schema exactly.
1. Identify the 'matchScore' as a whole integer between 0 and 100 (e.g. 70, not 0.7)
2. Generate 'technicalQuestions' and 'behavioralQuestions' tailored to this specific candidate's gaps and strengths.
3. Identify 'skillGap' (e.g., if the JD asks for .NET but they only know Node.js).
4. Create a 7-day 'preparationPlan' to help this candidate bridge those gaps.

### OUTPUT INSTRUCTIONS:
-genrate a jobtitle (should be extracted from the jobDescription provided)
- Generate ONLY valid JSON.
- DO NOT use keys like 'candidate_details' or 'job_role'.
- USE ONLY these top-level keys:"jobtitle", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGap", "preparationPlan" .
- Ensure 'severity' is strictly one of: "low", "medium", or "high".
- No conversational text before or after the JSON.
IMPORTANT:

Each technicalQuestions  item MUST be:

{
  "question": string,
  "intention": string,
  "answer": string
}

Each behavioralQuestions item MUST be:

{
  "question": string,
  "intention": string,
  "answer": string
}

Each skillGap item MUST be:

{
  "skill": string,
  "severity": "low" | "medium" | "high"
}

Each preparationPlan  item MUST be:

{
  "day": number,
  "focus": string,
  "tasks": string[]
}

Do NOT use keys such as:
expectedAnswer
topic
topics
description
activities
resources
title
skillGaps

Use ONLY the fields specified above.

`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",          // ✅ Fixed model name
    contents: prompt,
   config: {                  // ✅ Fixed key name
      responseMimeType: "application/json",
      responseSchema:geminiSchema,  // ✅ Clean schema
      temperature: 0.0,
    },
  });
let text = response.text;

// remove ```json and ```


const parsed = JSON.parse(text);
  console.log("RAW RESPONSE:", parsed);
 return parsed
}

const generatePDFfromHTML=async(htmlcontent)=>{
const browser=await puppeteer.launch()
const page = await browser.newPage();
console.log(htmlcontent)
await page.setContent(htmlcontent, {
 waitUntil: ["load", "domcontentloaded", "networkidle0"]
});
await page.evaluate(() => document.fonts?.ready)
const pdfBuffer=await page.pdf({
  format: "A4",
  printBackground: true,
  margin: {
    top: "20px",
    right: "20px",
    bottom: "20px",
    left: "20px",
  },
});

await browser.close();

return pdfBuffer
}

const generateResumePdf=async({resume,jobDescription,selfDescription})=>{
 
 const resumePdfSchema = {
  type: "OBJECT",
  properties: {
    title: {
      type: "STRING"
    },
    html: {
      type: "STRING"
    }
  },
  required: ["title", "html"]
};

  const prompt =`Act as a senior resume writer and ATS optimization expert.

INPUT DATA

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

TASK
Create a professional ATS-optimized resume tailored specifically to the provided Job Description.

REQUIREMENTS

1. Extract all relevant information from the candidate's resume.
use names for social links (gmail,linkedin,github etc)
if using lists keep list style none 
2. Use the self-description to enhance the Professional Summary section.
3. Prioritize skills, experiences, projects, and achievements that are most relevant to the Job Description.
4. Rewrite existing content professionally while preserving factual accuracy.
5. Do NOT invent or fabricate:

   * Work experience
   * Education
   * Skills
   * Certifications
   * Projects
   * Achievements
   * Contact information
6. Quantify accomplishments only when numerical information already exists in the provided data.
7. Optimize wording for Applicant Tracking Systems (ATS) using relevant keywords from the Job Description.
8. Generate a complete HTML document beginning with:

<!DOCTYPE html>

<html>
<head>
...
</head>
<body>
...
</body>
</html>

9. Include all CSS inside a single <style> tag in the <head>.
10. Design the resume to render cleanly as a PDF using Puppeteer.
11. Use a professional, modern, ATS-friendly layout.
12. Ensure the resume is printable on A4 pages.
13. Use semantic HTML elements where appropriate.
14. Do not include JavaScript.
15. Do not include external fonts, images, stylesheets, or CDN resources.
16. If a section has no data available, omit that section entirely.
17. Never output explanations, comments, markdown, or code fences.
18:resume should be white no gray area at the bottom
REQUIRED SECTIONS

* Header

  * Full Name
  * Email
  * Phone
  * LinkedIn
  * Location

* Professional Summary

* Skills

* Experience

* Education

OPTIONAL SECTIONS (only if data exists)

* Projects
* Certifications
* Achievements

OUTPUT FORMAT

Return a JSON object matching the schema exactly.

{
"html": "complete HTML document as a string"
}
LAYOUT CONTRACT (CRITICAL)

- The HTML MUST be optimized for A4 PDF rendering.
- The page must have:
  - margin: 0
  - a centered container with fixed width (e.g. 800px)
  - no background color on body (or body must be white)
- Avoid any layout that relies on viewport height (100vh, min-height: 100vh)
- Avoid large bottom empty space in containers
- Ensure sections flow naturally with no forced spacing

CRITICAL HTML RULES:
- Never output empty div/section/ul elements
- If a section has no items, DO NOT include its container or heading
- Do not add placeholder spacing elements
Return ONLY the JSON object.



  `

  const response=await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",          
    contents: prompt,
   config: {                  
      responseMimeType: "application/json",
      responseSchema:resumePdfSchema,  
      temperature: 0.0,
   }
  })
   console.log(JSON.parse(response.text))
  const jsonContent= JSON.parse(response.text)

  const pdfBuffer=await generatePDFfromHTML(jsonContent.html)

  return pdfBuffer
}

export { generateInterviewReport, generateResumePdf}