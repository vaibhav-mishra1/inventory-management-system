from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    category_id: int
    price_per_unit: float

class ItemCreate(ItemBase):
    stock: int = 0

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price_per_unit: Optional[float] = None

class ItemResponse(ItemBase):
    id: int
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True