from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import httpx
import os

security = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL not set in environment variables")

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        async with httpx.AsyncClient() as client:
            jwks_response = await client.get(JWKS_URL)
            jwks = jwks_response.json()

        payload = jwt.decode(
            token,
            jwks,
            algorithms=["ES256"],   # ECC P-256
            audience="authenticated"
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user_id

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")