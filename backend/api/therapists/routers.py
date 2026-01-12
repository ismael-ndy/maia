from fastapi import APIRouter, HTTPException, status

from api.core.db import SESSION_DEP
from api.security.service import USER_INFO_DEP
from api.therapists.models import ReportMessage
from api.therapists.service import (
    generate_report,
    get_patient,
    get_patient_report,
    list_patient_reports,
    list_patients,
)
from api.users.models import UserOut
from api.users.service import InvalidRequest, PermissionDenied

router = APIRouter(prefix="/therapists", tags=["Therapists"])


@router.get("/patients/{patient_id}", response_model=UserOut)
async def get_patient_route(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        return await get_patient(
            session=session,
            user_info=user_info,
            patient_id=patient_id,
        )

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/patients", response_model=list[UserOut])
async def list_patients_route(
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        return await list_patients(
            session=session,
            user_info=user_info,
        )

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/patients/{patient_id}/reports", response_model=ReportMessage)
async def generate_report_route(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        return await generate_report(
            session=session,
            user_info=user_info,
            patient_id=patient_id,
        )

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/patients/{patient_id}/reports", response_model=list[ReportMessage])
async def list_patient_reports_route(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        return await list_patient_reports(
            session=session,
            user_info=user_info,
            patient_id=patient_id,
        )

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/patients/{patient_id}/reports/{report_id}", response_model=ReportMessage)
async def get_patient_report_route(
    patient_id: int,
    report_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    try:
        return await get_patient_report(
            session=session,
            user_info=user_info,
            patient_id=patient_id,
            report_id=report_id,
        )

    except PermissionDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )

    except InvalidRequest as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
