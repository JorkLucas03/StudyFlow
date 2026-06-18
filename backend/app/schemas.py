from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .content import DIFFICULTY_OPTIONS, FOCUS_OPTIONS


class DailyPlanItem(BaseModel):
    label: str
    title: str
    time: str
    tasks: list[str]


class StudyPlanPayload(BaseModel):
    subject: Annotated[str, Field(min_length=1, max_length=120)]
    examDate: date
    hoursPerDay: Annotated[float, Field(ge=1, le=8)]
    difficulty: str
    focus: str
    topics: Annotated[str, Field(max_length=600)] = ""

    @field_validator("subject")
    @classmethod
    def clean_subject(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("subject is required")
        return cleaned

    @field_validator("examDate")
    @classmethod
    def validate_exam_date(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("examDate must be today or a future date")
        return value

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        if value not in DIFFICULTY_OPTIONS:
            raise ValueError("difficulty must be one of: " + ", ".join(DIFFICULTY_OPTIONS))
        return value

    @field_validator("focus")
    @classmethod
    def validate_focus(cls, value: str) -> str:
        if value not in FOCUS_OPTIONS:
            raise ValueError("focus must be one of: " + ", ".join(FOCUS_OPTIONS))
        return value

    @field_validator("topics")
    @classmethod
    def clean_topics(cls, value: str) -> str:
        cleaned = value.strip()
        topics = [topic.strip() for topic in cleaned.split(",") if topic.strip()]
        if not topics:
            raise ValueError("topics must include at least one topic")
        return cleaned


class StudyPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: str
    examDate: date
    hoursPerDay: float
    difficulty: str
    focus: str
    topicsInput: str
    coverage: int
    dailyPlan: list[DailyPlanItem]
    daysUntilExam: int
    pace: str
    topics: list[str]
    totalHours: float
    createdAt: datetime
    updatedAt: datetime


class ContentResponse(BaseModel):
    appInfo: dict
    defaultTopics: list[str]
    difficultyOptions: list[str]
    focusOptions: list[str]
    checklistItems: list[dict]
    studyMethods: list[dict]
