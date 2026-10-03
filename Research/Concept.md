# Project AEGIS-MESH — Concept Document

> **Autonomous Edge Guidance & ISL Swarm Mesh for Decentralized Space Domain Awareness & Collision Avoidance**
>
> *NASA Space Apps Challenge 2026*

---

## 1. The Core Concept

The space environment has reached a critical density threshold where centralized Space Traffic Management (STM) is no longer viable. Currently, ground-based radar requires **8 to 24 hours** to issue Conjunction Data Messages (CDMs)—far too slow to protect mega-constellations from uncatalogued micro-debris traveling at **10 km/s**.

**Project AEGIS-MESH decentralizes STM** by transforming the orbital infrastructure into a *localized immune system*. It pushes Space Domain Awareness (SDA) directly to the satellite's edge processor:

1. **Detect** — Onboard optical star trackers detect an incoming anomaly.
2. **Assess** — The system calculates the collision probability ($P_c$) locally.
3. **Select** — A lightweight edge AI instantly selects an optimal, pre-calculated evasive maneuver from an onboard cache (no trajectory generated from scratch).
4. **Protect** — Before executing the thruster burn, the satellite losslessly migrates its active computational workload to a neighboring node via Inter-Satellite Links (ISL) to prevent data corruption.

---

## 2. Aerospace Datasets & Frameworks

To prove to judges that the system operates on **realistic orbital geometry** rather than simulated math, AEGIS-MESH integrates the following official sources:

| Dataset / Framework | Role in AEGIS-MESH |
| :--- | :--- |
| **NASA ORDEM 3.2** | Baselines the orbital micro-debris flux environment; statistically proves that optical star trackers are mandatory to detect the sub-10 cm debris that ground radars miss. |
| **Space-Track.org TLEs** | Ingests live Two-Line Element sets into a 3D topology map, enabling rapid cross-referencing of optical anomalies against cataloged mega-constellations to prevent false positives. |
| **NASA NAIF SPICE Toolkit** | Calculates exact solar phase angles and localized Earth albedo vectors to dynamically normalize optical noise, allowing the system to reject stray light streaks in the star tracker. |
| **NASA CARA Analysis Tools SDK** | Utilizes the Foster (1992) and Hall (2019) 2D B-plane algorithms to calculate $P_c$, serving as the deterministic trigger for the AI when safety thresholds are breached. |
| **TraCSS / Conjunction Data Messages** | Aligns with Office of Space Commerce standards by natively compiling detected tracklets and evasion maneuvers into ISO 19389 compliant CDMs. |

---

## 3. Key Architectural Innovations

### 3.1 Contrastive-LM (CLM) State-Action Mapping

Traditional LLMs cannot operate on satellites due to multi-second latency and extreme power requirements. AEGIS-MESH solves this by **separating maneuver generation from maneuver selection**:

- Millions of astrodynamically valid escape routes ($\Delta v$ vectors) are **pre-calculated on Earth** and compressed into a vector embedding database.
- A **Contrastive Language Model** (optimized with an InfoNCE loss function) is deployed on the edge node.
- It embeds real-time state telemetry and executes a high-speed **dot-product similarity search** against the action embeddings.
- Combined with **Product Quantization**, the AI footprint drops to a **75 MB cache**, enabling maneuver selection in **under 16 milliseconds** within a **5-Watt** power envelope on a **Microchip PolarFire SoC FPGA**.

### 3.2 Hybrid Neuro-Symbolic Logic (OpenSPG)

Because contrastive AI relies on probabilistic vector proximity, it lacks strict deterministic physical constraints. To solve this:

- AEGIS-MESH integrates a **Knowledge Augmented Generation (KAG)** framework using **OpenSPG** (Semantic-Enhanced Programmable Graphs).
- The OpenSPG engine evaluates the CLM's selected trajectory against hard physical constraints (e.g., maximum available thrust, current propellant mass).
- If the AI proposes an impossible maneuver, the semantic logic chain **rejects it**, ensuring the system never hallucinates a trajectory it cannot execute.

### 3.3 Formal Control Verification

To guarantee physical safety during the actual burn, the architecture integrates:

- **High-Order Control Barrier Functions (HOCBFs)** — Act as a real-time safety envelope overriding nominal control inputs whenever the state approaches the boundary of the safe set $\mathcal{C}$.
- **Hamilton-Jacobi (HJ) Reachability Analysis** — Formulates collision avoidance as a zero-sum differential game against uncooperative tumbling debris. Computes the Backward Reachable Tube (BRT) via the Isaacs PDE to verify that no collision can occur even under worst-case perturbations.

### 3.4 Radiation-Resilient Heterogeneous Migration

To survive the radiation environment of LEO using commercial-off-the-shelf (COTS) processors:

- **ZES100 Latchup Detection and Protection (LDAP)** prevents catastrophic Single-Event Latchups (SELs) by detecting micro-SEL current transients and power-cycling affected components in microseconds.
- **WebAssembly (Wasm)** workload migration over **quantum-secure (QKD) links** enables seamless state serialization across heterogeneous hardware architectures—no ISA coupling between nodes.

---

## 4. Decision AI Model Comparison

> *Julia 1 vs Laya vs CLM: Which Open-Source Decision AI Model Wins?*

A recent benchmark comparison of the CLM action-scoring model against other open-source decision AI architectures is available as a supplementary video resource. This comparison is useful when defending the CLM model choice to hackathon judges, demonstrating superiority in:

- **Latency** — Sub-16 ms inference vs. multi-second alternatives
- **Memory footprint** — 75 MB quantized cache vs. GB-scale model weights
- **Power envelope** — 5 W FPGA-compatible vs. GPU-dependent architectures
- **Deterministic safety** — Neuro-symbolic + CBF layered verification
