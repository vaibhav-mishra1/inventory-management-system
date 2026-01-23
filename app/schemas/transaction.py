from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional

class StockTransactionCreate(BaseModel):
    item_id: int
    quantity: int
    # transaction_type is set by the endpoint, not required in request
    transaction_type: Optional[Literal["IN", "OUT"]] = None

class StockInOutRequest(BaseModel):
    """Simplified schema for stock-in/out endpoints"""
    item_id: int
    quantity: int

class StockTransactionResponse(BaseModel):
    id: int
    item_id: int
    item_name: Optional[str] = None
    category_name: Optional[str] = None
    transaction_type: str
    quantity: int
    timestamp: datetime

    class Config:
        from_attributes = True
        