"""FastAPI endpoint integration tests."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.vv.selftest import SAMPLE_CDM_TEXT

client = TestClient(app)

SAMPLE_TLE = {
    "norad_id": "25544",
    "name": "ISS (ZARYA)",
    "line1": "1 25544U 98067A   26272.11005302  .00004557  00000+0  91790-4 0  9991",
    "line2": "2 25544  51.6312 145.7721 0007123 200.7262 159.3438 15.48685648587861",
}


def test_health_endpoint():
    """Verify GET /api/health returns 200 and ok status."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_selftest_endpoint():
    """Verify GET /api/vv/selftest runs 16 live tests with 100% pass rate."""
    resp = client.get("/api/vv/selftest")
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"]["total"] == 16
    assert data["summary"]["passed"] == 16
    assert data["summary"]["failed"] == 0
    assert len(data["tests"]) == 16


def test_pipeline_endpoint_default():
    """Verify POST /api/vv/pipeline with empty body runs default scenario."""
    resp = client.post("/api/vv/pipeline", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"]["status"] == "EXECUTE"
    assert data["selected"] is not None
    assert data["selected"]["label"] == "INC-NORTH-129"
    assert data["hj"]["maneuver_certified"] is True
    assert data["cbf"]["forward_invariant"] is True


def test_pipeline_endpoint_fault_injection():
    """Verify POST /api/vv/pipeline with insufficient propellant triggers abort."""
    resp = client.post("/api/vv/pipeline", json={"propellant_mass_kg": 0.02})
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"]["status"] == "ABORT_NO_SAFE_MANEUVER"
    assert data["selected"] is None


def test_validate_cdm_endpoint():
    """Verify POST /api/vv/validate-cdm detects inconsistency in sample CDM."""
    resp = client.post("/api/vv/validate-cdm", json={"cdmText": SAMPLE_CDM_TEXT})
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is False
    assert data["errors"] >= 1


def test_assess_conjunction_endpoint():
    """Verify POST /api/conjunction/assess propagates orbits and evaluates Pc."""
    payload = {
        "primary_tle": SAMPLE_TLE,
        "secondary_tle": SAMPLE_TLE,
        "epoch": "2026-09-29T12:00:00Z",
        "hard_body_radius": 10.0,
    }
    resp = client.post("/api/conjunction/assess", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "miss_distance_km" in data
    assert "probability_of_collision" in data
    assert "b_plane" in data
    assert "relative_velocity_km_s" in data
