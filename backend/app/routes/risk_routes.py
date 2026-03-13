from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.routes.idea_routes import verify_token
from app.services.risk_service import generate_risk_analysis

router = APIRouter(prefix="/api/risk", tags=["Risk"])


@router.post("/{idea_id}")
async def run_risk_analysis(
    idea_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    user_id = payload["sub"]

    return await generate_risk_analysis(db, idea_id, user_id)