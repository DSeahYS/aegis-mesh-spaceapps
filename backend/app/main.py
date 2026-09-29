from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import InferenceRequest, InferenceResponse
from .clm_engine import CLMEngine
from .cara_engine import CARAEngine
from .cdm_parser import CDMParser
from .tle_client import TLEClient
import time
from pydantic import BaseModel

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
    if catnr: params["CATNR"] = catnr
    if group: params["GROUP"] = group
    tles = tle_client.query(params)
    return {"tles": tles}

@app.get("/api/health")
async def get_health():
    return {"status": "ok", "uptime": time.process_time()}

@app.get("/api/benchmark/results")
async def get_benchmark_results():
    try:
        import json
        with open("/app/benchmark/results/benchmark_report.json", "r") as f:
            return json.load(f)
    except Exception:
        return {"error": "Benchmark results not found. Run benchmark first."}
