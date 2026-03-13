from groq import Groq
from app.core.config import settings

if not settings.GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY environment variable not set")

client = Groq(api_key=settings.GROQ_API_KEY)


def call_llm(
    prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 1200
):
    """
    Production-safe LLM wrapper.
    Supports optional temperature & max_tokens.
    Backward compatible with existing calls.
    """

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise startup analyst and professional strategist. "
                    "Return ONLY valid JSON. "
                    "Do not add explanations or markdown."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=temperature,
        max_tokens=max_tokens
    )

    return completion.choices[0].message.content.strip()