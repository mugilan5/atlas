export type ViewId = "overview" | "simulations" | "assets" | "intelligence" | "reports";

export type SimulationStatus = "idle" | "running" | "paused" | "completed";
export type SimulationSpeed = 1 | 2 | 4;
export type TransportMode = "metro" | "bus" | "car" | "auto" | "walk";

export type InterventionId =
  | "add-police"
  | "open-gate"
  | "add-shuttle-buses"
  | "open-alternate-road";

export type MapLayerId =
  | "crowd-density"
  | "traffic-flow"
  | "road-congestion"
  | "police-units"
  | "medical-units"
  | "public-transport"
  | "cctv-cameras";

export type ScenarioConfig = {
  scenarioType: "political-rally";
  location: string;
  expectedCrowd: number;
  startTime: string;
  weather: "Sunny" | "Cloudy" | "Rain";
  temperature: number;
  roadClosure: boolean;
  durationMinutes: number;
};

export type SimulationMetrics = {
  crowdDensity: number;
  maxCrowdDensity: number;
  trafficIndex: number;
  publicTransportLoad: number;
  emergencyAccessMinutes: number;
  pollutionScore: number;
  riskScore: number;
  governmentRevenueCr: number;
};

export type Agent = {
  id: number;
  routeId: number;
  progress: number;
  departureMinute: number;
  speed: number;
  weight: number;
  transportMode: TransportMode;
  coordinate: [number, number];
  status: "waiting" | "moving" | "arrived" | "rerouting";
};

export type TrendPoint = {
  minute: number;
  crowdDensity: number;
  trafficIndex: number;
  riskScore: number;
};

export type Recommendation = {
  id: InterventionId;
  title: string;
  rationale: string;
  priority: "critical" | "high" | "medium";
  expectedImpact: string;
};
