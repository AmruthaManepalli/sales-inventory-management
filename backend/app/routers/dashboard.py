from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order
from app.models.approval import ApprovalRequest
from app.models.product import Product
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Total confirmed sales
    total_sales = (
        db.query(
            func.coalesce(
                func.sum(Order.total_amount),
                0
            )
        )
        .filter(Order.status == "CONFIRMED")
        .scalar()
    )

    # Total confirmed orders
    total_orders = (
        db.query(Order)
        .filter(Order.status == "CONFIRMED")
        .count()
    )

    # Total rejected orders
    rejected_orders = (
        db.query(Order)
        .filter(Order.status == "REJECTED")
        .count()
    )

    # Orders waiting for manager approval
    pending_approvals = (
        db.query(ApprovalRequest)
        .filter(
            ApprovalRequest.status == "PENDING"
        )
        .count()
    )

    # Products with stock <= 5
    low_stock_products = (
        db.query(Product)
        .filter(
            Product.stock_quantity <= 5
        )
        .count()
    )

    return {
        "total_sales": float(total_sales),
        "total_orders": total_orders,
        "rejected_orders": rejected_orders,
        "pending_approvals": pending_approvals,
        "low_stock_products": low_stock_products,
    }