from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import SessionLocal, get_db
from app.models.item import Item
from app.models.category import Category
from app.models.transaction import StockTransaction
from app.schemas.transaction import StockTransactionCreate, StockTransactionResponse

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
    data: StockTransactionCreate,
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
    data: StockTransactionCreate,
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
    return db.query(StockTransaction).order_by(
        StockTransaction.timestamp.desc()
    ).all()

@router.get("/low-stock")
def low_stock_items(threshold: int = 5, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.stock < threshold).all()
    return items

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_categories = db.query(Category).count()
    total_items = db.query(Item).count()

    total_stock = db.query(func.sum(Item.stock)).scalar() or 0
    total_amount = db.query(func.sum(Item.stock * Item.price_per_unit)).scalar() or 0.0

    return {
        "total_categories": total_categories,
        "total_items": total_items,
        "total_stock": total_stock,
        "total_amount": total_amount
    }
