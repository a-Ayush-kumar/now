import os
import requests
from dotenv import load_dotenv
from langchain_chroma import Chroma

load_dotenv()

class DirectGeminiEmbeddings:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Target the exact model shown in your live test output
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={self.api_key}"

    def _embed(self, text: str):
        payload = {
            "content": {"parts": [{"text": text}]}
        }
        response = requests.post(self.url, json=payload)
        if response.status_code != 200:
            raise Exception(f"Gemini API Error ({response.status_code}): {response.text}")
        return response.json()["embedding"]["values"]

    def embed_documents(self, texts):
        return [self._embed(text) for text in texts]

    def embed_query(self, text):
        return self._embed(text)

def get_vectorstore():
    embeddings = DirectGeminiEmbeddings()
    persist_directory = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
    return Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )