from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.session import SessionLocal, get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserResponse, UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])

# Use a PBKDF2-based scheme to avoid direct bcrypt dependency issues and
# the 72-byte password length limit. For a college project this is
# perfectly acceptable and keeps the implementation simple.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

@router.post("/login", response_model=UserResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):  # type: ignore
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # 2. Hash the password (CRITICAL STEP)
    hashed_password = get_password_hash(user.password)

    # 3. Create the new user object
    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        role="staff"  # Default role for new signups
    )

    # 4. Save to PostgreSQL
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user