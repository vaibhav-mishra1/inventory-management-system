from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# base schema
class CategoryBase(BaseModel):
    name: str

# Request schema (Create)
class CategoryCreate(CategoryBase):
    pass

# Request schema (Update)
class CategoryUpdate(BaseModel):
    name: Optional[str] = None

# Response schema
class CategoryResponse(CategoryBase):
    id: int
    total_stock: int
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True