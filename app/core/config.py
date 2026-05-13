from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
# load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

JWT_ISSUER = "IMS-backend"
JWT_AUDIENCE = "IMS-frontend"

# One-time or controlled secret for creating admin users safely.
# Keep this value out of version control and rotate as needed.
ADMIN_CREATION_TOKEN = os.getenv("ADMIN_CREATION_TOKEN")