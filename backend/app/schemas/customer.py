from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str | None = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    address: str | None = None

    class Config:
        from_attributes = True