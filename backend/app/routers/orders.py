from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return order_service.create_order(
        db,
        order,
        current_user.id
    )


@router.get("/", response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return order_service.get_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return order_service.get_order(
        db,
        order_id
    )