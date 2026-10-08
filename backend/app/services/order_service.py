from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.approval import ApprovalRequest
from app.models.user import User
from app.schemas.order import OrderCreate
from app.services.email_service import send_email


APPROVAL_THRESHOLD = 50000


def create_order(db: Session, order_data: OrderCreate, user_id: int):
    # Check customer
    customer = (
        db.query(Customer)
        .filter(Customer.id == order_data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Check order items
    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item"
        )

    total_amount = 0
    order_items_data = []

    # Validate products and calculate total
    for item in order_data.items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product: {product.name}"
            )

        subtotal = product.price * item.quantity
        total_amount += subtotal

        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal
        })

    # Generate order number
    order_number = f"ORD-{user_id}-{db.query(Order).count() + 1}"

    # Determine whether approval is required
    requires_approval = total_amount > APPROVAL_THRESHOLD

    order_status = (
        "PENDING_APPROVAL"
        if requires_approval
        else "CONFIRMED"
    )

    # Create order
    new_order = Order(
        order_number=order_number,
        customer_id=order_data.customer_id,
        created_by=user_id,
        total_amount=total_amount,
        status=order_status
    )

    db.add(new_order)
    db.flush()

    # Create order items
    for item_data in order_items_data:

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"]
        )

        db.add(order_item)

    # If approval is required
    if requires_approval:

        # Find a manager
        manager = (
            db.query(User)
            .filter(User.role == "MANAGER")
            .first()
        )

        if not manager:
            db.rollback()

            raise HTTPException(
                status_code=500,
                detail="No manager available for approval"
            )

        # Create approval request
        approval = ApprovalRequest(
            order_id=new_order.id,
            manager_id=manager.id,
            status="PENDING"
        )

        db.add(approval)

        # Commit order + items + approval
        db.commit()
        db.refresh(new_order)

        # Send email to manager
        try:
            await_send_email(
                recipient=manager.email,
                subject=f"Approval Required - Order {new_order.order_number}",
                body=(
                    f"Hello {manager.name},\n\n"
                    f"A new order requires your approval.\n\n"
                    f"Order Number: {new_order.order_number}\n"
                    f"Customer: {customer.name}\n"
                    f"Order Amount: ₹{new_order.total_amount:.2f}\n\n"
                    f"Please review the order in the Sales & Inventory Management System."
                )
            )
        except Exception as email_error:
            print(f"Failed to send manager email: {email_error}")

        return new_order

    # Normal order - deduct stock immediately
    for item_data in order_items_data:

        product = item_data["product"]

        product.stock_quantity -= item_data["quantity"]

    db.commit()
    db.refresh(new_order)

    return new_order


def await_send_email(recipient: str, subject: str, body: str):
    """
    Helper to run the async email function from this synchronous service.
    """
    import asyncio

    asyncio.run(
        send_email(
            recipient=recipient,
            subject=subject,
            body=body
        )
    )


def get_orders(db: Session):
    return db.query(Order).all()


def get_order(db: Session, order_id: int):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order