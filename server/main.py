from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Union, Optional
from services.transcript import generate_transcript
from logger import logger
from modules.llm import get_qa_chain
from db.vector_store import get_vectorstore
from db.mongo import get_cached_transcript, cache_video_transcript, save_chat_turn

app = FastAPI(title="noW", description="One point solution for analyzing your short video.", version="1.0.0")

# CORS Policy Config Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Global Exceptions Catch Middleware Layer
@app.middleware("http")
async def catch_exception_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.exception("UNHANDLED GLOBAL EXCEPTION DETECTED")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(exc)}
        )

# Structured Request Validation Schemas 
class ChatMessage(BaseModel):
    role: str  # "user" or "agent"
    text: str

class AskRequest(BaseModel):
    url: Union[str, List[str]]
    question: str
    session_id: Optional[str] = "default_session"  # ✅ Now optional with a fallback!
    history: List[ChatMessage] = []

@app.get("/test")
async def test():
    return {"message": "noW server is running fine!"}

# Combined Ingest-and-Query RAG Route
@app.post("/ask")
async def ask(request: AskRequest):
    try:
        logger.info(f"Received question: {request.question} for session: {request.session_id}")
        
        # Normalize input target reference to array
        urls = [request.url] if isinstance(request.url, str) else request.url
        
        if len(urls) > 3:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Maximum of 3 URLs allowed per query."}
            )
            
        vectorstore = get_vectorstore()

        # 1. Verification and Ingestion Block via Isolated DB Layers
        for video_url in urls:
            cached_transcript = await get_cached_transcript(video_url)
            
            if not cached_transcript:
                logger.info(f"Checking/Ingesting text context for fresh source: {video_url}")
                transcript_text = generate_transcript(video_url)
                
                if not transcript_text or transcript_text.strip() == "":
                    transcript_text = f"This video from source {video_url} contains no spoken audio text track to analyze."
            
                # Update both document cache and vector index
                await cache_video_transcript(video_url, transcript_text)
                vectorstore.add_texts(texts=[transcript_text], metadatas=[{"source": video_url}])
            else:
                logger.info(f"Hit MongoDB cache for {video_url}. Skipping processing loops.") 
        
        # 2. Build Structured Query Filters Across Vector Embeddings
        if len(urls) == 1:
            search_filter = {"source": urls[0]}
        else:
            search_filter = {"$or": [{"source": u} for u in urls]}
            
        logger.info(f"Filtering context query across database sources: {urls}")
        qa_chain = get_qa_chain(vectorstore, search_filter=search_filter)
        
        # 3. Format Dialogue Threads for Context-Aware Responses (Option 2 Memory)
        history_str = "\n".join([f"{msg.role.capitalize()}: {msg.text}" for msg in request.history])
        refined_query = f"Conversation History:\n{history_str}\n\nFollow-up Question: {request.question}"
        
        # Execute LLM Chain Inference Engine
        answer = qa_chain.invoke(refined_query)
        
        # 4. Stream transaction context out to MongoDB Session records
        await save_chat_turn(request.session_id, request.question, answer)
        
        return {
            "success": True,
            "answer": answer
        }
        
    except Exception as exc:
        logger.exception("On-demand RAG pipeline operation failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(exc)}
        )