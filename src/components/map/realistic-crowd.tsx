"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  FeatureCollection,
  LineString,
  Point,
  Position,
} from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";
import { useAtlasStore } from "@/store/use-atlas-store";

// The map's baked-in agent/rally counts (420 / 1450) were tuned against
// this reference population. Population changes scale from here.
const BASELINE_POPULATION = 120_000;

type PathKind =
  | "pedestrian"
  | "local-road"
  | "major-road"
  | "service-road";

type NetworkPath = {
  id: string;
  name: string;
  kind: PathKind;
  coordinates: [number, number][];
  weight: number;
};

type NetworkResponse = {
  center?: {
    longitude: number;
    latitude: number;
  };
  paths?: NetworkPath[];
  source?: string;
  pathCount?: number;
  error?: string;
};

type AgentType =
  | "pedestrian"
  | "vehicle"
  | "bus"
  | "emergency";

type MovingAgent = {
  id: number;
  type: AgentType;
  pathIndex: number;
  progress: number;
  direction: 1 | -1;
  speed: number;
  lateralOffset: number;
};

type RallyAgent = {
  id: number;
  radius: number;
  angle: number;
  angularSpeed: number;
  radialMotion: number;
  phase: number;
  densityBand: "low" | "medium" | "high" | "very-high";
};

type CrowdFeatureProperties = {
  id: number;
  type: string;
  color: string;
  intensity: number;
};

type RoadFeatureProperties = {
  id: string;
  kind: PathKind;
};

const RALLY_CENTER: [number, number] = [
  80.28215,
  13.05065,
];

// Marina's shoreline runs roughly north-south here. Anything east of
// this longitude is open water, so crowd dots are clamped to stay on
// the beach/promenade side instead of drifting out to sea.
const MAX_LAND_LONGITUDE = 80.286;

const FALLBACK_PATHS: NetworkPath[] = [
  {
    id: "fallback-kamarajar-salai",
    name: "Kamarajar Salai",
    kind: "major-road",
    weight: 1.6,
    coordinates: [
      [80.28525, 13.0790],
      [80.28480, 13.0725],
      [80.28430, 13.0660],
      [80.28390, 13.0595],
      [80.28355, 13.0530],
      [80.28345, 13.0470],
      [80.28360, 13.0405],
      [80.28335, 13.0340],
      [80.28280, 13.0275],
      [80.28195, 13.0208],
    ],
  },
  {
    id: "fallback-wallajah-road",
    name: "Wallajah Road",
    kind: "major-road",
    weight: 1.4,
    coordinates: [
      [80.2712, 13.0696],
      [80.2740, 13.0674],
      [80.2768, 13.0654],
      [80.2795, 13.0631],
      [80.2826, 13.0606],
      [80.2840, 13.0590],
    ],
  },
  {
    id: "fallback-bharathi-salai",
    name: "Bharathi Salai",
    kind: "local-road",
    weight: 1.1,
    coordinates: [
      [80.2732, 13.0601],
      [80.2754, 13.0581],
      [80.2774, 13.0560],
      [80.2792, 13.0539],
      [80.2810, 13.0518],
      [80.2833, 13.0494],
    ],
  },
  {
    id: "fallback-marina-promenade",
    name: "Marina Promenade",
    kind: "pedestrian",
    weight: 2,
    coordinates: [
      [80.2865, 13.0635],
      [80.2860, 13.0595],
      [80.2856, 13.0560],
      [80.2852, 13.0524],
      [80.2850, 13.0488],
      [80.2850, 13.0452],
      [80.2849, 13.0415],
      [80.2846, 13.0378],
    ],
  },
  {
    id: "fallback-triplicane-street",
    name: "Triplicane Connector",
    kind: "local-road",
    weight: 1,
    coordinates: [
      [80.2715, 13.0580],
      [80.2740, 13.0567],
      [80.2763, 13.0552],
      [80.2786, 13.0537],
      [80.2808, 13.0520],
      [80.2828, 13.0502],
    ],
  },
];

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function weightedPathIndex(
  paths: NetworkPath[],
  type: AgentType,
) {
  const eligible = paths
    .map((path, index) => ({
      path,
      index,
    }))
    .filter(({ path }) => {
      if (type === "pedestrian") {
        return (
          path.kind === "pedestrian" ||
          path.kind === "service-road" ||
          path.kind === "local-road"
        );
      }

      return path.kind !== "pedestrian";
    });

  const candidates =
    eligible.length > 0
      ? eligible
      : paths.map((path, index) => ({
          path,
          index,
        }));

  const totalWeight = candidates.reduce(
    (total, item) => total + item.path.weight,
    0,
  );

  let target = Math.random() * totalWeight;

  for (const candidate of candidates) {
    target -= candidate.path.weight;

    if (target <= 0) {
      return candidate.index;
    }
  }

  return candidates[candidates.length - 1]?.index ?? 0;
}

function getAgentType(index: number): AgentType {
  const value = (index * 0.61803398875) % 1;

  if (value < 0.60) {
    return "pedestrian";
  }

  if (value < 0.88) {
    return "vehicle";
  }

  if (value < 0.97) {
    return "bus";
  }

  return "emergency";
}

function createMovingAgents(
  paths: NetworkPath[],
  count: number,
): MovingAgent[] {
  return Array.from({ length: count }, (_, index) => {
    const type = getAgentType(index);

    const baseSpeed =
      type === "pedestrian"
        ? randomBetween(0.00010, 0.00022)
        : type === "vehicle"
          ? randomBetween(0.00028, 0.00058)
          : type === "bus"
            ? randomBetween(0.00020, 0.00040)
            : randomBetween(0.00040, 0.00070);

    return {
      id: index,
      type,
      pathIndex: weightedPathIndex(paths, type),
      progress: Math.random(),
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: baseSpeed,
      lateralOffset:
        type === "pedestrian"
          ? randomBetween(-0.000018, 0.000018)
          : randomBetween(-0.000026, 0.000026),
    };
  });
}

function densityBandFromRadius(
  radius: number,
): RallyAgent["densityBand"] {
  if (radius < 0.0013) {
    return "very-high";
  }

  if (radius < 0.0026) {
    return "high";
  }

  if (radius < 0.0042) {
    return "medium";
  }

  return "low";
}

function createRallyAgents(count: number): RallyAgent[] {
  return Array.from({ length: count }, (_, index) => {
    /*
     * Square-root distribution creates more realistic area filling.
     * The additional exponent concentrates more people near the stage.
     */
    const normalizedRadius = Math.pow(Math.random(), 1.75);

    const radius =
      0.00022 + normalizedRadius * 0.0054;

    return {
      id: index,
      radius,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: randomBetween(-0.00009, 0.00009),
      radialMotion: randomBetween(0.000008, 0.000035),
      phase: Math.random() * Math.PI * 2,
      densityBand: densityBandFromRadius(radius),
    };
  });
}

function calculatePathLengths(
  coordinates: Position[],
): {
  segmentLengths: number[];
  totalLength: number;
} {
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (
    let index = 0;
    index < coordinates.length - 1;
    index += 1
  ) {
    const start = coordinates[index];
    const end = coordinates[index + 1];

    const longitudeScale = Math.cos(
      ((start[1] + end[1]) / 2) *
        (Math.PI / 180),
    );

    const deltaLongitude =
      (end[0] - start[0]) * longitudeScale;

    const deltaLatitude = end[1] - start[1];

    const length = Math.sqrt(
      deltaLongitude * deltaLongitude +
        deltaLatitude * deltaLatitude,
    );

    segmentLengths.push(length);
    totalLength += length;
  }

  return {
    segmentLengths,
    totalLength,
  };
}

function interpolatePath(
  coordinates: Position[],
  progress: number,
  lateralOffset: number,
): [number, number] {
  if (coordinates.length < 2) {
    return [
      coordinates[0]?.[0] ?? RALLY_CENTER[0],
      coordinates[0]?.[1] ?? RALLY_CENTER[1],
    ];
  }

  const { segmentLengths, totalLength } =
    calculatePathLengths(coordinates);

  const targetDistance =
    Math.max(0, Math.min(1, progress)) * totalLength;

  let travelled = 0;

  for (
    let index = 0;
    index < segmentLengths.length;
    index += 1
  ) {
    const segmentLength = segmentLengths[index];

    if (
      travelled + segmentLength >= targetDistance ||
      index === segmentLengths.length - 1
    ) {
      const start = coordinates[index];
      const end = coordinates[index + 1];

      const localProgress =
        segmentLength === 0
          ? 0
          : (targetDistance - travelled) /
            segmentLength;

      const longitude =
        start[0] +
        (end[0] - start[0]) * localProgress;

      const latitude =
        start[1] +
        (end[1] - start[1]) * localProgress;

      const deltaLongitude = end[0] - start[0];
      const deltaLatitude = end[1] - start[1];

      const magnitude =
        Math.sqrt(
          deltaLongitude * deltaLongitude +
            deltaLatitude * deltaLatitude,
        ) || 1;

      const perpendicularLongitude =
        -deltaLatitude / magnitude;

      const perpendicularLatitude =
        deltaLongitude / magnitude;

      return [
        longitude +
          perpendicularLongitude * lateralOffset,
        latitude +
          perpendicularLatitude * lateralOffset,
      ];
    }

    travelled += segmentLength;
  }

  const finalPoint =
    coordinates[coordinates.length - 1];

  return [finalPoint[0], finalPoint[1]];
}

function getRoadAgentColor(type: AgentType) {
  switch (type) {
    case "pedestrian":
      return "#36d27f";
    case "vehicle":
      return "#f5a623";
    case "bus":
      return "#3188ff";
    case "emergency":
      return "#ff3b3b";
  }
}

function getRallyColor(
  densityBand: RallyAgent["densityBand"],
) {
  switch (densityBand) {
    case "very-high":
      return "#ef2b2d";
    case "high":
      return "#f78419";
    case "medium":
      return "#35bf70";
    case "low":
      return "#287de5";
  }
}

export function RealisticCrowd() {
  const [paths, setPaths] =
    useState<NetworkPath[]>(FALLBACK_PATHS);

  const [networkSource, setNetworkSource] =
    useState<"loading" | "OpenStreetMap" | "fallback">(
      "loading",
    );

  const movingAgentsRef = useRef<MovingAgent[]>([]);
  const rallyAgentsRef = useRef<RallyAgent[]>([]);

  const expectedCrowd = useAtlasStore((state) => state.scenario.expectedCrowd);
  const populationScale = Math.min(
    2.4,
    Math.max(0.35, expectedCrowd / BASELINE_POPULATION),
  );

  const status = useAtlasStore((state) => state.status);
  const speed = useAtlasStore((state) => state.speed);

  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNetwork() {
      try {
        const response = await fetch(
          "/api/marina-network",
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Network request failed: ${response.status}`,
          );
        }

        const payload =
          (await response.json()) as NetworkResponse;

        if (
          !payload.paths ||
          payload.paths.length < 10
        ) {
          throw new Error(
            payload.error ??
              "Not enough OSM road geometry returned",
          );
        }

        setPaths(payload.paths);
        setNetworkSource("OpenStreetMap");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.warn(
          "Using fallback Chennai network:",
          error,
        );

        setPaths(FALLBACK_PATHS);
        setNetworkSource("fallback");
      }
    }

    fetchNetwork();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    movingAgentsRef.current = createMovingAgents(
      paths,
      Math.round(420 * populationScale),
    );

    rallyAgentsRef.current = createRallyAgents(
      Math.round(1450 * populationScale),
    );
  }, [paths, populationScale]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const interval = setInterval(() => {
      const step = 7 * speed;

      movingAgentsRef.current = movingAgentsRef.current.map((agent) => {
        let nextProgress = agent.progress + agent.speed * agent.direction * step;
        let nextDirection = agent.direction;

        if (nextProgress >= 1) {
          nextProgress = 1;
          nextDirection = -1;
        } else if (nextProgress <= 0) {
          nextProgress = 0;
          nextDirection = 1;
        }

        return {
          ...agent,
          progress: nextProgress,
          direction: nextDirection,
        };
      });

      rallyAgentsRef.current = rallyAgentsRef.current.map((agent) => ({
        ...agent,
        angle: agent.angle + agent.angularSpeed * step,
        phase: agent.phase + 0.05 * speed,
      }));

      setFrame((value) => value + 1);
    }, 180);

    return () => clearInterval(interval);
  }, [status, speed]);


  const roadNetworkGeoJson = useMemo<
    FeatureCollection<
      LineString,
      RoadFeatureProperties
    >
  >(
    () => ({
      type: "FeatureCollection",
      features: paths.map((path) => ({
        type: "Feature",
        properties: {
          id: path.id,
          kind: path.kind,
        },
        geometry: {
          type: "LineString",
          coordinates: path.coordinates,
        },
      })),
    }),
    [paths],
  );

  const movingCrowdGeoJson = useMemo<
    FeatureCollection<
      Point,
      CrowdFeatureProperties
    >
  >(
    () => ({
      type: "FeatureCollection",
      features: movingAgentsRef.current.map(
        (agent) => {
          const path =
            paths[agent.pathIndex % paths.length] ??
            paths[0];

          const [rawLongitude, latitude] =
            interpolatePath(
              path.coordinates,
              agent.progress,
              agent.lateralOffset,
            );

          const longitude = Math.min(
            rawLongitude,
            MAX_LAND_LONGITUDE,
          );

          return {
            type: "Feature",
            properties: {
              id: agent.id,
              type: agent.type,
              color: getRoadAgentColor(agent.type),
              intensity:
                agent.type === "emergency" ? 1 : 0.7,
            },
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          };
        },
      ),
    }),
    [frame, paths],
  );

  const rallyCrowdGeoJson = useMemo<
    FeatureCollection<
      Point,
      CrowdFeatureProperties
    >
  >(
    () => ({
      type: "FeatureCollection",
      features: rallyAgentsRef.current.map(
        (agent) => {
          /*
           * Elliptical layout follows the shape of the Marina grounds.
           * Latitude is compressed relative to longitude for the site.
           */
          const breathing =
            Math.sin(agent.phase) *
            agent.radialMotion;

          const radius =
            agent.radius + breathing;

          const rawLongitude =
            RALLY_CENTER[0] +
            Math.cos(agent.angle) * radius * 0.78;

          const longitude = Math.min(
            rawLongitude,
            MAX_LAND_LONGITUDE,
          );

          const latitude =
            RALLY_CENTER[1] +
            Math.sin(agent.angle) * radius * 0.48;

          const intensity =
            agent.densityBand === "very-high"
              ? 1
              : agent.densityBand === "high"
                ? 0.82
                : agent.densityBand === "medium"
                  ? 0.58
                  : 0.35;

          return {
            type: "Feature",
            properties: {
              id: 10000 + agent.id,
              type: agent.densityBand,
              color: getRallyColor(
                agent.densityBand,
              ),
              intensity,
            },
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          };
        },
      ),
    }),
    [frame],
  );

  return (
    <>
      <Source
        id="atlas-real-road-network"
        type="geojson"
        data={roadNetworkGeoJson}
      >
        <Layer
          id="atlas-real-road-network-lines"
          type="line"
          filter={[
            "!=",
            ["get", "kind"],
            "pedestrian",
          ]}
          paint={{
            "line-color": [
              "match",
              ["get", "kind"],
              "major-road",
              "#ff5a36",
              "service-road",
              "#6b7580",
              "#25935d",
            ],
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              0.35,
              15,
              1.35,
            ],
            "line-opacity": 0.28,
          }}
        />

        <Layer
          id="atlas-real-pedestrian-paths"
          type="line"
          filter={[
            "==",
            ["get", "kind"],
            "pedestrian",
          ]}
          paint={{
            "line-color": "#47d58a",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              0.3,
              16,
              1,
            ],
            "line-opacity": 0.18,
            "line-dasharray": [2, 2],
          }}
        />
      </Source>

      <Source
        id="atlas-rally-crowd"
        type="geojson"
        data={rallyCrowdGeoJson}
      >

        <Layer
          id="atlas-rally-individual-people"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              1.2,
              14,
              2.6,
              16,
              4.5,
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              0.55,
              14,
              0.75,
              16,
              0.9,
            ],
            "circle-stroke-width": 0,
          }}
        />
      </Source>

      <Source
        id="atlas-moving-road-users"
        type="geojson"
        data={movingCrowdGeoJson}
      >
        <Layer
          id="atlas-moving-road-user-glow"
          type="circle"
          paint={{
            "circle-radius": [
              "match",
              ["get", "type"],
              "emergency",
              8,
              "bus",
              6,
              "vehicle",
              5,
              3.5,
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.19,
            "circle-blur": 0.8,
          }}
        />

        <Layer
          id="atlas-moving-road-users-points"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11,
              [
                "match",
                ["get", "type"],
                "emergency",
                3.5,
                "bus",
                3,
                "vehicle",
                2.4,
                1.6,
              ],
              16,
              [
                "match",
                ["get", "type"],
                "emergency",
                6,
                "bus",
                5,
                "vehicle",
                4,
                2.8,
              ],
            ],
            "circle-color": ["get", "color"],
            "circle-stroke-color": "#071018",
            "circle-stroke-width": 0.45,
            "circle-opacity": 0.94,
          }}
        />
      </Source>

      <div className="atlas-network-status">
        <span
          className={
            networkSource === "OpenStreetMap"
              ? "atlas-network-dot live"
              : "atlas-network-dot"
          }
        />

        {networkSource === "loading"
          ? "Loading Chennai streets"
          : networkSource === "OpenStreetMap"
            ? `${paths.length} real OSM paths`
            : "Using offline map paths"}
      </div>
    </>
  );
}
