from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import category as category_router, item as item_router, inventory as inventory_router, auth as auth_router
from app.database.session import engine
from app.database.base import Base
from app.models import category, item, transaction, user


Base.metadata.create_all(bind=engine)

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

