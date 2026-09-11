import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database.mongodb import ping_db
from app.routes.agent_routes import router as agent_router
from app.routes.data_routes import router as data_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Verify critical connections on startup before accepting traffic."""
    if not ping_db():
        raise RuntimeError(
            "Cannot connect to MongoDB. Check MONGODB_URI and network access."
        )
    print("✅ MongoDB connection verified.")
    yield
    # Teardown (add cleanup here if needed in later days)


app = FastAPI(
    title="DukaanFlow API",
    description="AI operations backend for local appliance-repair businesses.",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow the React dev server (and any localhost port) to call this API.
# Tighten origins to specific domains before any production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(agent_router)
app.include_router(data_router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "DukaanFlow API"}
