# 📦 Inventory Management System (IMS)

A modern, full-stack web application for managing inventory, tracking stock levels, and monitoring transactions. Built with FastAPI (Python) backend and React.js frontend, featuring a clean and intuitive user interface.

![Python](https://img.shields.io/badge/Python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)

---

## 🎯 Project Overview

The **Inventory Management System** is a comprehensive solution designed to help businesses and organizations efficiently manage their inventory. The system provides real-time tracking of stock levels, automated low-stock alerts, transaction history, and detailed analytics through an intuitive dashboard.

### Key Features

- 🔐 **User Authentication** - Secure login and registration with JWT-based authentication
- 📊 **Dashboard Analytics** - Real-time overview of inventory metrics, total value, and low-stock alerts
- 📁 **Category Management** - Organize items into logical categories with automatic stock calculation
- 🏷️ **Item Management** - Add, edit, and delete items with stock tracking and pricing
- 📈 **Stock Operations** - Stock IN/OUT functionality with automatic transaction logging
- 📜 **Transaction History** - Complete audit trail of all inventory movements
- ⚠️ **Low Stock Alerts** - Automated notifications for items running low
- 🎨 **Modern UI** - Beautiful, responsive design with dark theme

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework for building APIs
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM for database operations
- **Passlib** - Password hashing and security
- **Pydantic** - Data validation using Python type annotations

### Frontend
- **React.js 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and dev server
- **Plain CSS** - Custom styling (no UI frameworks)

---

## 📁 Project Structure

```
IMS/
├── app/                          # Backend application
│   ├── main.py                  # FastAPI application entry point
│   ├── core/                    # Core configuration
│   │   ├── config.py           # App configuration
│   │   └── security.py         # Security utilities
│   ├── database/                # Database setup
│   │   ├── base.py             # Base model class
│   │   └── session.py          # Database session management
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py             # User model
│   │   ├── category.py         # Category model
│   │   ├── item.py             # Item model
│   │   └── transaction.py      # Transaction model
│   ├── routers/                 # API route handlers
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── category.py         # Category CRUD operations
│   │   ├── item.py             # Item CRUD operations
│   │   └── inventory.py       # Stock operations & analytics
│   ├── schemas/                 # Pydantic schemas
│   │   ├── user.py             # User request/response schemas
│   │   ├── category.py         # Category schemas
│   │   ├── item.py             # Item schemas
│   │   └── transaction.py      # Transaction schemas
│   └── services/                # Business logic layer
│       ├── category_service.py
│       ├── item_service.py
│       └── inventory_service.py
│
└── frontend/                     # Frontend application
    ├── src/
    │   ├── api/                 # API configuration
    │   │   └── axiosInstance.js # Axios setup with interceptors
    │   ├── components/          # Reusable React components
    │   │   ├── Sidebar.jsx     # Navigation sidebar
    │   │   ├── Header.jsx      # Top header
    │   │   ├── ProtectedRoute.jsx # Route protection
    │   │   ├── Modal.jsx       # Modal dialog component
    │   │   ├── Loader.jsx      # Loading spinner
    │   │   ├── Toast.jsx       # Toast notification
    │   │   └── ToastContext.jsx # Toast context provider
    │   ├── pages/               # Page components
    │   │   ├── Login.jsx       # Login page
    │   │   ├── Register.jsx    # Registration page
    │   │   ├── Dashboard.jsx   # Dashboard page
    │   │   ├── Categories.jsx  # Category management
    │   │   ├── Items.jsx       # Item management
    │   │   ├── Transactions.jsx # Transaction history
    │   │   └── LowStock.jsx    # Low stock alerts
    │   ├── services/            # API service functions
    │   │   ├── authService.js
    │   │   ├── categoryService.js
    │   │   ├── itemService.js
    │   │   └── inventoryService.js
    │   ├── styles/              # CSS stylesheets
    │   │   ├── global.css      # Global styles
    │   │   ├── layout.css      # Layout styles
    │   │   ├── sidebar.css     # Sidebar styles
    │   │   ├── header.css      # Header styles
    │   │   ├── modal.css       # Modal styles
    │   │   ├── loader.css      # Loader styles
    │   │   └── toast.css       # Toast styles
    │   ├── App.jsx              # Main app component
    │   └── main.jsx             # React entry point
    ├── index.html               # HTML template
    ├── package.json             # Node dependencies
    └── vite.config.mts          # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.12+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 14+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd IMS
```

#### 2. Backend Setup

##### Step 2.1: Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

##### Step 2.2: Install Python Dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary passlib python-jose[cryptography] pydantic python-multipart python-dotenv
```

Or create a `requirements.txt` file:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
pydantic==2.5.0
python-multipart==0.0.6
python-dotenv
```

Then install:

```bash
pip install -r requirements.txt
```

##### Step 2.3: Configure Database

1. Create a PostgreSQL database:

```sql
CREATE DATABASE inventory_db;
```

2. Update database connection in `app/database/session.py` if needed:

```python
# Default connection string
DATABASE_URL = "postgresql://username:password@localhost:5432/inventory_db"
```

##### Step 2.4: Run Database Migrations

The application will automatically create tables on first run. Alternatively, you can run:

```bash
python -c "from app.database.base import Base; from app.database.session import engine; Base.metadata.create_all(bind=engine)"
```

#### 3. Frontend Setup

##### Step 3.1: Navigate to Frontend Directory

```bash
cd frontend
```

##### Step 3.2: Install Node Dependencies

```bash
npm install
```

#### 4. Running the Application

##### Start Backend Server

Open a terminal in the project root directory:

```bash
# Activate virtual environment (if not already activated)
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Run the FastAPI server
uvicorn app.main:app --reload
```

The backend will be available at: `http://127.0.0.1:8000`

API documentation (Swagger UI): `http://127.0.0.1:8000/docs`

##### Start Frontend Development Server

Open a new terminal in the `frontend` directory:

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## 📖 Usage Guide

### First Time Setup

1. **Start both servers** (backend and frontend) as described above.

2. **Register a new account**:
   - Navigate to `http://localhost:5173/register`
   - Fill in username, email, and password
   - Click "Register"

3. **Login**:
   - Go to `http://localhost:5173/login`
   - Enter your credentials
   - You'll be redirected to the dashboard

### Using the Application

#### Dashboard
- View overview statistics: total categories, items, stock, inventory value, and low stock alerts

#### Categories
- Click "Add Category" to create a new category (only name required)
- Stock and total amount are automatically calculated from items
- Use "View Categories" to see all categories with their calculated totals
- Edit or delete categories as needed

#### Items
- Click "Add Item" to create a new item
- Select a category, enter name, initial stock, and price per unit
- Use "Stock In" or "Stock Out" buttons to adjust inventory
- Edit item details or delete items

#### Transactions
- View complete history of all stock movements
- See item names, categories, transaction types (IN/OUT), quantities, and timestamps

#### Low Stock Alerts
- Automatically shows items with stock below threshold (default: 5)
- Displays item details and suggested reorder quantities

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (returns token)

### Categories
- `GET /categories` - Get all categories
- `GET /categories/{id}` - Get category by ID
- `POST /categories` - Create new category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Items
- `GET /items` - Get all items
- `GET /items/{id}` - Get item by ID
- `POST /items` - Create new item
- `PUT /items/{id}` - Update item
- `DELETE /items/{id}` - Delete item

### Inventory Operations
- `POST /inventory/stock-in` - Add stock to item
- `POST /inventory/stock-out` - Remove stock from item
- `GET /inventory/transactions` - Get all transactions
- `GET /inventory/low-stock` - Get low stock items
- `GET /inventory/dashboard` - Get dashboard statistics

**Note**: All endpoints except `/auth/register` and `/auth/login` require authentication via Bearer token in the Authorization header.

---

## 🔒 Security Features

- **Password Hashing**: Uses PBKDF2-SHA256 for secure password storage
- **JWT Authentication**: Token-based authentication for API access
- **CORS Protection**: Configured CORS middleware for secure cross-origin requests
- **Input Validation**: Pydantic schemas validate all API inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection attacks

---

## 🎨 UI Features

- **Dark Theme**: Modern dark color scheme for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual indicators during API calls
- **Modal Dialogs**: Clean popups for confirmations and forms
- **Empty States**: Helpful messages when no data is available

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check database credentials in `app/database/session.py`
- Verify database exists: `CREATE DATABASE inventory_db;`

**Port Already in Use**
- Change port: `uvicorn app.main:app --reload --port 8001`
- Or kill the process using port 8000

**Module Not Found Errors**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**Cannot Connect to Backend**
- Verify backend is running on `http://127.0.0.1:8000`
- Check `frontend/src/api/axiosInstance.js` for correct BASE_URL
- Ensure CORS is enabled in backend

**Port Already in Use**
- Change port in `vite.config.mts`:
  ```javascript
  server: {
    port: 5174
  }
  ```

**npm install Fails**
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then reinstall

---

## 📝 Environment Variables

For production, consider using environment variables:

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend (.env)
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🚀 Production Deployment

### Backend Deployment

1. Use a production ASGI server:
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. Set up reverse proxy (Nginx) for production

3. Configure environment variables securely

### Frontend Deployment

1. Build for production:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the `dist` folder using a web server (Nginx, Apache, or Vercel/Netlify)

---

## 📄 License

This project is created for educational purposes as a college project.

---

## 👨‍💻 Author

Developed as a college project demonstrating full-stack web development skills.

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the powerful UI library
- PostgreSQL community for the robust database system
- All open-source contributors whose packages made this project possible

---

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository.

---

**Happy Coding! 🎉**
