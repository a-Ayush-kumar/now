import os, requests
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("GEMINI_API_KEY")
res = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={key}").json()
print([m["name"] for m in res.get("models", []) if "embedContent" in m.get("supportedGenerationMethods", [])])