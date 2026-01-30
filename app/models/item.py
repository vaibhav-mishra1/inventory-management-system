from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    stock = Column(Integer, default=0)
    price_per_unit = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    stock_transactions = relationship(
        "StockTransaction",
        back_populates="item",
        cascade="all, delete-orphan" 
    )

    category = relationship("Category", backref="items")