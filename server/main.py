from urllib import request

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Union

from services.transcript import generate_transcript
from modules.load_vectorstore import load_vectorstore
from logger import logger
from modules.llm import get_qa_chain
from modules.query_handler import ask_question as query_chain
from db.vector_store import get_vectorstore

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional

app = FastAPI(title="noW", description="One point solution for analyzing your short video.", version="1.0.0")

# middleware to catch unhandled exceptions and return a JSON response
# addition of CORS middleware to allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
@app.middleware("http")
async def catch_exception_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.exception("UNHANDLED EXCEPTION")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(exc)}
        )
        
# logger setup
# logger.info("Starting noW server...")


# models for request bodies - can be created into separate file if needed
class TranscriptRequest(BaseModel):
    video_url: Optional[str] = None
    url: Optional[str] = None

    @model_validator(mode="after")
    def verify_and_sync_urls(self):
        # If 'url' was provided instead of 'video_url', sync them up
        if self.url and not self.video_url:
            self.video_url = self.url
        if not self.video_url:
            raise ValueError("Field 'video_url' or 'url' is required")
        return self

# as the use of transcript generation is in backend only, we can keep it here for now, if we need to use it in frontend also then we can move it to separate file
class URLUploadRequest(BaseModel):
    urls: List[str]  # max 3 enforced below

class AskRequest(BaseModel):
    url: Union[str, List[str]]
    question: str

# to check the server is running fine or not
@app.get("/test")
async def test():
    return {"message": "noW server is running fine!"}

#  endpoint to generate transcript and vector store for a given video url - can be used in frontend if needed, for now we will use it in backend only, so keeping it here
# this is to see trancript.. 
@app.post("/transcript")
async def transcript(request: TranscriptRequest):
    try:
        logger.info(f"Generating transcript for: {request.video_url}")

        # Fixed: Changed from request.url to request.video_url to match model definitions
        transcript_text = generate_transcript(request.video_url)
        
        if not transcript_text or transcript_text.strip() == "":
            transcript_text = f"This video from source {request.video_url} contains no spoken audio text or dialogue track to analyze."
            
        vectorstore = get_vectorstore()
        vectorstore.add_texts(texts=[transcript_text], metadatas=[{"source": request.video_url}])
        
        logger.info("Transcript generated successfully")

        return {
            "success": True,
            "video_url": request.video_url,
            "transcript": transcript_text[:500]  # return only the first 500 characters for preview
        }

    except Exception as e:
        logger.exception("Transcript generation failed")

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )


@app.post("/upload-urls")
async def upload_urls(request: URLUploadRequest):
    try:
        if len(request.urls) > 3:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Maximum of 3 URLs allowed"
                }
            )

        logger.info(f"Uploading URLs: {request.urls}")
        all_transcripts = []
        # Process each URL and generate vector store
        for url in request.urls:
            transcript_text = generate_transcript(url)
            load_vectorstore(
                    transcript_text,
                metadata={"video_url": url}
            ) 
            all_transcripts.append(transcript_text)

        logger.info("URLs uploaded successfully")

        return {
            "success": True,
            "urls": request.urls,
            "transcripts": all_transcripts
        }
    except Exception as e:
        logger.exception("URL upload failed")

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )

# retrieval endpoint to ask question and get answer based on the uploaded video transcripts, can be used in frontend to get answers for user questions
@app.post("/ask")
async def ask(request: AskRequest):
    try:
        logger.info(f"Received question: {request.question}")
        
        # Convert single string URL input to a list automatically for consistency
        urls = [request.url] if isinstance(request.url, str) else request.url
        
        if len(urls) > 3:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Maximum of 3 URLs allowed per query."}
            )
            
        logger.info(f"Filtering context across URLs: {urls}")
        
        # Pass the specific URL list down to your vector store retriever loader
        vectorstore = get_vectorstore()
        
        # Create a metadata filter dict for Chroma DB
        # If 1 URL: {"source": "url1"}
        # If multiple: {"$or": [{"source": "url1"}, {"source": "url2"}]}
        if len(urls) == 1:
            search_filter = {"source": urls[0]}
        else:
            search_filter = {"$or": [{"source": u} for u in urls]}
            
        # Build the chain with the specific metadata filter applied
        qa_chain = get_qa_chain(vectorstore, search_filter=search_filter)
        
        answer = qa_chain.invoke(request.question)
        
        return {
            "success": True,
            "answer": answer
        }
    except Exception as exc:
        logger.exception("Question answering failed")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(exc)}
        )