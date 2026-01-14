import json
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession

from api.therapists.models import Alert, AlertMessage

ToolDict = Dict[str, Any]


async def guardian_check(
    session: AsyncSession,
    therapist_id: int,
    patient_id: int,
    risk_level: str,
    cause: str,
) -> Dict[str, Any]:
    """
    Creates an alert row in the database when safety concerns are detected.
    Returns a response directing the patient to their therapist or resources.
    """
    alert = Alert(
        therapist_id=therapist_id,
        patient_id=patient_id,
        risk_level=risk_level,
        cause=cause,
    )

    try:
        session.add(alert)
        await session.commit()
        await session.refresh(alert)
    except Exception:
        await session.rollback()
        raise

    alert_message = AlertMessage(
        id=alert.id,
        therapist_id=therapist_id,
        patient_id=patient_id,
        risk_level=risk_level,
        cause=cause,
        created_at=alert.created_at,
    )


    if risk_level == "high":
        response_message = (
            "I'm concerned about what you've shared. Your safety matters. "
            "Please reach out to your therapist as soon as possible, or if you're in immediate danger, "
            "contact emergency services or a crisis helpline. "
            "The Resources tab has crisis support information available for you."
        )
    elif risk_level == "medium":
        response_message = (
            "Thank you for sharing this with me. It sounds like you could use some extra support right now. "
            "I encourage you to schedule a session with your therapist soon to talk through what's on your mind. "
            "In the meantime, the Resources tab has some helpful tools and information."
        )
    else:
        response_message = (
            "I hear that you're going through a difficult time. "
            "Your wellbeing is important, and I want to make sure you get the support you need. "
            "Please consider reaching out to your therapist to talk about what you're experiencing. "
            "You can also check out the Resources tab for helpful information and support options."
        )

    return {
        "alert": alert_message.model_dump(mode="json"),
        "response": response_message,
    }


GUARDIAN_TOOL: ToolDict = {
    "type": "function",
    "function": {
        "name": "guardian_check",
        "description": "IMPORTANT: You MUST call this tool whenever you detect any safety concerns, distress, self-harm mentions, suicidal thoughts, or emotional crisis. Always provide both risk_level AND cause parameters.",
        "parameters": {
            "type": "object",
            "properties": {
                "risk_level": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Overall assessed risk level: low for mild concerns, medium for moderate distress, high for immediate safety concerns like suicidal thoughts",
                },
                "cause": {
                    "type": "string",
                    "description": "REQUIRED: A detailed description of what triggered the alert. Include specific context from the conversation. Example: 'Patient is expressing suicidal thoughts and mentions feeling hopeless about the future after losing their job'",
                },
            },
            "required": ["risk_level", "cause"],
        },
    },
}


TOOLS: List[ToolDict] = [GUARDIAN_TOOL]
