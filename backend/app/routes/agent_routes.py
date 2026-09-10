from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from app.agent.agent import run_agent

router = APIRouter(prefix="/api/agent", tags=["agent"])


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be empty")
        return v.strip()


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the DukaanFlow AI agent and get a response.

    The agent has access to business tools (e.g. get_customer) and will call them
    automatically when the user's intent requires it.
    """
    try:
        agent_response = await run_agent(request.message)
        return ChatResponse(response=agent_response)
    except Exception as exc:
        # Surface agent-level errors as 502 so clients know it's a downstream failure
        raise HTTPException(status_code=502, detail=f"Agent error: {str(exc)}")
