from pathlib import Path

from backboard import BackboardClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.chats.service import generate_weekly_report
from api.config import BACKBOARD_API_KEY
from api.security.models import TokenData
from api.therapists.models import Alert, AlertMessage, PatientNote, PatientNoteMessage, Report, ReportMessage
from api.users.models import LinkStatus, PatientLink, Role, User, UserOut
from api.users.service import InvalidRequest, PermissionDenied


async def assert_therapist_can_access_patient(
    session: AsyncSession,
    therapist_id: int,
    patient_id: int,
):
    stmt = select(PatientLink).where(
        PatientLink.therapist_id == therapist_id,
        PatientLink.patient_id == patient_id,
        PatientLink.link_status == LinkStatus.ACCEPTED,
    )
    link = (await session.execute(stmt)).scalar_one_or_none()
    if not link:
        raise PermissionDenied("Therapist has no access to this patient")


async def get_patient(
    session: AsyncSession, user_info: TokenData, patient_id: int
) -> UserOut:
    """
    Get a therapist's specific patient identified by id
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can access patient information")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = (
        select(User)
        .where(User.id == user_info.user_id)
        .options(selectinload(User.patient_links))
    )
    therapist_obj = (await session.execute(stmt)).scalar_one_or_none()

    if not therapist_obj:
        raise InvalidRequest("Therapist not found")

    stmt = select(User).where(User.id == patient_id)
    patient = (await session.execute(stmt)).scalar_one_or_none()

    if not patient:
        raise InvalidRequest("Patient not found")

    return UserOut(
        id=patient.id,
        email=patient.email,
        role=patient.role.value,
        full_name=patient.full_name,
        phone_number=patient.phone_number,
    )


async def list_patients(session: AsyncSession, user_info: TokenData) -> list[UserOut]:
    """
    List a therapist's patients
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can access patient information")

    stmt = (
        select(User)
        .where(User.id == user_info.user_id)
        .options(selectinload(User.patient_links))
    )
    therapist_obj = (await session.execute(stmt)).scalar_one_or_none()
    if not therapist_obj:
        raise InvalidRequest("Therapist not found")

    patient_ids = [p.patient_id for p in therapist_obj.patient_links]

    stmt = select(User).where(User.id.in_(patient_ids))
    patients = (await session.execute(stmt)).scalars().all()

    patients_output = []

    for p in patients:
        patients_output.append(
            UserOut(
                id=p.id,
                email=p.email,
                role=p.role.value,
                full_name=p.full_name,
                phone_number=p.phone_number,
            )
        )

    return patients_output


async def generate_report(
    session: AsyncSession, user_info: TokenData, patient_id: int
) -> ReportMessage:
    """
    Generate a new weekly report and store it in db

    Return the newly created report
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can generate reports")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = select(User).where(User.id == patient_id).options(selectinload(User.patient))
    patient_obj = (await session.execute(stmt)).scalar_one_or_none()
    if not patient_obj:
        raise InvalidRequest("Patient not found")

    thread_id = patient_obj.patient.thread_id
    report_thread_id = patient_obj.patient.report_thread_id

    report = await generate_weekly_report(thread_id, report_thread_id, patient_id)

    if report.content == "No patient activity in the last 7 days.":
        return report

    report_obj = Report(
        therapist_id=user_info.user_id,
        patient_id=patient_id,
        content=report.content,
    )

    try:
        session.add(report_obj)
        await session.commit()
        await session.refresh(report_obj)
    except:
        await session.rollback()
        raise

    return report


async def list_patient_reports(
    session: AsyncSession, user_info: TokenData, patient_id: int
) -> list[ReportMessage]:
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can generate reports")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = (
        select(Report)
        .where(
            Report.therapist_id == user_info.user_id, Report.patient_id == patient_id
        )
        .order_by(Report.created_at.desc())
    )

    reports = (await session.execute(stmt)).scalars().all()

    return [
        ReportMessage(
            id=r.id,
            content=r.content,
            patient_id=r.patient_id,
            created_at=r.created_at,
        )
        for r in reports
    ]


async def get_patient_report(
    session: AsyncSession, user_info: TokenData, patient_id: int, report_id: int
) -> ReportMessage:
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can generate reports")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = select(Report).where(
        Report.therapist_id == user_info.user_id,
        Report.patient_id == patient_id,
        Report.id == report_id,
    )

    report = (await session.execute(stmt)).scalar_one_or_none()
    if not report:
        raise InvalidRequest("Report not found")

    return ReportMessage(
        id=report.id,
        content=report.content,
        patient_id=report.patient_id,
        created_at=report.created_at,
    )


async def add_patient_note(
    session: AsyncSession,
    user_info: TokenData,
    patient_id: int,
    file_path: Path,
    file_name: str,
) -> PatientNoteMessage:
    """
    Add a patient note document to the database and upload it to the patient's assistant.
    
    Args:
        session: Database session
        user_info: Current user's token data
        patient_id: The patient's user ID
        file_path: Path to the file to upload
        file_name: Original file name
    
    Returns:
        The created PatientNoteMessage
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can add patient notes")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    # Get the patient's assistant_id
    stmt = select(User).where(User.id == patient_id).options(selectinload(User.patient))
    patient_obj = (await session.execute(stmt)).scalar_one_or_none()
    
    if not patient_obj or not patient_obj.patient:
        raise InvalidRequest("Patient not found")

    assistant_id = patient_obj.patient.assistant_id

    # Upload document to the patient's assistant
    async with BackboardClient(api_key=BACKBOARD_API_KEY) as client:  # type: ignore
        await client.upload_document_to_assistant(
            assistant_id=assistant_id,
            file_path=file_path,
        )

    # Save the note record to the database
    note = PatientNote(
        therapist_id=user_info.user_id,
        patient_id=patient_id,
        file_name=file_name,
    )

    try:
        session.add(note)
        await session.commit()
        await session.refresh(note)
    except Exception:
        await session.rollback()
        raise

    return PatientNoteMessage(
        id=note.id,
        patient_id=note.patient_id,
        therapist_id=note.therapist_id,
        file_name=note.file_name,
        created_at=note.created_at,
    )


async def list_patient_notes(
    session: AsyncSession,
    user_info: TokenData,
    patient_id: int,
) -> list[PatientNoteMessage]:
    """
    List all notes for a specific patient.
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can view patient notes")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = (
        select(PatientNote)
        .where(
            PatientNote.therapist_id == user_info.user_id,
            PatientNote.patient_id == patient_id,
        )
        .order_by(PatientNote.created_at.desc())
    )

    notes = (await session.execute(stmt)).scalars().all()

    return [
        PatientNoteMessage(
            id=n.id,
            patient_id=n.patient_id,
            therapist_id=n.therapist_id,
            file_name=n.file_name,
            created_at=n.created_at,
        )
        for n in notes
    ]


async def get_alerts(
    session: AsyncSession,
    user_info: TokenData,
) -> list[AlertMessage]:
    """
    Get all alerts for a therapist's patients.
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can access alerts")

    stmt = (
        select(Alert, User)
        .join(User, Alert.patient_id == User.id)
        .where(Alert.therapist_id == user_info.user_id)
        .order_by(Alert.created_at.desc())
    )

    results = (await session.execute(stmt)).all()

    return [
        AlertMessage(
            id=alert.id,
            therapist_id=alert.therapist_id,
            patient_id=alert.patient_id,
            patient_name=patient.full_name,
            risk_level=alert.risk_level,
            cause=alert.cause,
            created_at=alert.created_at,
        )
        for alert, patient in results
    ]


async def get_patient_alerts(
    session: AsyncSession,
    user_info: TokenData,
    patient_id: int,
) -> list[AlertMessage]:
    """
    Get alerts for a specific patient.
    """
    if user_info.role != Role.THERAPIST:
        raise PermissionDenied("Only therapists can access alerts")

    await assert_therapist_can_access_patient(session, user_info.user_id, patient_id)

    stmt = (
        select(Alert, User)
        .join(User, Alert.patient_id == User.id)
        .where(
            Alert.therapist_id == user_info.user_id,
            Alert.patient_id == patient_id,
        )
        .order_by(Alert.created_at.desc())
    )

    results = (await session.execute(stmt)).all()

    return [
        AlertMessage(
            id=alert.id,
            therapist_id=alert.therapist_id,
            patient_id=alert.patient_id,
            patient_name=patient.full_name,
            risk_level=alert.risk_level,
            cause=alert.cause,
            created_at=alert.created_at,
        )
        for alert, patient in results
    ]
