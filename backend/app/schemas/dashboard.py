from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_sales: float
    total_orders: int
    pending_approvals: int
    low_stock_products: int