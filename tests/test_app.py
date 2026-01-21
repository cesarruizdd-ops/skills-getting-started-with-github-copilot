import os
import sys
import uuid

from fastapi.testclient import TestClient

# Ensure src is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src")
sys.path.insert(0, SRC)

from app import app


client = TestClient(app)


def test_get_activities():
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert "Tennis Club" in data


def test_signup_and_unregister_flow():
    activity = "Chess Club"
    email = f"test{uuid.uuid4().hex}@example.com"

    # Ensure email not present initially
    res = client.get("/activities")
    assert res.status_code == 200
    assert email not in res.json()[activity]["participants"]

    # Sign up
    res = client.post(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 200
    assert "Signed up" in res.json().get("message", "")

    # Confirm participant added
    res = client.get("/activities")
    assert res.status_code == 200
    assert email in res.json()[activity]["participants"]

    # Unregister
    res = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert res.status_code == 200
    assert "Unregistered" in res.json().get("message", "")

    # Confirm participant removed
    res = client.get("/activities")
    assert res.status_code == 200
    assert email not in res.json()[activity]["participants"]
