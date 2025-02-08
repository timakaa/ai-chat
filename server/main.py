from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import json
from db.database import db
from db.repositories.conversation import ConversationRepository
from db.repositories.message import MessageRepository

app = FastAPI()

conversation_repo = ConversationRepository(db.Session)
message_repo = MessageRepository(db.Session)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Conversation-Id"],
)

client = httpx.AsyncClient(timeout=httpx.Timeout(60.0))

OLLAMA_API_URL = "http://localhost:11434/api/generate"


class ChatRequest(BaseModel):
    prompt: str
    conversation_id: Optional[int] = None
    messages: Optional[List[dict]] = None


async def generate_stream(prompt: str, messages: List[dict]):
    try:
        # Format conversation history into a single context string
        conversation_history = ""
        # Skip the last message as it's the current prompt
        for msg in messages[:-1]:
            role_prefix = "User: " if msg["role"] == "user" else "Assistant: "
            conversation_history += f"{role_prefix}{msg['content']}\n"

        # Add current prompt to the context
        full_prompt = f"{conversation_history}User: {prompt}\nAssistant:"

        print(f"Full prompt with context:\n{full_prompt}")  # Debug log

        # Create HTTP client for Ollama API
        data = {"model": "deepseek-r1:7b", "prompt": full_prompt, "stream": True}

        # Send request to Ollama
        async with client.stream("POST", OLLAMA_API_URL, json=data) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        json_response = json.loads(line)
                        # Yield only the response text
                        if "response" in json_response:
                            yield json_response["response"]
                    except json.JSONDecodeError:
                        continue
    except httpx.ReadTimeout:
        yield f"data: {json.dumps({'error': 'Timeout error occurred'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"Received conversation_id: {request.conversation_id}")  # Debug log

    # Create new conversation if none exists
    conversation_id = request.conversation_id
    if conversation_id is None:
        conversation_id = conversation_repo.create_conversation(request.prompt[:20])

    message_repo.add_message(conversation_id, "user", request.prompt)

    # Get conversation history
    messages = conversation_repo.get_conversation(conversation_id)

    async def generate_and_store():
        full_response = ""
        async for chunk in generate_stream(request.prompt, messages):
            full_response += chunk
            yield f"data: {json.dumps({'text': chunk, 'conversation_id': conversation_id})}\n\n"

        message_repo.add_message(conversation_id, "assistant", full_response)

    return StreamingResponse(
        generate_and_store(),
        media_type="text/event-stream",
        headers={
            "X-Conversation-Id": str(conversation_id),
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int):
    conversation_repo.delete_conversation(conversation_id)
    return {"message": "Conversation deleted"}


@app.get("/conversations")
async def get_conversations():
    return conversation_repo.get_conversations()


class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"


@app.post("/conversations")
async def create_conversation(request: CreateConversationRequest):
    conversation_id = conversation_repo.create_conversation(request.title[:20])
    return JSONResponse(content={"id": conversation_id})


@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: int):
    return conversation_repo.get_conversation(conversation_id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
