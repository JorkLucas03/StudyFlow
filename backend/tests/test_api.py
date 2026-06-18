import os
from collections.abc import Generator
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_session
from app.main import app


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        pool_pre_ping=True,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_session() -> Generator[Session, None, None]:
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def plan_payload(**overrides):
    payload = {
        "subject": "Matematicas",
        "examDate": (date.today() + timedelta(days=14)).isoformat(),
        "hoursPerDay": 2,
        "difficulty": "Media",
        "focus": "Examen parcial",
        "topics": "Limites, Derivadas, Integrales",
    }
    payload.update(overrides)
    return payload


def test_health(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "studyflow-api"
    assert response.json()["version"] == "1.0.0"
    assert response.json()["deploymentCheck"] == "cloud-run-ready-2026-06-17"


def test_root_shows_api_info(client: TestClient):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["name"] == "StudyFlow API"
    assert response.json()["version"] == "1.0.0"
    assert response.json()["docs"] == "/docs"


def test_content_endpoint(client: TestClient):
    response = client.get("/api/content")

    assert response.status_code == 200
    assert response.json()["appInfo"]["name"] == "StudyFlow"


def test_crud_study_plan(client: TestClient):
    create_response = client.post("/api/study-plans", json=plan_payload())

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["id"] == 1
    assert created["dailyPlan"][0]["title"] == "Limites"

    list_response = client.get("/api/study-plans")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    get_response = client.get("/api/study-plans/1")
    assert get_response.status_code == 200
    assert get_response.json()["subject"] == "Matematicas"

    update_response = client.put(
        "/api/study-plans/1",
        json=plan_payload(subject="Programacion", topics="Funciones, Arrays, APIs"),
    )
    assert update_response.status_code == 200
    assert update_response.json()["subject"] == "Programacion"
    assert update_response.json()["dailyPlan"][0]["title"] == "Funciones"

    delete_response = client.delete("/api/study-plans/1")
    assert delete_response.status_code == 204
    assert client.get("/api/study-plans/1").status_code == 404


def test_validates_payload(client: TestClient):
    response = client.post(
        "/api/study-plans",
        json=plan_payload(hoursPerDay=12, difficulty="Imposible"),
    )

    assert response.status_code == 422


def test_rejects_blank_subject_and_topics(client: TestClient):
    response = client.post(
        "/api/study-plans",
        json=plan_payload(subject="   ", topics=" , "),
    )

    assert response.status_code == 422


def test_rejects_past_exam_date(client: TestClient):
    response = client.post(
        "/api/study-plans",
        json=plan_payload(examDate="2020-01-01"),
    )

    assert response.status_code == 422


def test_lists_study_plans_by_recent_updates(client: TestClient):
    first = client.post(
        "/api/study-plans",
        json=plan_payload(subject="Historia", topics="Roma, Grecia"),
    ).json()
    second = client.post(
        "/api/study-plans",
        json=plan_payload(subject="Quimica", topics="Atomos, Enlaces"),
    ).json()

    client.put(
        f"/api/study-plans/{first['id']}",
        json=plan_payload(subject="Historia actualizada", topics="Imperios, Revoluciones"),
    )

    response = client.get("/api/study-plans")

    assert response.status_code == 200
    subjects = [plan["subject"] for plan in response.json()]
    assert subjects[0] == "Historia actualizada"
    assert "Quimica" in subjects
    assert second["id"] != first["id"]
