from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import InferenceRequest, InferenceResponse, ConjunctionRequest, ConjunctionResponse
from .clm_engine import CLMEngine
from .cara_engine import CARAEngine
from .cdm_parser import CDMParser
from .tle_client import TLEClient, ts_to_jday
from .conjunction_service import ConjunctionService
import time
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AEGIS-MESH Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clm = CLMEngine()
cara = CARAEngine()
cdm_parser = CDMParser()
tle_client = TLEClient()
conjunction_service = ConjunctionService()


@app.post("/api/inference", response_model=InferenceResponse)
async def run_inference(request: InferenceRequest):
    start_time = time.perf_counter()
    results = clm.infer(request.telemetry)
    latency_ms = (time.perf_counter() - start_time) * 1000

    return InferenceResponse(
        top_actions=results,
        latency_ms=latency_ms,
        source="polarfire-backend"
    )


class CDMRequest(BaseModel):
    cdmText: str


class ScreenRequest(BaseModel):
    primary_tle: str
    debris_tles: List[str]
    window_hours: float = 24.0


@app.post("/api/cdm/parse")
async def parse_cdm(req: CDMRequest):
    try:
        data = cdm_parser.parse(req.cdmText)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/tle/query")
async def query_tle(catnr: str = None, group: str = None):
    params = {}
    if catnr:
        params["CATNR"] = catnr
    if group:
        params["GROUP"] = group
    tles = tle_client.query(params)
    # Return structured JSON with parsed TLE fields
    parsed = []
    for t in tles:
        parsed.append({
            "norad_id": t.get("norad_id", ""),
            "name": t.get("name", ""),
            "line1": t.get("line1", ""),
            "line2": t.get("line2", ""),
        })
    return {"tles": parsed}


@app.post("/api/conjunction/assess", response_model=ConjunctionResponse)
async def assess_conjunction(req: ConjunctionRequest):
    try:
        result = conjunction_service.assess(
            req.primary_tle.model_dump(),
            req.secondary_tle.model_dump(),
            req.epoch,
            req.hard_body_radius,
        )
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/conjunction/screen")
async def screen_conjunctions(req: ScreenRequest):
    """Screen a primary satellite against a list of debris TLE NORAD IDs."""
    results = []
    for debris_id in req.debris_tles:
        result = conjunction_service.screen(req.primary_tle, debris_id, req.window_hours)
        results.append(result)
    primary_name = next((r.get("primary") for r in results if r.get("primary")), req.primary_tle)
    return {"primary": primary_name, "screened": len(results), "conjunctions": results}


@app.get("/api/tle/propagate")
async def propagate_orbit(tle_line1: str, tle_line2: str, epoch: str = None):
    """Propagate a TLE to a given epoch and return position/velocity."""
    import time as _time
    from sgp4.api import Satrec
    from datetime import datetime, timezone

    sat = Satrec.twoline2rv(tle_line1, tle_line2)

    if epoch:
        try:
            dt = datetime.fromisoformat(epoch.replace("Z", "+00:00"))
            ts = dt.timestamp()
        except Exception:
            ts = _time.time()
    else:
        ts = _time.time()

    jd, fr = ts_to_jday(ts)
    e, r, v = sat.sgp4(jd, fr)
    if e != 0:
        raise HTTPException(status_code=400, detail="Propagation failed")

    return {
        "position": list(r),
        "velocity": list(v),
        "epoch": epoch or _time.strftime("%Y-%m-%dT%H:%M:%SZ", _time.gmtime(ts)),
    }


@app.get("/api/health")
async def get_health():
    return {"status": "ok", "uptime": time.process_time()}


@app.get("/api/benchmark/results")
async def get_benchmark_results():
    import json
    from pathlib import Path
    # Docker container path first, then repo-relative path for local runs
    candidates = [
        Path("/app/benchmark/results/benchmark_report.json"),
        Path(__file__).resolve().parent.parent.parent / "benchmark" / "results" / "benchmark_report.json",
    ]
    for path in candidates:
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            continue
    return {"error": "Benchmark results not found. Run benchmark first."}