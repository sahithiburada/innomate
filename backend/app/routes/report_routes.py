"""
app/routes/report_routes.py

POST /api/report/generate/{idea_id}   → generate (cached)
POST /api/report/regenerate/{idea_id} → force-fresh regeneration
"""

from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.routes.idea_routes import verify_token
from app.services.report_service import generate_report, regenerate_report

router = APIRouter(prefix="/api/report", tags=["Report"])


@router.post("/generate/{idea_id}")
async def create_report(
    idea_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token   = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    result = await generate_report(db, idea_id, user_id)

    if result["status"] == "error":
        print(f"[report_route] Error for idea {idea_id}: {result['message']}")
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.post("/regenerate/{idea_id}")
async def force_regenerate_report(
    idea_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token   = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload["sub"]

    result = await regenerate_report(db, idea_id, user_id)

    if result["status"] == "error":
        print(f"[report_route] Regen error for idea {idea_id}: {result['message']}")
        raise HTTPException(status_code=400, detail=result["message"])

    return result