import os
import asyncio

from strands import Agent
from strands.models.litellm import LiteLLMModel
from dotenv import load_dotenv

from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import (
    get_customer,
    create_customer,
    check_technician_availability,
    get_technician_details,
    book_appointment,
    assign_technician,
    send_customer_message,
)

load_dotenv()


def _build_agent() -> Agent:
    """
    Construct a fresh Strands Agent backed by Groq via LiteLLM.
    """

    model = LiteLLMModel(
        client_args={
            "api_key": os.getenv("GROQ_API_KEY"),
        },
        model_id=os.getenv(
            "GROQ_MODEL_ID",
            "groq/qwen/qwen3.8-27b"
        ),
        params={
            "max_tokens": 2048,
            "temperature": 0.3,
        },
    )

    agent = Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            get_customer,
            create_customer,
            check_technician_availability,
            get_technician_details,
            book_appointment,
            assign_technician,
            send_customer_message,
        ],
    )

    print("Loaded Strands tools:", agent.tool_names)

    return agent


async def run_agent(message: str) -> str:
    """
    Send a message to the Strands Agent and return the text response.
    """

    agent = _build_agent()

    result = await asyncio.to_thread(agent, message)

    return str(result)