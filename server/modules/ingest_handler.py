from db.vector_store import get_vectorstore
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def ingest_transcript(transcript: str, video_url: str):
    if not transcript or len(transcript.strip()) < 10:
        raise ValueError("Transcript is empty or too short")

    vectorstore = get_vectorstore()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    docs = splitter.split_documents([
        Document(
            page_content=transcript,
            metadata={
                "video_url": video_url
            }
        )
    ])

    vectorstore.add_documents(docs)
    return True