from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
import httpx
import json

app = FastAPI()

OLLAMA_API_URL = "http://localhost:11434/api/generate"


async def generate_stream(prompt: str):
    # Create HTTP client for Ollama API
    async with httpx.AsyncClient() as client:
        # Prepare request data
        data = {"model": "deepseek", "prompt": prompt, "stream": True}

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


@app.post("/chat")
async def chat(request: dict):
    prompt = request.get("prompt", "")
    return StreamingResponse(generate_stream(prompt), media_type="text/event-stream")
