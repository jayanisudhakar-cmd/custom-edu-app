# custom-edu-app/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class LessonRequest(BaseModel):
    topic: str
    focus: str
    contentLanguage: str
    speed: str
    depth: str

class ChatRequest(BaseModel):
    message: str
    chatLanguage: str

@app.post("/generate-lesson")
def generate_lesson(req: LessonRequest):
    prompt = f"Teach {req.topic}, focusing specifically on {req.focus}. Content delivery language: {req.contentLanguage}. Teaching speed/style: {req.speed}. Depth/Complexity: {req.depth}."
    return {"lesson": model.generate_content(prompt).text}

@app.post("/chat")
def chat_bot(req: ChatRequest):
    prompt = f"Respond to this message: '{req.message}'. You must respond entirely in the following language: {req.chatLanguage}."
    return {"response": model.generate_content(prompt).text}