from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate


def create_product(db: Session, product: ProductCreate):
    existing_product = db.query(Product).filter(
        Product.sku == product.sku
    ).first()

    if existing_product:
        raise HTTPException(
            status_code=400,
            detail="Product with this SKU already exists"
        )

    new_product = Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        stock_quantity=product.stock_quantity
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def get_products(db: Session):
    return db.query(Product).all()


def update_product(
    db: Session,
    product_id: int,
    product: ProductCreate
):
    existing_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.name = product.name
    existing_product.sku = product.sku
    existing_product.price = product.price
    existing_product.stock_quantity = product.stock_quantity

    db.commit()
    db.refresh(existing_product)

    return existing_product


def delete_product(db: Session, product_id: int):
    existing_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(existing_product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }