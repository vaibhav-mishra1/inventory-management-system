from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class StockTransactionCreate(BaseModel):
    item_id: int
    transaction_type: Literal["IN","OUT"]
    quantity: int

class StockTransactionResponse(BaseModel):
    id: int
    item_id: int
    transaction_type: str
    quantity: int
    timestamp: datetime

    class Config:
        from_attributes = True
        