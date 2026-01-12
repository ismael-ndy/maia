from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.security.models import TokenData
from api.users.models import (
    FriendRequest,
    LinkStatus,
    PatientLink,
    Role,
    User,
)


class PermissionDenied(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)


class NotFound(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)


class InvalidRequest(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)


async def send_friend_request(
    session: AsyncSession,
    user_info: TokenData,
    patient_email: str,
) -> None:
    if user_info.role is Role.PATIENT:
        raise PermissionDenied("Patients cannot send friend requests")

    stmt = select(User.id).where(User.email == patient_email)
    patient_id = (await session.execute(stmt)).scalars().one_or_none()

    if patient_id is None:
        raise NotFound(f"Patient with email {patient_email} does not exist")

    link = PatientLink(
        patient_id=patient_id,
        therapist_id=user_info.user_id,
        link_status=LinkStatus.PENDING,
    )

    session.add(link)
    await session.commit()


async def accept_friend_request(
    session: AsyncSession,
    user_info: TokenData,
    therapist_id: int,
) -> None:
    if user_info.role is Role.THERAPIST:
        raise PermissionDenied("Therapists cannot accept friend requests")

    stmt = select(PatientLink).where(
        PatientLink.patient_id == user_info.user_id,
        PatientLink.therapist_id == therapist_id,
    )

    link = (await session.execute(stmt)).scalars().one_or_none()

    if link is None:
        raise InvalidRequest("Invalid friend request")

    link.link_status = LinkStatus.ACCEPTED
    await session.commit()


async def get_all_friend_requests(
    session: AsyncSession,
    user_info: TokenData,
    status: str | None = None,
) -> list[FriendRequest]:
    match user_info.role:
        case Role.PATIENT:
            field = "patient_id"
        case Role.THERAPIST:
            field = "therapist_id"
        case _:
            raise PermissionDenied("Invalid role")

    stmt = select(PatientLink).where(getattr(PatientLink, field) == user_info.user_id)

    if status is not None:
        try:
            true_status = LinkStatus(status)
        except ValueError:
            raise InvalidRequest(f"Invalid status: {status}")
        stmt = stmt.where(PatientLink.link_status == true_status)

    links = (await session.execute(stmt)).scalars().all()

    match user_info.role:
        case Role.PATIENT:
            return [
                FriendRequest(
                    status=link.link_status.value,
                    name=link.therapist.full_name,
                )
                for link in links
            ]
        case Role.THERAPIST:
            return [
                FriendRequest(
                    status=link.link_status.value,
                    name=link.patient.full_name,
                )
                for link in links
            ]
