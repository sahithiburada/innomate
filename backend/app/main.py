from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.idea_routes import router as idea_router
from app.routes.market_routes import router as market_router
from app.routes.competitor_routes import router as competitor_router
from app.routes.swot_routes import router as swot_router
from app.routes.risk_routes import router as risk_router
from app.routes.budget_routes import router as budget_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.report_routes import router as report_router  

app = FastAPI(title="Innomate Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://innomate-git-sahithi-sahithi-buradas-projects.vercel.app",
        "https://innomate-six.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(idea_router)
app.include_router(market_router)
app.include_router(competitor_router)
app.include_router(swot_router)
app.include_router(risk_router)
app.include_router(budget_router)
app.include_router(recommendation_router)
app.include_router(report_router)

@app.get("/")
def health_check():
    return {"status": "Backend running"}
