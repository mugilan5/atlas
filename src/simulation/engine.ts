import { DEFAULT_SCENARIO, ROUTES } from "@/data/scenario";
import type {
  Agent,
  InterventionId,
  Recommendation,
  ScenarioConfig,
  SimulationMetrics,
  TransportMode,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function seeded(index: number, seed = 24072026) {
  const value = Math.sin(index * 999.91 + seed * 0.001) * 10000;
  return value - Math.floor(value);
}

function interpolateRoute(route: Array<[number, number]>, progress: number): [number, number] {
  const clamped = clamp(progress, 0, 1);
  const segmentFloat = clamped * (route.length - 1);
  const segment = Math.min(route.length - 2, Math.floor(segmentFloat));
  const localProgress = segmentFloat - segment;
  const from = route[segment];
  const to = route[segment + 1];
  return [
    from[0] + (to[0] - from[0]) * localProgress,
    from[1] + (to[1] - from[1]) * localProgress,
  ];
}

function transportMode(index: number): TransportMode {
  const value = seeded(index + 300);

  // Rally attendees use public transport or walk.
  if (value < 0.55) return "bus";
  if (value < 0.82) return "metro";
  return "walk";
}

export function createAgents(config: ScenarioConfig = DEFAULT_SCENARIO, count = 1000): Agent[] {
  const weight = config.expectedCrowd / count;
  return Array.from({ length: count }, (_, index) => {
    const routeId = index % ROUTES.length;
    const progress = seeded(index + 10) * 0.035;
    return {
      id: index,
      routeId,
      progress,
      departureMinute: Math.floor(seeded(index + 20) * 115),
      speed: 0.006 + seeded(index + 30) * 0.0045,
      weight,
      transportMode: transportMode(index),
      coordinate: interpolateRoute(ROUTES[routeId], progress),
      status: "waiting",
    };
  });
}

export function advanceAgents(
  agents: Agent[],
  minute: number,
  speedMultiplier: number,
  interventions: InterventionId[],
  config: ScenarioConfig,
): Agent[] {
  const alternateRoad = interventions.includes("open-alternate-road");
  const gateOpen = interventions.includes("open-gate");
  const busesAdded = interventions.includes("add-shuttle-buses");

  return agents.map((agent) => {
    if (agent.status === "arrived") return agent;
    if (minute < agent.departureMinute) return agent;

    let movement = agent.speed * speedMultiplier;
    const blockedRoute = config.roadClosure && (agent.routeId === 0 || agent.routeId === 1);
    let status: Agent["status"] = "moving";

    if (blockedRoute && !alternateRoad && agent.progress > 0.42 && agent.progress < 0.73) {
      movement *= 0.4;
      status = "rerouting";
    }

    if (alternateRoad && blockedRoute) movement *= 1.24;
    if (gateOpen && agent.progress > 0.78) movement *= 1.28;
    if (busesAdded && agent.transportMode === "bus") movement *= 1.13;

    const progress = clamp(agent.progress + movement, 0, 1);
    return {
      ...agent,
      progress,
      coordinate: interpolateRoute(ROUTES[agent.routeId], progress),
      status: progress >= 1 ? "arrived" : status,
    };
  });
}

const BASELINE_POPULATION = 30_000;

export function calculateMetrics(
  minute: number,
  agents: Agent[],
  interventions: InterventionId[],
  config: ScenarioConfig,
): SimulationMetrics {
  const phase = clamp(minute / Math.max(1, config.durationMinutes), 0, 1);
  const arrivedPeople = agents
    .filter((agent) => agent.status === "arrived" || agent.progress > 0.82)
    .reduce((sum, agent) => sum + agent.weight, 0);
  const activePrivateVehicles = agents.filter(
    (agent) =>
      (agent.transportMode === "car" || agent.transportMode === "auto") &&
      agent.status !== "waiting" &&
      agent.status !== "arrived",
  ).length;

  const has = (id: InterventionId) => interventions.includes(id);
  const crowdRatio = clamp(arrivedPeople / Math.max(1, config.expectedCrowd), 0, 1);
  // Larger or smaller expected populations should meaningfully move crowd
  // and traffic stress up or down, not just the arrival ratio.
  const populationFactor = clamp(config.expectedCrowd / BASELINE_POPULATION, 0.4, 2.6);

  let crowdDensity = (1.4 + crowdRatio * 8.2 + phase * 0.8) * populationFactor;
  let trafficIndex =
    32 + phase * 38 + activePrivateVehicles * 0.12 + (config.roadClosure ? 17 : 0) + (populationFactor - 1) * 22;
  let publicTransportLoad = (68 + phase * 66) * (0.75 + populationFactor * 0.25);
  let emergencyAccessMinutes = 6 + trafficIndex * 0.095 + (config.roadClosure ? 5 : 0);
  let pollutionScore = 54 + trafficIndex * 0.62 + activePrivateVehicles * 0.045;

  if (has("add-police")) crowdDensity *= 0.91;
  if (has("open-gate")) crowdDensity *= 0.73;
  if (has("add-shuttle-buses")) {
    publicTransportLoad *= 0.77;
    trafficIndex *= 0.87;
    pollutionScore *= 0.91;
  }
  if (has("open-alternate-road")) {
    trafficIndex *= 0.66;
    emergencyAccessMinutes *= 0.55;
    pollutionScore *= 0.86;
  }

  crowdDensity = clamp(crowdDensity, 0.8, 10.5);
  trafficIndex = clamp(trafficIndex, 0, 100);
  publicTransportLoad = clamp(publicTransportLoad, 40, 160);
  emergencyAccessMinutes = clamp(emergencyAccessMinutes, 4, 38);
  pollutionScore = clamp(pollutionScore, 35, 180);

  let riskScore =
    crowdDensity * 4.9 +
    trafficIndex * 0.24 +
    Math.max(0, publicTransportLoad - 70) * 0.2 +
    emergencyAccessMinutes * 1.25 +
    pollutionScore * 0.075;

  if (has("add-police")) riskScore -= 9;
  if (has("open-gate")) riskScore -= 5;

  return {
    crowdDensity,
    maxCrowdDensity: crowdDensity * (1550 + crowdRatio * 300),
    trafficIndex,
    publicTransportLoad,
    emergencyAccessMinutes,
    pollutionScore,
    riskScore: clamp(riskScore, 0, 100),
    governmentRevenueCr: 2.1 + phase * 6.3,
  };
}

export function getRecommendations(metrics: SimulationMetrics): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (metrics.emergencyAccessMinutes > 10) {
    recommendations.push({
      id: "open-alternate-road",
      title: "Open alternate emergency corridor",
      rationale: `Emergency access is estimated at ${metrics.emergencyAccessMinutes.toFixed(0)} minutes.`,
      priority: "critical",
      expectedImpact: "Reduce emergency travel time by roughly 40–50%.",
    });
  }
  if (metrics.publicTransportLoad > 108) {
    recommendations.push({
      id: "add-shuttle-buses",
      title: "Deploy temporary shuttle buses",
      rationale: `Public transport is operating at ${metrics.publicTransportLoad.toFixed(0)}% capacity.`,
      priority: "high",
      expectedImpact: "Reduce overload and private-vehicle demand.",
    });
  }
  if (metrics.crowdDensity > 5.5) {
    recommendations.push({
      id: "open-gate",
      title: "Open two additional access gates",
      rationale: `Crowd density is ${metrics.crowdDensity.toFixed(1)} people/m².`,
      priority: "critical",
      expectedImpact: "Distribute crowd inflow and reduce concentration.",
    });
  }
  if (metrics.riskScore > 62) {
    recommendations.push({
      id: "add-police",
      title: "Deploy additional crowd-control units",
      rationale: `Overall simulated risk is ${metrics.riskScore.toFixed(0)}/100.`,
      priority: "high",
      expectedImpact: "Improve pedestrian flow and incident response.",
    });
  }

  return recommendations;
}
