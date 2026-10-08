from pydantic import BaseModel


class ApprovalItemResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    subtotal: float


class ApprovalResponse(BaseModel):
    id: int
    order_id: int
    order_number: str
    customer_name: str
    total_amount: float
    order_status: str
    manager_id: int
    status: str
    comments: str | None = None
    items: list[ApprovalItemResponse]

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    comments: str | None = None