from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def create_customer(db: Session, customer: CustomerCreate):
    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def get_customers(db: Session):
    return db.query(Customer).all()


def get_customer(db: Session, customer_id: int):
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


def update_customer(
    db: Session,
    customer_id: int,
    customer: CustomerCreate
):
    existing_customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not existing_customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    existing_customer.name = customer.name
    existing_customer.email = customer.email
    existing_customer.phone = customer.phone
    existing_customer.address = customer.address

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


def delete_customer(db: Session, customer_id: int):
    existing_customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not existing_customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    try:
        db.delete(existing_customer)
        db.commit()

        return {
            "message": "Customer deleted successfully"
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=(
                "This customer cannot be deleted because "
                "they have existing orders."
            )
        )