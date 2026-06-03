import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_qa_chain(vectorstore, search_filter=None):
    # Set a default retrieval chunk threshold (k=4) to manage your token window safely
    search_kwargs = {"k": 4}
    
    if search_filter:
        search_kwargs["filter"] = search_filter

    # Instantiate the generation model layer
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0.3
    )

    # Convert the raw database to a filtered vector retriever layer
    retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)

    prompt = ChatPromptTemplate.from_template("""
    You are an intelligent video assistant. Your task is to analyze the user's question about a video based on the available transcribed context, metadata, or URL clues provided.

    Context/Transcript Data:
    {context}

    Question:
    {input}

    Instructions:
    - If context data is available, summarize it concisely to answer the question directly.
    - If the context block is empty or missing, provide a helpful general response about what kind of information you are ready to process once the video finishes parsing, or use any contextual clues in the question/URL to make an educated guess.
    """)

    # Helper function to format retrieved documents into a single text block
    def format_docs(docs):
        if not docs:
            return "No context found for the requested URLs."
        return "\n\n".join(doc.page_content for doc in docs)

    # Modern LCEL Chain build (No fragile legacy imports needed)
    retrieval_chain = (
        {"context": retriever | format_docs, "input": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return retrieval_chain