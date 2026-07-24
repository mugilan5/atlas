import type {
  MapLayerId,
  ScenarioConfig,
} from "@/simulation/types";

export const YMCA_RALLY_CENTER: [
  number,
  number,
] = [80.23545, 13.02475];

export const CHEPAUK_STADIUM_CENTER: [
  number,
  number,
] = [80.27942, 13.06276];

/*
 * Kept for compatibility with older imports.
 */
export const RALLY_CENTER =
  YMCA_RALLY_CENTER;

export const YMCA_RALLY_SCENARIO: ScenarioConfig =
  {
    scenarioType: "political-rally",
    location:
      "YMCA Grounds, Nandanam, Chennai",
    expectedCrowd: 30_000,
    startTime: "17:00",
    weather: "Sunny",
    temperature: 31,
    roadClosure: false,
    durationMinutes: 240,
  };

export const CHEPAUK_IPL_SCENARIO: ScenarioConfig =
  {
    scenarioType: "ipl-match",
    location:
      "M. A. Chidambaram Stadium, Chepauk, Chennai",
    expectedCrowd: 38_000,
    startTime: "16:30",
    weather: "Sunny",
    temperature: 30,
    roadClosure: false,
    durationMinutes: 300,
  };

export const DEFAULT_SCENARIO =
  YMCA_RALLY_SCENARIO;

export const SCENARIO_PRESETS: Array<{
  id: ScenarioConfig["scenarioType"];
  name: string;
  shortName: string;
  description: string;
  config: ScenarioConfig;
}> = [
  {
    id: "political-rally",
    name: "YMCA Political Rally",
    shortName: "YMCA Rally",
    description:
      "Political gathering with attendees travelling to the YMCA Grounds.",
    config: YMCA_RALLY_SCENARIO,
  },
  {
    id: "ipl-match",
    name: "Chepauk IPL Match",
    shortName: "IPL Match",
    description:
      "Cricket spectators travelling to M. A. Chidambaram Stadium.",
    config: CHEPAUK_IPL_SCENARIO,
  },
];

/*
 * Internal deterministic routes used by the KPI engine.
 * Visible map movement uses Mapbox Directions geometry.
 */

export const YMCA_ROUTES: Array<
  Array<[number, number]>
> = [
  [
    [80.2101, 13.085],
    [80.218, 13.072],
    [80.226, 13.056],
    [80.235, 13.041],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.243, 13.1184],
    [80.244, 13.093],
    [80.239, 13.068],
    [80.238, 13.045],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.229, 13.0524],
    [80.231, 13.046],
    [80.234, 13.038],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2676, 13.0339],
    [80.258, 13.034],
    [80.248, 13.032],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2565, 13.0067],
    [80.249, 13.014],
    [80.242, 13.022],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2209, 13.0108],
    [80.225, 13.018],
    [80.231, 13.025],
    YMCA_RALLY_CENTER,
  ],
];

export const CHEPAUK_ROUTES: Array<
  Array<[number, number]>
> = [
  [
    [80.2101, 13.085],
    [80.232, 13.082],
    [80.2607, 13.0732],
    [80.2735, 13.0685],
    CHEPAUK_STADIUM_CENTER,
  ],
  [
    [80.243, 13.1184],
    [80.252, 13.096],
    [80.2705, 13.083],
    [80.275, 13.069],
    CHEPAUK_STADIUM_CENTER,
  ],
  [
    [80.2337, 13.0418],
    [80.248, 13.048],
    [80.2642, 13.054],
    [80.274, 13.06],
    CHEPAUK_STADIUM_CENTER,
  ],
  [
    [80.2565, 13.0067],
    [80.2676, 13.0339],
    [80.276, 13.047],
    [80.279, 13.057],
    CHEPAUK_STADIUM_CENTER,
  ],
  [
    [80.2189, 12.9815],
    [80.232, 13.01],
    [80.247, 13.034],
    [80.267, 13.052],
    CHEPAUK_STADIUM_CENTER,
  ],
  [
    [80.294, 13.113],
    [80.288, 13.093],
    [80.282, 13.077],
    [80.279, 13.067],
    CHEPAUK_STADIUM_CENTER,
  ],
];

export const ROUTES = YMCA_ROUTES;

export function getScenarioRoutes(
  scenario: ScenarioConfig,
) {
  return scenario.scenarioType ===
    "ipl-match"
    ? CHEPAUK_ROUTES
    : YMCA_ROUTES;
}

export const MAP_LAYERS: Array<{
  id: MapLayerId;
  label: string;
  defaultVisible: boolean;
}> = [
  {
    id: "crowd-density",
    label: "Crowd Density",
    defaultVisible: true,
  },
  {
    id: "traffic-flow",
    label: "Traffic Flow",
    defaultVisible: true,
  },
  {
    id: "road-congestion",
    label: "Road Congestion",
    defaultVisible: true,
  },
  {
    id: "police-units",
    label: "Police Deployment",
    defaultVisible: true,
  },
  {
    id: "medical-units",
    label: "Medical Units",
    defaultVisible: true,
  },
  {
    id: "public-transport",
    label: "Public Transport",
    defaultVisible: true,
  },
  {
    id: "cctv-cameras",
    label: "CCTV Cameras",
    defaultVisible: false,
  },
];

export const YMCA_INFRASTRUCTURE_ASSETS = [
  {
    id: "police-1",
    type: "Police Unit",
    name: "Nandanam Rally Command Post",
    status: "Suggested",
    quantity: 28,
  },
  {
    id: "medical-1",
    type: "Medical",
    name: "YMCA Emergency Medical Post",
    status: "Suggested",
    quantity: 8,
  },
  {
    id: "transport-1",
    type: "Public Transport",
    name: "Nandanam Transit Corridor",
    status: "Monitoring",
    quantity: 24,
  },
  {
    id: "cctv-1",
    type: "CCTV",
    name: "YMCA Entry Cameras",
    status: "Suggested",
    quantity: 12,
  },
  {
    id: "barrier-1",
    type: "Barricades",
    name: "YMCA Rally Perimeter",
    status: "Suggested",
    quantity: 16,
  },
];

export const CHEPAUK_INFRASTRUCTURE_ASSETS = [
  {
    id: "chepauk-police",
    type: "Police Unit",
    name: "Chepauk Match Command Post",
    status: "Suggested",
    quantity: 42,
  },
  {
    id: "chepauk-medical",
    type: "Medical",
    name: "Stadium Emergency Medical Zone",
    status: "Suggested",
    quantity: 12,
  },
  {
    id: "chepauk-transport",
    type: "Public Transport",
    name: "Chepauk MRTS Arrival Corridor",
    status: "Monitoring",
    quantity: 30,
  },
  {
    id: "chepauk-cctv",
    type: "CCTV",
    name: "Stadium Gate Camera Network",
    status: "Suggested",
    quantity: 18,
  },
  {
    id: "chepauk-barriers",
    type: "Barricades",
    name: "Wallajah Road Match Perimeter",
    status: "Suggested",
    quantity: 26,
  },
];

export const INFRASTRUCTURE_ASSETS =
  YMCA_INFRASTRUCTURE_ASSETS;

export function getInfrastructureAssets(
  scenarioType: ScenarioConfig["scenarioType"],
) {
  return scenarioType === "ipl-match"
    ? CHEPAUK_INFRASTRUCTURE_ASSETS
    : YMCA_INFRASTRUCTURE_ASSETS;
}
