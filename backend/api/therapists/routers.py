import tempfile
from pathlib import Path

from backboard.exceptions import BackboardServerError
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from api.core.db import SESSION_DEP
from api.security.service import USER_INFO_DEP
from api.therapists.models import AlertMessage, PatientNoteMessage, ReportMessage
from api.therapists.service import (
    add_patient_note,
    generate_report,
    get_alerts,
    get_patient,
    get_patient_alerts,
    get_patient_report,
    list_patient_notes,
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


@router.get("/alerts", response_model=list[AlertMessage])
async def list_alerts_route(
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    """
    Get all alerts for the authenticated therapist's patients.
    """
    try:
        return await get_alerts(
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


@router.get("/patients/{patient_id}/alerts", response_model=list[AlertMessage])
async def list_patient_alerts_route(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    """
    Get alerts for a specific patient.
    """
    try:
        return await get_patient_alerts(
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


@router.post("/patients/{patient_id}/notes", response_model=PatientNoteMessage)
async def upload_patient_note(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
    file: UploadFile = File(...),
):
    """
    Upload a patient note document.
    The file will be saved and uploaded to the patient's AI assistant.
    Max file size: 5MB
    """
    # File size limit: 5MB
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    try:
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is 5MB, got {len(content) / (1024 * 1024):.1f}MB",
            )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)

        try:
            result = await add_patient_note(
                session=session,
                user_info=user_info,
                patient_id=patient_id,
                file_path=tmp_path,
                file_name=file.filename or "unknown",
            )
            return result
        finally:
            tmp_path.unlink(missing_ok=True)

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
    
    except BackboardServerError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload document to AI assistant. The file may be too large or the service is temporarily unavailable. Please try again with a smaller file.",
        )


@router.get("/patients/{patient_id}/notes", response_model=list[PatientNoteMessage])
async def get_patient_notes(
    patient_id: int,
    session: SESSION_DEP,
    user_info: USER_INFO_DEP,
):
    """
    Get all notes for a specific patient.
    """
    try:
        return await list_patient_notes(
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
