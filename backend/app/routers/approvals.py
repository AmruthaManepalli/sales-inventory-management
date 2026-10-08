from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.approval import (
    ApprovalResponse,
    ApprovalDecision,
)

from app.services import approval_service
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/approvals",
    tags=["Approvals"]
)


@router.get(
    "/pending",
    response_model=list[ApprovalResponse]
)
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return approval_service.get_pending_approvals(
        db,
        current_user.id
    )


@router.post("/{approval_id}/approve")
def approve_order(
    approval_id: int,
    decision: ApprovalDecision,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return approval_service.approve_order(
        db,
        approval_id,
        current_user.id,
        decision
    )


@router.post("/{approval_id}/reject")
def reject_order(
    approval_id: int,
    decision: ApprovalDecision,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return approval_service.reject_order(
        db,
        approval_id,
        current_user.id,
        decision
    )