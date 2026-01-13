from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.chats.service import generate_weekly_report
from api.security.models import TokenData
from api.therapists.models import Report, ReportMessage
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
