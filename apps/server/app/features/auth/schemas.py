from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
from uuid import UUID
from typing import Optional
from fastapi import UploadFile

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"


class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=2, max_length=100)
    image: Optional[UploadFile] = None  # or you can make it required

    @field_validator("email")
    def validate_gmail(cls, v):
        if not v.endswith("@gmail.com"):
            raise ValueError("Only @gmail.com emails are allowed")
        return v

    @field_validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty or only spaces")
        return v.strip()

    @field_validator("department")
    def validate_department(cls, v):
        if not v.strip():
            raise ValueError("Department cannot be empty or only spaces")
        return v.strip()

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: RoleEnum

    class Config:
        orm_mode = True

class UserSignin(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

