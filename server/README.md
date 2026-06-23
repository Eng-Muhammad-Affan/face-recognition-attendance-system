
# 🏍️ FastAPI E-Commerce Backend
Ecommerce api built for techwagera ecommerce store.

---

## 🧱 Tech Stack

* Python 3.14
* FastAPI
* PostgreSQL
* SQLAlchemy ORM
* Alembic (migrations)
* Pydantic (data validation)
* Fast-mail (emailing and smtp client)
---


## 🚀 Features

### ✅ Authentication

* Signup / Signin (JWT)
* Role-based access: `admin` and `user`
* Profile endpoint
* Password hashing with bcrypt
* Forgot/Reset Password via email (Gmail SMTP)

### 🏍️ Product Management

* Admin-only CRUD operations
* Public product listing with pagination, filters, and search
* Product detail view

### 🛍️ Cart Management (User Only)

* Add/update/remove items from cart
* View current cart with nested product info

### 💳 Checkout & Orders (User Only)

* Checkout from cart (dummy payment)
* Create order with total + items
* View order history & details

### 🔐 Security & Validation

* JWT for protected routes
* Role-restricted access (user/admin)
* Strong validators for email, password, product data
* SQLAlchemy models with Alembic migrations

---


## 📁 Project Structure

This project is built on applicatio repository pattern. Each module contains 

- **schema.py** which handles pydentic validaation logic for apis 
- **routes.py** Router instance for that module  
- **models.py** Database entities for that module

```
app/
├── auth/               # Signup, signin, JWT, password reset
│   ├── models.py
│   ├── schemas.py
│   ├── routes.py
│   └── utils.py
│
├── products/           # Product CRUD & listing
│   ├── models.py
│   ├── schemas.py
│   ├── routes.py
│   └── public_routes.py
│
├── cart/               # Cart management
│   ├── models.py
│   ├── schemas.py
│   └── routes.py
│
├── orders/             # Checkout & order viewing
│   ├── models.py
│   ├── schemas.py
│   ├── checkout_routes.py
│   └── order_routes.py
│
├── core/               # DB setup & config
│   ├── config.py
│   └── database.py
│
├── seed/               # Product seed script (manual)
│   └── seed_products.py
│
├── postman/            # Postman collection
│   └── fastapi-ecommerce.postman_collection.json
│
├── main.py             # App entry point
```

---

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/Akshat3128/fastapi-ecommerce
cd fastapi-ecommerce
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Setup `.env`

```env

DATABASE_URL=postgresql://postgres.jlungsopbvmtroxylgtk:jfkjdskfjdf@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=4320
ENVIRONMENT=production

MAIL_USERNAME=  # email domain or you email address
MAIL_PASSWORD=   obtaine this from google 
MAIL_FROM=    # email domain or you email address
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com    #
MAIL_FROM_NAME=    # name on whos behalf your sending emails 

FRONTEND_URL=http://localhost:5173 # your current frontend url localhost for local and domain name for production , responsible for sending the links on emails

ALLOWED_ORIGINS="http://localhost:5173,http://localhost:4173"

```

### 3. Run Alembic Migrations

```bash
alembic upgrade head
```

### 4. Run the Server

for production
```bash
uvicorn app.main:app --host 0.0.0.0 --port yourport
```

for local development
```bash
uvicorn app.main:app --reload
```

Visit: [http://localhost:8000/docs](http://localhost:8000/docs) — Swagger UI auto-generates full API documentation (OpenAPI compliant).

---

## 📧 Reset Password Flow

1. `POST /auth/forgot-password` with email → sends reset token
2. `POST /auth/reset-password` with token + new password

---

## 🔐 Admin vs User Permissions

| Action               | User | Admin |
| -------------------- | ---- | ----- |
| Sign Up / Login      | ✅    | ✅     |
| Access JWT Routes    | ✅    | ✅     |
| View Products        | ✅    | ✅     |
| Create/Edit Products | ❌    | ✅     |
| Use Cart             | ✅    | ❌     |
| Checkout + Orders    | ✅    | ❌     |

---

## 📍 Seeding Products

Use the manual script:

```bash
python seed/seed_products.py
```

This script inserts test products into the database for local testing/dev. Modify it to fit your product data.

---

## 📌 Notes

* Uses Gmail App Passwords — safe for dev.
* Email send uses `smtplib`, can switch to SendGrid/SMTP provider.
* Swagger/OpenAPI auto-generated at `/docs`
* Postman collection included
* Deployment-ready structure

---
