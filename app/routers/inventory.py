from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import SessionLocal, get_db
from app.models.item import Item
from app.models.category import Category
from app.models.transaction import StockTransaction
from app.schemas.transaction import (
    StockTransactionCreate,
    StockTransactionResponse,
    StockInOutRequest
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

def update_category_totals(category_id: int, db: Session):
    totals = (
        db.query(
            func.sum(Item.stock).label("total_stock"),
            func.sum(Item.stock * Item.price_per_unit).label("total_amount")
        )
        .filter(Item.category_id == category_id)
        .first()
    )

    category = db.query(Category).filter(Category.id == category_id).first()
    category.total_stock = totals.total_stock or 0  # type: ignore
    category.total_amount = totals.total_amount or 0.0  # type: ignore

    db.commit()

@router.post("/stock-in", response_model=StockTransactionResponse)
def stock_in(
    data: StockInOutRequest,
    db: Session = Depends(get_db)
):
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    item = db.query(Item).filter(Item.id == data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Update item stock
    item.stock += data.quantity  # type: ignore

    # Log transaction
    transaction = StockTransaction(
        item_id=data.item_id,
        transaction_type="IN",
        quantity=data.quantity
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Update category totals
    update_category_totals(item.category_id, db)  # type: ignore

    return transaction

@router.post("/stock-out", response_model=StockTransactionResponse)
def stock_out(
    data: StockInOutRequest,
    db: Session = Depends(get_db)
):
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    item = db.query(Item).filter(Item.id == data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.stock < data.quantity:  # type: ignore
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    # Reduce item stock
    item.stock -= data.quantity  # type: ignore

    # Log transaction
    transaction = StockTransaction(
        item_id=data.item_id,
        transaction_type="OUT",
        quantity=data.quantity
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Update category totals
    update_category_totals(item.category_id, db)  # type: ignore

    return transaction

@router.get("/transactions", response_model=list[StockTransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    transactions = (
        db.query(
            StockTransaction,
            Item.name.label("item_name"),
            Category.name.label("category_name")
        )
        .join(Item, StockTransaction.item_id == Item.id)
        .join(Category, Item.category_id == Category.id)
        .order_by(StockTransaction.timestamp.desc())
        .all()
    )
    
    # Build response with joined data
    result = []
    for tx, item_name, category_name in transactions:
        result.append({
            "id": tx.id,
            "item_id": tx.item_id,
            "item_name": item_name,
            "category_name": category_name,
            "transaction_type": tx.transaction_type,
            "quantity": tx.quantity,
            "timestamp": tx.timestamp
        })
    
    return result

@router.get("/low-stock")
def low_stock_items(threshold: int = 5, db: Session = Depends(get_db)):
    items = (
        db.query(
            Item.id.label("id"),
            Item.name.label("name"),
            Item.stock.label("stock"),
            Item.price_per_unit.label("price_per_unit"),
            Category.name.label("category_name"),
            Category.id.label("category_id")
        )
        .join(Category, Item.category_id == Category.id)
        .filter(Item.stock < threshold)
        .all()
    )
    
    # Convert to dict format with proper field names
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "name": item.name,
            "stock": item.stock,
            "price_per_unit": item.price_per_unit,
            "category_name": item.category_name,
            "category_id": item.category_id
        })
    
    return result

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_categories = db.query(Category).count()
    total_items = db.query(Item).count()

    total_stock = db.query(func.sum(Item.stock)).scalar() or 0
    total_inventory_value = db.query(
        func.sum(Item.stock * Item.price_per_unit)
    ).scalar() or 0.0

    # Count items with stock below threshold (default 5)
    low_stock_count = db.query(Item).filter(Item.stock < 5).count()

    return {
        "total_categories": total_categories,
        "total_items": total_items,
        "total_stock": total_stock,
        "total_inventory_value": total_inventory_value,
        "low_stock_count": low_stock_count
    }
