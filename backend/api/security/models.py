from pydantic import BaseModel

from api.users.models import Role


class Token(BaseModel):
    """
    Model for the token generation endpoint reponse
    Token type should be "bearer"

    Oauth2 spec compliant
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Data we wish to save when a user logins
    Used for authentification & authorization for most endpoints.
    """

    email: str
    user_id: int
    role: Role
