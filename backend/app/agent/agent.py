import os
import asyncio
from strands import Agent
from strands.models import BedrockModel
from dotenv import load_dotenv
from app.agent.prompts import SYSTEM_PROMPT

load_dotenv()


def _build_agent() -> Agent:
    """
    Construct a fresh Strands Agent backed by Amazon Bedrock.

    A new instance is created per request — keeps state simple for now.
    Session/memory can be added in a later day without restructuring this.

    Credentials are loaded from the standard AWS credential chain:
      1. Environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
      2. ~/.aws/credentials file
      3. IAM instance role (if running on EC2/ECS)
    boto3/BedrockModel handles this automatically — nothing is hardcoded here.
    """
    model = BedrockModel(
        model_id=os.getenv("BEDROCK_MODEL_ID", "us.amazon.nova-pro-v1:0"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
    )

    # No tools registered yet — purely conversational for this step.
    # Tools (get_customer, etc.) will be added in the next step.
    return Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
    )


async def run_agent(message: str) -> str:
    """
    Send a message to the Strands Agent and return the text response.

    Strands' Agent.__call__ is synchronous. We run it in a thread pool via
    asyncio.to_thread so it doesn't block FastAPI's async event loop.

    Raises:
        Exception: Propagated to the route layer which converts it to an HTTP error.
    """
    agent = _build_agent()
    result = await asyncio.to_thread(agent, message)
    return str(result)
