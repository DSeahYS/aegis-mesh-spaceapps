export interface InferenceAction {
  action: string;
  confidence: number;
  score: number;
}

export interface InferenceResult {
  top_actions: InferenceAction[];
  latency_ms: number;
  source: "polarfire-backend" | "in-browser-fallback";
}

export interface ConjunctionResult {
  probability: number;
  timeOfClosestApproach: string;
  missDistance: number;
  relativeVelocityKmS: number;
  bPlaneB: number;
}

export interface CDMData {
  messageId: string;
  creationDate: string;
  primaryObject: string;
  secondaryObject: string;
}

export interface TLEData {
  norad_id: string;
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
  latency_ms: { mean: number; p50: number; p95: number; max: number };
  memory_bytes: { peak: number };
  power_watts: { estimated: number };
}

const DEFAULT_TIMEOUT = 5000;

async function fetchWithTimeout<T = any>(url: string, options: RequestInit = {}): Promise<T | null> {
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
    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(id);
    console.error("API Error:", error);
    return null;
  }
}

export async function runInference(telemetry: number[]): Promise<InferenceResult | null> {
  return fetchWithTimeout("/api/inference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telemetry }),
  });
}

export async function assessConjunction(
  primary: TLEData,
  secondary: TLEData,
  epoch: string,
  hardBodyRadius: number = 10.0
): Promise<ConjunctionResult | null> {
  const raw = await fetchWithTimeout<{
    miss_distance_km: number;
    probability_of_collision: number;
    tca: string;
    b_plane: { xi: number; zeta: number; b_mag: number };
    relative_velocity_km_s: number;
  }>("/api/conjunction/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ primary_tle: primary, secondary_tle: secondary, epoch, hard_body_radius: hardBodyRadius }),
  });
  if (!raw) return null;
  return {
    probability: raw.probability_of_collision,
    timeOfClosestApproach: raw.tca,
    missDistance: raw.miss_distance_km,
    relativeVelocityKmS: raw.relative_velocity_km_s,
    bPlaneB: raw.b_plane?.b_mag ?? 0,
  };
}

export async function parseCDM(cdmText: string): Promise<CDMData | null> {
  const raw = await fetchWithTimeout<{ status: string; data: Record<string, any> }>("/api/cdm/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cdmText }),
  });
  if (!raw || raw.status !== "success") return null;

  const parsed = raw.data ?? {};
  const metadata = parsed.metadata ?? {};
  const dataSection = parsed.data ?? {};
  const objectKeys = Object.keys(metadata);
  const dataObjectKeys = Object.keys(dataSection).filter((k) => typeof dataSection[k] === "object");

  return {
    messageId: parsed.header?.MESSAGE_ID ?? parsed.header?.CCSDS_MSGID ?? "",
    creationDate: parsed.header?.CREATION_DATE ?? dataSection.TCA ?? "",
    primaryObject: metadata[objectKeys[0]]?.OBJECT ?? objectKeys[0] ?? "",
    secondaryObject: metadata[objectKeys[1]]?.OBJECT ?? objectKeys[1] ?? dataObjectKeys[0] ?? "",
  };
}

export async function fetchTLEs(params: Record<string, any>): Promise<TLEData[] | null> {
  const query = new URLSearchParams(params).toString();
  return fetchWithTimeout(`/api/tle/query?${query}`);
}

export async function propagateOrbit(
  tleLine1: string,
  tleLine2: string,
  epoch?: string
): Promise<StateVector | null> {
  return fetchWithTimeout("/api/tle/propagate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tle_line1: tleLine1, tle_line2: tleLine2, epoch: epoch || null }),
  });
}

export async function screenConjunctions(
  primaryTle: string,
  debrisTles: string[],
  windowHours: number = 24.0
): Promise<ConjunctionScreenResult | null> {
  return fetchWithTimeout("/api/conjunction/screen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ primary_tle: primaryTle, debris_tles: debrisTles, window_hours: windowHours }),
  });
}

export async function getHealth(): Promise<HealthStatus | null> {
  return fetchWithTimeout("/api/health");
}

export async function getBenchmarkResults(): Promise<BenchmarkReport | null> {
  return fetchWithTimeout("/api/benchmark/results");
}