from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, EmailStr
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api import Base


class Role(str, Enum):
    PATIENT = "patient"
    THERAPIST = "therapist"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    role: Mapped[Role] = mapped_column(
        SAEnum(Role, name="role_enum"),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(nullable=False)

    hashed_pw: Mapped[str] = mapped_column(nullable=False)

    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    therapist_links: Mapped[list["PatientLink"]] = relationship(
        foreign_keys="PatientLink.patient_id",
        backref="patient",
    )

    patient_links: Mapped[list["PatientLink"]] = relationship(
        foreign_keys="PatientLink.therapist_id",
        backref="therapist",
    )


class UserIn(BaseModel):
    email: EmailStr
    password: str
    role: str
    full_name: str


class UserOut(BaseModel):
    email: str
    role: str
    full_name: str


class LinkStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DENIED = "denied"


class PatientLink(Base):
    __tablename__ = "patient_link"

    id: Mapped[int] = mapped_column(primary_key=True)

    link_status: Mapped[LinkStatus] = mapped_column(
        SAEnum(LinkStatus, name="link_status_enum"),
        nullable=False,
        default=LinkStatus.PENDING,
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    __table_args__ = UniqueConstraint(
        "patient_id",
        "therapist_id",
        name="uq_patient_therapist",
    )
