from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.item import Item
from app.models.category import Category
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.database.session import SessionLocal, get_db

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)

# CREATE Item
@router.post("/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    new_item = Item(
        name = item.name,
        category_id = item.category_id,
        stock = item.stock,
        price_per_unit = item.price_per_unit
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

# READ ALL Item
@router.get("/", response_model=list[ItemResponse])
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()

# READ Item by ID 
@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id:int, db:Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# UPDATE Item 
@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
        item_id:int,
        item_data: ItemUpdate,
        db:Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item_data.name is not None:
        item.name = item_data.name # type: ignore
    if item_data.price_per_unit is not None:
        item.price_per_unit = item_data.price_per_unit # type: ignore

    db.commit()
    db.refresh(item)

    return item

# DELETE Item
@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}