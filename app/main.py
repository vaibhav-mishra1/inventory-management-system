from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routers import category as category_router, item as item_router, inventory as inventory_router, auth as auth_router
from app.database.session import engine
from app.database.base import Base
from app.models import category, item, transaction, user

logger = logging.getLogger(__name__)

# Try to create tables, but don't fail if database is unavailable
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.warning(f"Could not create database tables on startup: {e}")
    logger.warning("Make sure PostgreSQL is running on localhost:5432")

app = FastAPI(title="Inventory Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(category_router.router)
app.include_router(item_router.router)
app.include_router(inventory_router.router)

@app.get("/")
def show():
    return {"message": "Welcome into Inventory Management System"}

