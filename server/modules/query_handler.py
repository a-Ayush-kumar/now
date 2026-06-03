from db.vector_store import get_vectorstore
from modules.llm import get_qa_chain


def ask_question(question: str):

    vectorstore = get_vectorstore()

    qa_chain = get_qa_chain(
        vectorstore
    )

    response = qa_chain.invoke(
        {
            "query": question
        }
    )

    return response["result"]