export interface InferenceResult {
  prediction: string;
  confidence: number;
}

export interface ConjunctionResult {
  probability: number;
  timeOfClosestApproach: string;
  missDistance: number;
}

export interface CDMData {
  messageId: string;
  creationDate: string;
  primaryObject: string;
  secondaryObject: string;
}

export interface TLEData {
  noradId: number;
  name: string;
  line1: string;
  line2: string;
}

export interface StateVector {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface ConjunctionScreenResult {
  conjunctions: ConjunctionResult[];
}

export interface HealthStatus {
  status: string;
  uptime: number;
}

export interface BenchmarkReport {
  latency: number;
  throughput: number;
}

const DEFAULT_TIMEOUT = 5000;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.error('API Error:', error);
    return null;
  }
}

export async function runInference(telemetry: number[]): Promise<InferenceResult | null> {
  return fetchWithTimeout('/api/inference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telemetry }),
  });
}

export async function assessConjunction(primary: any, secondary: any): Promise<ConjunctionResult | null> {
  return fetchWithTimeout('/api/conjunction/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primary, secondary }),
  });
}

export async function parseCDM(cdmText: string): Promise<CDMData | null> {
  return fetchWithTimeout('/api/cdm/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cdmText }),
  });
}

export async function fetchTLEs(params: any): Promise<TLEData[] | null> {
  const query = new URLSearchParams(params).toString();
  return fetchWithTimeout(`/api/tle/query?${query}`);
}

export async function propagateOrbit(tle: string, epoch: string): Promise<StateVector | null> {
  return fetchWithTimeout('/api/tle/propagate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tle, epoch }),
  });
}

export async function screenConjunctions(primaryTle: string, debrisTles: string[], windowHours: number): Promise<ConjunctionScreenResult | null> {
  return fetchWithTimeout('/api/conjunction/screen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryTle, debrisTles, windowHours }),
  });
}

export async function getHealth(): Promise<HealthStatus | null> {
  return fetchWithTimeout('/api/health');
}

export async function getBenchmarkResults(): Promise<BenchmarkReport | null> {
  return fetchWithTimeout('/api/benchmark/results');
}
