from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import MetaData
from app.core.config import settings


engine = create_async_engine(
    settings.SUPABASE_DATABASE_URL,
    echo=False,
    poolclass=NullPool   # ⭐ disable SQLAlchemy pooling
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