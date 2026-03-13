from pydantic import BaseModel


class IdeaRequest(BaseModel):
    idea: str