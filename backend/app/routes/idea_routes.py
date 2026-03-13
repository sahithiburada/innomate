from fastapi import APIRouter, Depends, Request, HTTPException
from app.models.idea_models import IdeaRequest
from app.db.database import get_db
from app.services.idea_service import create_or_regenerate_idea, lock_idea
from jose import jwt
from sqlalchemy import text
import requests
import os
import json

router = APIRouter(prefix="/api/idea", tags=["Idea"])

SUPABASE_URL = os.getenv("SUPABASE_URL")

# 🔐 Function to verify Supabase JWT
def verify_token(token: str):
    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    jwks = requests.get(jwks_url).json()

    header = jwt.get_unverified_header(token)
    kid = header["kid"]

    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)

    if not key:
        raise HTTPException(status_code=401, detail="Invalid token")

    payload = jwt.decode(
        token,
        key,
        algorithms=["ES256"],
        audience="authenticated"
    )

    return payload


@router.post("/analyze")
async def analyze(request: Request, body: IdeaRequest, db=Depends(get_db)):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    return await create_or_regenerate_idea(
        db=db,
        idea_id=None,
        startup_idea=body.idea,
        user_id=user_id
    )


@router.post("/regenerate/{idea_id}")
async def regenerate(
    idea_id: str,
    request: Request,
    body: IdeaRequest,
    db=Depends(get_db)
):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    return await create_or_regenerate_idea(
        db=db,
        idea_id=idea_id,
        startup_idea=body.idea,
        user_id=user_id
    )


@router.post("/lock/{idea_id}")
async def lock(
    idea_id: str,
    body: dict,
    request: Request,
    db=Depends(get_db)
):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    verify_token(token)

    version_number = body.get("version_number")

    if not version_number:
        raise HTTPException(
            status_code=400,
            detail="version_number is required"
        )

    return await lock_idea(db, idea_id, version_number)

@router.get("/my-ideas")
async def get_user_ideas(request: Request, db=Depends(get_db)):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    query = text("""
        SELECT id, title, created_at
        FROM ideas
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    """)

    result = await db.execute(query, {"user_id": user_id})
    rows = result.fetchall()

    ideas = [
        {
            "id": row[0],
            "title": row[1],
            "created_at": row[2].isoformat()
        }
        for row in rows
    ]

    return {"ideas": ideas}

@router.get("/{idea_id}")
async def get_single_idea(
    idea_id: str,
    request: Request,
    db=Depends(get_db)
):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    print("Requested idea:", idea_id)
    print("JWT user:", user_id)

    query = text("""
        SELECT id, analysis_data
        FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    result = await db.execute(query, {
        "id": idea_id,
        "user_id": user_id
    })

    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Idea not found")

    analysis_data = row[1]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    return {
        "idea_id": row[0],
        "analysis_data": analysis_data
    }

@router.delete("/{idea_id}")
async def delete_idea(
    idea_id: str,
    request: Request,
    db=Depends(get_db)
):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    query = text("""
        DELETE FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    await db.execute(query, {
        "id": idea_id,
        "user_id": user_id
    })

    await db.commit()

    return {"status": "deleted"}