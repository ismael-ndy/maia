from typing import Any, Dict, List

ToolDict = Dict[str, Any]

GUARDIAN_TOOL: ToolDict = {
    "type": "function",
    "function": {
        "name": "guardian_check",
        "description": "Assess user safety and determine if escalation is required",
        "parameters": {
            "type": "object",
            "properties": {
                "risk_level": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Overall assessed risk level",
                },
                "signals": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Observed warning signals",
                },
                "urgency": {
                    "type": "string",
                    "enum": ["none", "soon", "immediate"],
                    "description": "How urgent the response should be",
                },
            },
            "required": ["risk_level"],
        },
    },
}

EXERCISE_TOOL: ToolDict = {
    "type": "function",
    "function": {
        "name": "suggest_exercise",
        "description": "Request a structured therapeutic exercise from the backend",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {"type": "string"},
                "goal": {"type": "string"},
                "intensity": {"type": "string"},
                "confidence": {"type": "number"},
            },
            "required": ["category", "goal"],
        },
    },
}

TOOLS: List[ToolDict] = [GUARDIAN_TOOL, EXERCISE_TOOL]
