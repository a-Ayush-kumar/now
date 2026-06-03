import os
import hashlib
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from db.vector_store import get_vectorstore

load_dotenv()

def load_vectorstore(transcript: str, metadata: dict = None):

    transcript = transcript.strip()
    transcript = " ".join(transcript.split())

    doc_id = hashlib.md5(transcript.encode()).hexdigest()

    metadata = metadata or {}

    documents = [
        Document(
            page_content=transcript,
            metadata={
                **metadata,
                "doc_id": doc_id
            }
        )
    ]

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    vectorstore = get_vectorstore()
    vectorstore.add_documents(chunks)

    # vectorstore.persist()

    return vectorstore