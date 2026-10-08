from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.approval import ApprovalRequest
from app.models.order import Order
from app.models.product import Product
from app.models.order_item import OrderItem
from app.models.customer import Customer
from app.models.user import User

from app.schemas.approval import (
    ApprovalDecision,
    ApprovalItemResponse,
    ApprovalResponse,
)

from app.services.email_service import send_email


APPROVAL_THRESHOLD = 50000


def create_approval_request(
    db: Session,
    order_id: int,
    manager_id: int
):
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

    if order.total_amount <= APPROVAL_THRESHOLD:
        raise HTTPException(
            status_code=400,
            detail="This order does not require manager approval"
        )

    existing_approval = (
        db.query(ApprovalRequest)
        .filter(
            ApprovalRequest.order_id == order_id
        )
        .first()
    )

    if existing_approval:
        return existing_approval

    approval = ApprovalRequest(
        order_id=order_id,
        manager_id=manager_id,
        status="PENDING"
    )

    db.add(approval)
    db.commit()
    db.refresh(approval)

    return approval


def get_pending_approvals(
    db: Session,
    manager_id: int
):
    approvals = (
        db.query(ApprovalRequest)
        .filter(
            ApprovalRequest.manager_id == manager_id,
            ApprovalRequest.status == "PENDING"
        )
        .all()
    )

    result = []

    for approval in approvals:

        order = (
            db.query(Order)
            .filter(Order.id == approval.order_id)
            .first()
        )

        if not order:
            continue

        customer = (
            db.query(Customer)
            .filter(Customer.id == order.customer_id)
            .first()
        )

        order_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )

        items = []

        for item in order_items:

            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if not product:
                continue

            items.append(
                ApprovalItemResponse(
                    product_id=product.id,
                    product_name=product.name,
                    sku=product.sku,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.subtotal
                )
            )

        result.append(
            ApprovalResponse(
                id=approval.id,
                order_id=order.id,
                order_number=order.order_number,
                customer_name=(
                    customer.name
                    if customer
                    else "Unknown Customer"
                ),
                total_amount=order.total_amount,
                order_status=order.status,
                manager_id=approval.manager_id,
                status=approval.status,
                comments=approval.comments,
                items=items
            )
        )

    return result


def send_decision_email(
    user: User,
    order: Order,
    decision: str,
    comments: str | None
):
    subject = (
        f"Order {order.order_number} - {decision}"
    )

    body = (
        f"Hello {user.name},\n\n"
        f"Your order has been {decision.lower()}.\n\n"
        f"Order Number: {order.order_number}\n"
        f"Order Amount: ₹{order.total_amount:.2f}\n"
        f"Status: {order.status}\n"
    )

    if comments:
        body += (
            f"Manager Comments: {comments}\n"
        )

    body += (
        "\nYou can log in to the Sales & Inventory "
        "Management System to view the order details.\n\n"
        "Thank you."
    )

    import asyncio

    asyncio.run(
        send_email(
            recipient=user.email,
            subject=subject,
            body=body
        )
    )


def approve_order(
    db: Session,
    approval_id: int,
    manager_id: int,
    decision: ApprovalDecision
):
    try:

        approval = (
            db.query(ApprovalRequest)
            .filter(
                ApprovalRequest.id == approval_id
            )
            .first()
        )

        if not approval:
            raise HTTPException(
                status_code=404,
                detail="Approval request not found"
            )

        if approval.manager_id != manager_id:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to approve this order"
            )

        if approval.status != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Approval request has already been processed"
            )

        order = (
            db.query(Order)
            .filter(Order.id == approval.order_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        user = (
            db.query(User)
            .filter(User.id == order.created_by)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Order creator not found"
            )

        order_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )

        # Validate stock before changing anything
        for item in order_items:

            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Product not found"
                )

            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Insufficient stock for product: "
                        f"{product.name}"
                    )
                )

        # Deduct inventory
        for item in order_items:

            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            product.stock_quantity -= item.quantity

        approval.status = "APPROVED"
        approval.comments = decision.comments

        order.status = "CONFIRMED"

        db.commit()

        try:
            send_decision_email(
                user=user,
                order=order,
                decision="Approved",
                comments=decision.comments
            )
        except Exception as email_error:
            print(
                f"Failed to send approval email: "
                f"{email_error}"
            )

        return {
            "message": "Order approved successfully",
            "order_id": order.id,
            "status": order.status
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to approve order"
        )


def reject_order(
    db: Session,
    approval_id: int,
    manager_id: int,
    decision: ApprovalDecision
):
    try:

        approval = (
            db.query(ApprovalRequest)
            .filter(
                ApprovalRequest.id == approval_id
            )
            .first()
        )

        if not approval:
            raise HTTPException(
                status_code=404,
                detail="Approval request not found"
            )

        if approval.manager_id != manager_id:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to reject this order"
            )

        if approval.status != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Approval request has already been processed"
            )

        order = (
            db.query(Order)
            .filter(Order.id == approval.order_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        user = (
            db.query(User)
            .filter(User.id == order.created_by)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Order creator not found"
            )

        approval.status = "REJECTED"
        approval.comments = decision.comments

        order.status = "REJECTED"

        db.commit()

        try:
            send_decision_email(
                user=user,
                order=order,
                decision="Rejected",
                comments=decision.comments
            )
        except Exception as email_error:
            print(
                f"Failed to send rejection email: "
                f"{email_error}"
            )

        return {
            "message": "Order rejected successfully",
            "order_id": order.id,
            "status": order.status
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to reject order"
        )