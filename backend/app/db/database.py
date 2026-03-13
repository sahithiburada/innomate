from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData
from app.core.config import settings


engine = create_async_engine(
    settings.SUPABASE_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,   # checks connection before using
    pool_recycle=1800     # recycle connection every 30 minutes
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

metadata = MetaData()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session