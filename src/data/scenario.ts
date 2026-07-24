import type {
  MapLayerId,
  ScenarioConfig,
} from "@/simulation/types";

export const YMCA_RALLY_CENTER: [
  number,
  number,
] = [80.23545, 13.02475];

/* Kept for compatibility with existing simulation imports. */
export const RALLY_CENTER = YMCA_RALLY_CENTER;

export const DEFAULT_SCENARIO: ScenarioConfig = {
  scenarioType: "political-rally",
  location: "YMCA Grounds, Nandanam, Chennai",
  expectedCrowd: 30_000,
  startTime: "17:00",
  weather: "Sunny",
  temperature: 31,
  roadClosure: false,
  durationMinutes: 240,
};

/*
 * Internal metric-engine routes.
 * Visible map movement uses live Mapbox road geometry instead.
 */
export const ROUTES: Array<
  Array<[number, number]>
> = [
  [
    [80.2101, 13.0850],
    [80.2180, 13.0720],
    [80.2260, 13.0560],
    [80.2350, 13.0410],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2430, 13.1184],
    [80.2440, 13.0930],
    [80.2390, 13.0680],
    [80.2380, 13.0450],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2290, 13.0524],
    [80.2310, 13.0460],
    [80.2340, 13.0380],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2676, 13.0339],
    [80.2580, 13.0340],
    [80.2480, 13.0320],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2565, 13.0067],
    [80.2490, 13.0140],
    [80.2420, 13.0220],
    YMCA_RALLY_CENTER,
  ],
  [
    [80.2209, 13.0108],
    [80.2250, 13.0180],
    [80.2310, 13.0250],
    YMCA_RALLY_CENTER,
  ],
];

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

export const INFRASTRUCTURE_ASSETS = [
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
