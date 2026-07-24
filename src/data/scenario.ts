import type { MapLayerId, ScenarioConfig } from "@/simulation/types";

export const DEFAULT_SCENARIO: ScenarioConfig = {
  scenarioType: "political-rally",
  location: "Anna Salai to Marina Beach, Chennai",
  expectedCrowd: 120_000,
  startTime: "17:00",
  weather: "Sunny",
  temperature: 32,
  roadClosure: true,
  durationMinutes: 240,
};

export const RALLY_CENTER: [number, number] = [80.2849, 13.0505];

export const ROUTES: Array<Array<[number, number]>> = [
  [
    [80.2737, 13.0827],
    [80.275, 13.073],
    [80.278, 13.063],
    [80.281, 13.055],
    RALLY_CENTER,
  ],
  [
    [80.2603, 13.0732],
    [80.265, 13.067],
    [80.272, 13.061],
    [80.279, 13.054],
    RALLY_CENTER,
  ],
  [
    [80.247, 13.042],
    [80.258, 13.045],
    [80.269, 13.047],
    [80.278, 13.05],
    RALLY_CENTER,
  ],
  [
    [80.257, 13.006],
    [80.263, 13.018],
    [80.27, 13.03],
    [80.279, 13.043],
    RALLY_CENTER,
  ],
  [
    [80.259, 12.986],
    [80.266, 13.002],
    [80.272, 13.019],
    [80.279, 13.038],
    RALLY_CENTER,
  ],
];

export const MAP_LAYERS: Array<{ id: MapLayerId; label: string; defaultVisible: boolean }> = [
  { id: "crowd-density", label: "Crowd Density", defaultVisible: true },
  { id: "traffic-flow", label: "Traffic Flow", defaultVisible: true },
  { id: "road-congestion", label: "Road Congestion", defaultVisible: true },
  { id: "police-units", label: "Police Deployment", defaultVisible: true },
  { id: "medical-units", label: "Medical Units", defaultVisible: true },
  { id: "public-transport", label: "Public Transport", defaultVisible: true },
  { id: "cctv-cameras", label: "CCTV Cameras", defaultVisible: false },
];

export const INFRASTRUCTURE_ASSETS = [
  { id: "police-1", type: "Police Unit", name: "Marina Command Post", status: "Active", quantity: 56 },
  { id: "medical-1", type: "Medical", name: "Government General Hospital", status: "Active", quantity: 14 },
  { id: "transport-1", type: "Public Transport", name: "Government Estate Metro", status: "Over Capacity", quantity: 32 },
  { id: "cctv-1", type: "CCTV", name: "Beach Corridor Cameras", status: "Active", quantity: 18 },
  { id: "barrier-1", type: "Barricades", name: "Rally Perimeter", status: "Suggested", quantity: 18 },
];
