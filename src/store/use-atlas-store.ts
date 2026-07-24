"use client";

import { create } from "zustand";
import { DEFAULT_SCENARIO, MAP_LAYERS } from "@/data/scenario";
import { advanceAgents, calculateMetrics, createAgents, getRecommendations } from "@/simulation/engine";
import type {
  Agent,
  InterventionId,
  MapLayerId,
  Recommendation,
  ScenarioConfig,
  SimulationMetrics,
  SimulationSpeed,
  SimulationStatus,
  TrendPoint,
  ViewId,
} from "@/simulation/types";

let timer: ReturnType<typeof setInterval> | null = null;

const initialLayers = Object.fromEntries(
  MAP_LAYERS.map((layer) => [layer.id, layer.defaultVisible]),
) as Record<MapLayerId, boolean>;

function buildInitial(config: ScenarioConfig) {
  const agents = createAgents(config);
  return {
    minute: 0,
    agents,
    metrics: calculateMetrics(0, agents, [], config),
    recommendations: [] as Recommendation[],
    trend: [] as TrendPoint[],
  };
}

type AtlasStore = {
  hasEntered: boolean;
  activeView: ViewId;
  status: SimulationStatus;
  speed: SimulationSpeed;
  scenario: ScenarioConfig;
  minute: number;
  agents: Agent[];
  metrics: SimulationMetrics;
  interventions: InterventionId[];
  recommendations: Recommendation[];
  trend: TrendPoint[];
  layers: Record<MapLayerId, boolean>;
  enter: () => void;
  setActiveView: (view: ViewId) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: SimulationSpeed) => void;
  applyIntervention: (id: InterventionId) => void;
  updateScenario: (scenario: ScenarioConfig) => void;
  toggleLayer: (id: MapLayerId) => void;
  tick: () => void;
};

const initial = buildInitial(DEFAULT_SCENARIO);

export const useAtlasStore = create<AtlasStore>((set, get) => ({
  hasEntered: false,
  activeView: "overview",
  status: "idle",
  speed: 1,
  scenario: DEFAULT_SCENARIO,
  minute: initial.minute,
  agents: initial.agents,
  metrics: initial.metrics,
  interventions: [],
  recommendations: initial.recommendations,
  trend: initial.trend,
  layers: initialLayers,

  enter: () => set({ hasEntered: true }),
  setActiveView: (activeView) => set({ activeView }),

  start: () => {
    const { status } = get();
    if (status === "running") return;
    set({ status: "running" });
    if (timer) clearInterval(timer);
    timer = setInterval(() => get().tick(), 100);
  },

  pause: () => {
    if (timer) clearInterval(timer);
    timer = null;
    set({ status: "paused" });
  },

  reset: () => {
    if (timer) clearInterval(timer);
    timer = null;
    const { scenario } = get();
    const state = buildInitial(scenario);
    set({
      ...state,
      status: "idle",
      interventions: [],
      speed: 1,
    });
  },

  setSpeed: (speed) => set({ speed }),

  applyIntervention: (id) => {
    const current = get();
    if (current.interventions.includes(id)) return;
    const interventions = [...current.interventions, id];
    const metrics = calculateMetrics(
      current.minute,
      current.agents,
      interventions,
      current.scenario,
    );
    set({
      interventions,
      metrics,
      recommendations: getRecommendations(metrics).filter(
        (recommendation) => !interventions.includes(recommendation.id),
      ),
    });
  },

  updateScenario: (scenario) => {
    if (timer) clearInterval(timer);
    timer = null;
    const state = buildInitial(scenario);
    set({
      scenario,
      ...state,
      status: "idle",
      interventions: [],
      speed: 1,
      activeView: "overview",
    });
  },

  toggleLayer: (id) =>
    set((state: AtlasStore) => ({
      layers: { ...state.layers, [id]: !state.layers[id] },
    })),

  tick: () => {
    const current = get();
    if (current.status !== "running") return;

    const minute = Math.min(
      current.scenario.durationMinutes,
      current.minute + current.speed,
    );
    const agents = advanceAgents(
      current.agents,
      minute,
      current.speed,
      current.interventions,
      current.scenario,
    );
    const metrics = calculateMetrics(
      minute,
      agents,
      current.interventions,
      current.scenario,
    );
    const recommendations = getRecommendations(metrics).filter(
      (recommendation) => !current.interventions.includes(recommendation.id),
    );
    const shouldRecord = minute % 8 === 0 || current.trend.length === 0;
    const trend = shouldRecord
      ? [
          ...current.trend.slice(-40),
          {
            minute,
            crowdDensity: metrics.crowdDensity,
            trafficIndex: metrics.trafficIndex,
            riskScore: metrics.riskScore,
          },
        ]
      : current.trend;

    if (minute >= current.scenario.durationMinutes) {
      if (timer) clearInterval(timer);
      timer = null;
    }

    set({
      minute,
      agents,
      metrics,
      recommendations,
      trend,
      status: minute >= current.scenario.durationMinutes ? "completed" : "running",
    });
  },
}));
