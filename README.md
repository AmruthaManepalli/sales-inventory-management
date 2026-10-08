# Sales & Inventory Management System

A full-stack Sales & Inventory Management System developed as part of the Bookxpert Web Developer Technical Assignment.

## Tech Stack

- React.js
- Material UI
- FastAPI
- Python
- SQLAlchemy
- MySQL
- JWT Authentication
- Recharts
- SMTP / Mailtrap

## Features

- User registration and login
- JWT authentication
- Product CRUD
- Customer CRUD
- Sales order management
- Inventory management
- Stock validation
- Manager approval workflow
- Email notifications
- Sales and inventory dashboard
- Order status tracking

## Approval Workflow

Orders above ₹50,000 require manager approval.

```text
Create Order
     ↓
Stock Validation
     ↓
Amount > ₹50,000?
     ↓
Pending Approval
     ↓
Manager Approves / Rejects
     ↓
Confirmed / Rejected
     ↓
Inventory Updated on Approval

## structure
sales-inventory-management/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md



Running the Project
Backend

cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Frontend
cd frontend
npm install
npm run dev

Email Configuration
The application uses SMTP with Mailtrap for email notifications during development.
Configure the required SMTP credentials in the backend .env file.
Author
Amrutha Manepalli