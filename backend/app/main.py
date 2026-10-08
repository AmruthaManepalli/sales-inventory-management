from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.models.user import User
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.approval import ApprovalRequest

from app.routers import auth
from app.routers import products
from app.routers import customers
from app.routers import orders
from app.routers import approvals
from app.routers import dashboard


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Sales & Inventory Management System"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(approvals.router)
app.include_router(dashboard.router)


@app.get("/")
def home():
    return {
        "message": "Sales & Inventory Management System"
    }