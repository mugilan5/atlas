"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Feature,
  FeatureCollection,
  Point,
  Polygon,
} from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";

import { YMCA_RALLY_CENTER } from "@/data/scenario";
import { useAtlasStore } from "@/store/use-atlas-store";

type TravelMode = "bus" | "walk";

type ResidentialArea = {
  name: string;
  coordinate: [number, number];
  spread: number;
  routeCount: number;
};

type RouteRequest = {
  id: string;
  area: string;
  mode: TravelMode;
  origin: [number, number];
};

type SimulationRoute = {
  id: string;
  area: string;
  mode: TravelMode;
  coordinates: Array<[number, number]>;
  durationMinutes: number;
};

type VisualAgent = {
  id: number;
  routeIndex: number;
  mode: TravelMode;
  departureMinute: number;
  travelMinutes: number;
  startProgress: number;
  startPosition: [number, number];
  groundPosition: [number, number];
  weight: number;
};

type AgentProperties = {
  id: number;
  mode: TravelMode;
  state: "waiting" | "moving" | "arrived";
  people: number;
};

type MapboxDirectionsResponse = {
  code?: string;
  message?: string;
  routes?: Array<{
    duration?: number;
    geometry?: {
      coordinates?: number[][];
    };
  }>;
};

const ROUTE_CACHE_KEY = "atlas-ymca-ground-routes-v7";

/*
 * Conservative open-field polygon inside the large western YMCA ground.
 * The eastern college buildings, synthetic pitch and road are excluded.
 */
const YMCA_EVENT_GROUND_CENTER: [number, number] = [
  80.23545,
  13.02475,
];

/*
 * Conservative inner area of the large open YMCA field.
 * This deliberately stays away from surrounding buildings,
 * cricket nets and internal roads.
 */
const GROUND_LONGITUDE_RADIUS = 0.00072;
const GROUND_LATITUDE_RADIUS = 0.00118;

/*
 * Polygon used for the visible ground outline.
 * Generated from the same ellipse used to place arrived people.
 */
const YMCA_OPEN_GROUND: Array<[number, number]> =
  Array.from({ length: 36 }, (_, index) => {
    const angle =
      (index / 36) * Math.PI * 2;

    return [
      YMCA_EVENT_GROUND_CENTER[0] +
        Math.cos(angle) *
          GROUND_LONGITUDE_RADIUS,
      YMCA_EVENT_GROUND_CENTER[1] +
        Math.sin(angle) *
          GROUND_LATITUDE_RADIUS,
    ];
  });

/*
 * People enter from the eastern side of the open ground.
 */
const YMCA_GROUND_GATE: [number, number] = [
  80.23622,
  13.02478,
];

/*
 * Public transport passengers leave the bus near Anna Salai/Nandanam
 * and walk the final section to the ground.
 */
const NANDANAM_DROP_OFF: [number, number] = [
  80.23789,
  13.02984,
];

/*
 * Synthetic neighbourhood centres.
 * These are not real homes or personal locations.
 *
 * Nearby neighbourhoods intentionally receive more routes so that
 * some people begin close to the venue, while others come from across
 * Chennai.
 */
const RESIDENTIAL_AREAS: ResidentialArea[] = [
  {
    name: "Nandanam",
    coordinate: [80.2400, 13.0288],
    spread: 0.009,
    routeCount: 10,
  },
  {
    name: "Saidapet",
    coordinate: [80.2283, 13.0237],
    spread: 0.012,
    routeCount: 10,
  },
  {
    name: "T Nagar",
    coordinate: [80.2337, 13.0418],
    spread: 0.011,
    routeCount: 8,
  },
  {
    name: "CIT Nagar",
    coordinate: [80.2350, 13.0350],
    spread: 0.009,
    routeCount: 8,
  },
  {
    name: "West Mambalam",
    coordinate: [80.2250, 13.0382],
    spread: 0.011,
    routeCount: 6,
  },
  {
    name: "Kotturpuram",
    coordinate: [80.2420, 13.0180],
    spread: 0.011,
    routeCount: 6,
  },
  {
    name: "Guindy",
    coordinate: [80.2209, 13.0108],
    spread: 0.012,
    routeCount: 6,
  },
  {
    name: "Mylapore",
    coordinate: [80.2676, 13.0339],
    spread: 0.012,
    routeCount: 6,
  },
  {
    name: "Adyar",
    coordinate: [80.2565, 13.0067],
    spread: 0.013,
    routeCount: 6,
  },
  {
    name: "Velachery",
    coordinate: [80.2189, 12.9815],
    spread: 0.015,
    routeCount: 6,
  },
  {
    name: "Kodambakkam",
    coordinate: [80.2290, 13.0524],
    spread: 0.012,
    routeCount: 6,
  },
  {
    name: "Vadapalani",
    coordinate: [80.2120, 13.0510],
    spread: 0.013,
    routeCount: 5,
  },
  {
    name: "Anna Nagar",
    coordinate: [80.2101, 13.0850],
    spread: 0.016,
    routeCount: 5,
  },
  {
    name: "Perambur",
    coordinate: [80.2430, 13.1184],
    spread: 0.015,
    routeCount: 4,
  },
  {
    name: "Kolathur",
    coordinate: [80.2140, 13.1240],
    spread: 0.016,
    routeCount: 4,
  },
  {
    name: "Ambattur",
    coordinate: [80.1540, 13.1140],
    spread: 0.018,
    routeCount: 4,
  },
  {
    name: "Porur",
    coordinate: [80.1570, 13.0350],
    spread: 0.017,
    routeCount: 4,
  },
  {
    name: "Royapuram",
    coordinate: [80.2940, 13.1130],
    spread: 0.014,
    routeCount: 3,
  },
  {
    name: "Thiruvanmiyur",
    coordinate: [80.2595, 12.9850],
    spread: 0.015,
    routeCount: 4,
  },
  {
    name: "Pallikaranai",
    coordinate: [80.2090, 12.9390],
    spread: 0.018,
    routeCount: 3,
  },
];

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(maximum, Math.max(minimum, value));
}

function seeded(index: number, salt = 1) {
  const value =
    Math.sin(
      index * 12.9898 +
        salt * 78.233,
    ) * 43758.5453;

  return value - Math.floor(value);
}

function distanceKm(
  from: [number, number],
  to: [number, number],
) {
  const latitude =
    ((from[1] + to[1]) / 2) *
    (Math.PI / 180);

  const longitudeDifference =
    (to[0] - from[0]) *
    111.32 *
    Math.cos(latitude);

  const latitudeDifference =
    (to[1] - from[1]) * 111.32;

  return Math.sqrt(
    longitudeDifference * longitudeDifference +
      latitudeDifference * latitudeDifference,
  );
}

const ROUTE_REQUESTS: RouteRequest[] =
  RESIDENTIAL_AREAS.flatMap(
    (area, areaIndex) =>
      Array.from(
        { length: area.routeCount },
        (_, routeIndex) => {
          const uniqueIndex =
            areaIndex * 100 + routeIndex;

          const angle =
            seeded(uniqueIndex, 10) *
            Math.PI *
            2;

          const radius =
            Math.sqrt(
              seeded(uniqueIndex, 11),
            ) *
            area.spread *
            0.5;

          const origin: [number, number] = [
            area.coordinate[0] +
              Math.cos(angle) * radius,
            area.coordinate[1] +
              Math.sin(angle) * radius,
          ];

          const nearby =
            distanceKm(
              origin,
              YMCA_GROUND_GATE,
            ) <= 4.5;

          const mode: TravelMode =
            nearby &&
            seeded(uniqueIndex, 12) < 0.62
              ? "walk"
              : "bus";

          return {
            id: `${areaIndex}-${routeIndex}`,
            area: area.name,
            mode,
            origin,
          };
        },
      ),
  );

function createGroundPosition(
  index: number,
): [number, number] {
  /*
   * Square-root radius distributes people naturally across
   * the full ground instead of concentrating everyone at
   * the centre.
   *
   * Multiplying by 0.88 leaves a safety margin so no dot
   * can touch nearby buildings or roads.
   */
  const angle =
    seeded(index, 200) * Math.PI * 2;

  const radius =
    Math.sqrt(seeded(index, 201)) * 0.88;

  const horizontalVariation =
    0.94 + seeded(index, 202) * 0.06;

  const verticalVariation =
    0.94 + seeded(index, 203) * 0.06;

  return [
    YMCA_EVENT_GROUND_CENTER[0] +
      Math.cos(angle) *
        radius *
        GROUND_LONGITUDE_RADIUS *
        horizontalVariation,

    YMCA_EVENT_GROUND_CENTER[1] +
      Math.sin(angle) *
        radius *
        GROUND_LATITUDE_RADIUS *
        verticalVariation,
  ];
}

function calculateSegmentLengths(
  coordinates: Array<[number, number]>,
) {
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

    const longitudeDifference =
      (end[0] - start[0]) *
      longitudeScale;

    const latitudeDifference =
      end[1] - start[1];

    const length = Math.sqrt(
      longitudeDifference *
        longitudeDifference +
        latitudeDifference *
          latitudeDifference,
    );

    segmentLengths.push(length);
    totalLength += length;
  }

  return {
    segmentLengths,
    totalLength,
  };
}

function interpolateRoute(
  coordinates: Array<[number, number]>,
  progress: number,
): [number, number] {
  if (coordinates.length === 0) {
    return YMCA_GROUND_GATE;
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const normalizedProgress =
    clamp(progress, 0, 1);

  const {
    segmentLengths,
    totalLength,
  } = calculateSegmentLengths(
    coordinates,
  );

  const targetDistance =
    normalizedProgress * totalLength;

  let travelledDistance = 0;

  for (
    let index = 0;
    index < segmentLengths.length;
    index += 1
  ) {
    const segmentLength =
      segmentLengths[index];

    if (
      travelledDistance +
          segmentLength >=
        targetDistance ||
      index ===
        segmentLengths.length - 1
    ) {
      const start = coordinates[index];
      const end = coordinates[index + 1];

      const localProgress =
        segmentLength === 0
          ? 0
          : (targetDistance -
              travelledDistance) /
            segmentLength;

      return [
        start[0] +
          (end[0] - start[0]) *
            localProgress,
        start[1] +
          (end[1] - start[1]) *
            localProgress,
      ];
    }

    travelledDistance +=
      segmentLength;
  }

  return coordinates[
    coordinates.length - 1
  ];
}

async function requestDirections(
  profile: "driving" | "walking",
  start: [number, number],
  destination: [number, number],
  token: string,
  signal: AbortSignal,
) {
  const coordinateString =
    `${start[0]},${start[1]};` +
    `${destination[0]},${destination[1]}`;

  const url =
    `https://api.mapbox.com/directions/v5/mapbox/` +
    `${profile}/${coordinateString}` +
    `?alternatives=false` +
    `&geometries=geojson` +
    `&overview=full` +
    `&steps=false` +
    `&radiuses=unlimited;unlimited` +
    `&access_token=${encodeURIComponent(
      token,
    )}`;

  const response = await fetch(url, {
    signal,
  });

  const payload =
    (await response.json()) as MapboxDirectionsResponse;

  const route = payload.routes?.[0];

  if (
    !response.ok ||
    payload.code !== "Ok" ||
    !route?.geometry?.coordinates
  ) {
    throw new Error(
      payload.message ??
        "Mapbox route unavailable.",
    );
  }

  const coordinates =
    route.geometry.coordinates
      .filter(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          Number.isFinite(
            coordinate[0],
          ) &&
          Number.isFinite(
            coordinate[1],
          ),
      )
      .map(
        (coordinate) =>
          [
            coordinate[0],
            coordinate[1],
          ] as [number, number],
      );

  if (coordinates.length < 2) {
    throw new Error(
      "Mapbox returned an empty route.",
    );
  }

  return {
    coordinates,
    durationMinutes:
      (route.duration ?? 1800) / 60,
  };
}

async function loadRoutes(
  token: string,
  signal: AbortSignal,
) {
  const finalWalkingRoute =
    await requestDirections(
      "walking",
      NANDANAM_DROP_OFF,
      YMCA_GROUND_GATE,
      token,
      signal,
    );

  const loadedRoutes: SimulationRoute[] =
    [];

  /*
   * Use small batches to avoid sending every route request
   * simultaneously.
   */
  for (
    let startIndex = 0;
    startIndex <
    ROUTE_REQUESTS.length;
    startIndex += 8
  ) {
    const batch =
      ROUTE_REQUESTS.slice(
        startIndex,
        startIndex + 8,
      );

    const results =
      await Promise.allSettled(
        batch.map(async (request) => {
          if (
            request.mode === "walk"
          ) {
            const walkingRoute =
              await requestDirections(
                "walking",
                request.origin,
                YMCA_GROUND_GATE,
                token,
                signal,
              );

            return {
              id: request.id,
              area: request.area,
              mode: request.mode,
              coordinates:
                walkingRoute.coordinates,
              durationMinutes:
                walkingRoute.durationMinutes,
            } satisfies SimulationRoute;
          }

          const busRoute =
            await requestDirections(
              "driving",
              request.origin,
              NANDANAM_DROP_OFF,
              token,
              signal,
            );

          return {
            id: request.id,
            area: request.area,
            mode: request.mode,
            coordinates: [
              ...busRoute.coordinates,
              ...finalWalkingRoute
                .coordinates
                .slice(1),
            ],
            durationMinutes:
              busRoute.durationMinutes +
              finalWalkingRoute.durationMinutes,
          } satisfies SimulationRoute;
        }),
      );

    for (const result of results) {
      if (
        result.status === "fulfilled"
      ) {
        loadedRoutes.push(
          result.value,
        );
      }
    }

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          80,
        ),
    );
  }

  return loadedRoutes;
}

function formatClock(
  minute: number,
) {
  const totalMinutes =
    17 * 60 + minute;

  const hours24 =
    Math.floor(totalMinutes / 60) %
    24;

  const minutes =
    totalMinutes % 60;

  const hours12 =
    hours24 % 12 || 12;

  return `${hours12}:${String(
    minutes,
  ).padStart(2, "0")} ${
    hours24 >= 12 ? "PM" : "AM"
  }`;
}

export function YmcaRallySimulation() {
  const expectedCrowd =
    useAtlasStore(
      (state) =>
        state.scenario
          .expectedCrowd,
    );

  const minute = useAtlasStore(
    (state) => state.minute,
  );

  const status = useAtlasStore(
    (state) => state.status,
  );

  const [routes, setRoutes] =
    useState<SimulationRoute[]>(
      [],
    );

  const [
    routeStatus,
    setRouteStatus,
  ] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [
    routeError,
    setRouteError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const token =
      process.env
        .NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      setRouteStatus("error");
      setRouteError(
        "Mapbox token is missing.",
      );
      return;
    }

    const controller =
      new AbortController();

    async function initialise() {
      setRouteStatus("loading");
      setRouteError(null);

      try {
        const cached =
          window.localStorage.getItem(
            ROUTE_CACHE_KEY,
          );

        if (cached) {
          const parsed =
            JSON.parse(
              cached,
            ) as SimulationRoute[];

          if (
            Array.isArray(parsed) &&
            parsed.length >= 50
          ) {
            setRoutes(parsed);
            setRouteStatus("ready");
            return;
          }
        }
      } catch {
        window.localStorage.removeItem(
          ROUTE_CACHE_KEY,
        );
      }

      const loadedRoutes =
        await loadRoutes(
          token as string,
          controller.signal,
        );

      if (
        controller.signal.aborted
      ) {
        return;
      }

      if (
        loadedRoutes.length < 40
      ) {
        throw new Error(
          "Not enough Chennai routes could be loaded.",
        );
      }

      setRoutes(loadedRoutes);
      setRouteStatus("ready");

      try {
        window.localStorage.setItem(
          ROUTE_CACHE_KEY,
          JSON.stringify(
            loadedRoutes,
          ),
        );
      } catch {
        // Route caching is optional.
      }
    }

    initialise().catch(
      (error: unknown) => {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        setRouteStatus("error");
        setRouteError(
          error instanceof Error
            ? error.message
            : "Unable to create routes.",
        );
      },
    );

    return () =>
      controller.abort();
  }, []);

  const agents =
    useMemo<VisualAgent[]>(() => {
      if (routes.length === 0) {
        return [];
      }

      /*
       * Population control directly changes the number of visible dots:
       *
       * 25,000 -> 500 dots
       * 30,000 -> 600 dots
       * 35,000 -> 700 dots
       */
      const visualCount = clamp(
        Math.round(expectedCrowd / 40),
        625,
        875,
      );

      const peoplePerAgent =
        expectedCrowd /
        visualCount;

      return Array.from(
        { length: visualCount },
        (_, index) => {
          const routeIndex =
            Math.floor(
              seeded(index, 100) *
                routes.length,
            );

          const route =
            routes[
              Math.min(
                routeIndex,
                routes.length - 1,
              )
            ];

          /*
           * Even when agents share a route template, each agent receives
           * a unique road-snapped starting position near its synthetic
           * home. No straight building-crossing connector is drawn.
           */
          const startProgress =
            0.002 +
            seeded(index, 101) *
              0.075;

          const startPosition =
            interpolateRoute(
              route.coordinates,
              startProgress,
            );

          const baseDuration =
            route.durationMinutes *
            (1 - startProgress);

          const travelMinutes =
            route.mode === "bus"
              ? clamp(
                  baseDuration *
                    1.32 +
                    7 +
                    seeded(
                      index,
                      102,
                    ) *
                      18,
                  22,
                  125,
                )
              : clamp(
                  baseDuration *
                    1.08 +
                    seeded(
                      index,
                      103,
                    ) *
                      9,
                  10,
                  100,
                );

          const late =
            seeded(index, 104) >
            0.91;

          const intendedArrival =
            late
              ? 150 +
                seeded(
                  index,
                  105,
                ) *
                  30
              : 70 +
                seeded(
                  index,
                  105,
                ) *
                  75;

          const departureMinute =
            Math.max(
              0,
              Math.floor(
                intendedArrival -
                  travelMinutes,
              ),
            );

          return {
            id: index,
            routeIndex,
            mode: route.mode,
            departureMinute,
            travelMinutes,
            startProgress,
            startPosition,
            groundPosition:
              createGroundPosition(
                index,
              ),
            weight:
              peoplePerAgent,
          };
        },
      );
    }, [expectedCrowd, routes]);

  const agentGeoJson =
    useMemo<
      FeatureCollection<
        Point,
        AgentProperties
      >
    >(() => {
      const features: Array<
        Feature<
          Point,
          AgentProperties
        >
      > = [];

      for (const agent of agents) {
        const route =
          routes[
            agent.routeIndex %
              routes.length
          ];

        if (!route) {
          continue;
        }

        if (
          status !== "running" ||
          minute < agent.departureMinute
        ) {
          continue;
        }

        const journeyProgress =
          clamp(
            (minute -
              agent.departureMinute) /
              agent.travelMinutes,
            0,
            1,
          );

        const routeProgress =
          agent.startProgress +
          journeyProgress *
            (1 -
              agent.startProgress);

        const arrived =
          journeyProgress >= 1;

        features.push({
          type: "Feature",
          properties: {
            id: agent.id,
            mode: agent.mode,
            state: arrived
              ? "arrived"
              : "moving",
            people: agent.weight,
          },
          geometry: {
            type: "Point",
            coordinates: arrived
              ? agent.groundPosition
              : interpolateRoute(
                  route.coordinates,
                  routeProgress,
                ),
          },
        });
      }

      return {
        type: "FeatureCollection",
        features,
      };
    }, [agents, minute, routes, status]);

  const groundGeoJson =
    useMemo<
      FeatureCollection<Polygon>
    >(
      () => ({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  ...YMCA_OPEN_GROUND,
                  YMCA_OPEN_GROUND[0],
                ],
              ],
            },
          },
        ],
      }),
      [],
    );

  const arrivedPeople =
    useMemo(() => {
      return agents.reduce(
        (total, agent) => {
          const arrivalMinute =
            agent.departureMinute +
            agent.travelMinutes;

          return minute >=
            arrivalMinute
            ? total +
                agent.weight
            : total;
        },
        0,
      );
    }, [agents, minute]);

  const roundedArrivals =
    Math.min(
      expectedCrowd,
      Math.round(
        arrivedPeople / 100,
      ) * 100,
    );

  return (
    <>
      <Source
        id="ymca-open-ground"
        type="geojson"
        data={groundGeoJson}
      >
        <Layer
          id="ymca-open-ground-fill"
          type="fill"
          paint={{
            "fill-color": "#22c55e",
            "fill-opacity": 0.08,
          }}
        />

        <Layer
          id="ymca-open-ground-outline"
          type="line"
          paint={{
            "line-color": "#15803d",
            "line-width": 1.8,
            "line-opacity": 0.75,
          }}
        />
      </Source>

      <Source
        id="ymca-rally-agents"
        type="geojson"
        data={agentGeoJson}
      >
        <Layer
          id="ymca-arrived-heat"
          type="heatmap"
          filter={[
            "==",
            ["get", "state"],
            "arrived",
          ]}
          maxzoom={16}
          paint={{
            "heatmap-weight": 0.72,
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              0.3,
              15,
              1,
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              6,
              15,
              18,
            ],
            "heatmap-opacity": 0.28,
          }}
        />

        <Layer
          id="ymca-rally-people"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              1.5,
              13,
              2.7,
              16,
              4,
            ],
            "circle-color": [
              "case",
              [
                "==",
                ["get", "state"],
                "arrived",
              ],
              "#ef4444",
              [
                "==",
                ["get", "state"],
                "waiting",
              ],
              "#8b5cf6",
              [
                "==",
                ["get", "mode"],
                "walk",
              ],
              "#22c55e",
              "#2563eb",
            ],
            "circle-stroke-color":
              "#ffffff",
            "circle-stroke-width":
              0.45,
            "circle-opacity": [
              "case",
              [
                "==",
                ["get", "state"],
                "waiting",
              ],
              0.62,
              0.92,
            ],
          }}
        />
      </Source>

      <div className="ymca-simulation-status">
        <strong>
          {routeStatus ===
          "loading"
            ? "Generating Chennai home routes"
            : routeStatus ===
                "error"
              ? "Routing unavailable"
              : status ===
                  "running"
                ? `Simulation · ${formatClock(
                    minute,
                  )}`
                : `YMCA rally · ${formatClock(
                    minute,
                  )}`}
        </strong>

        <span>
          {routeStatus === "ready"
            ? `${roundedArrivals.toLocaleString(
                "en-IN",
              )} / ${expectedCrowd.toLocaleString(
                "en-IN",
              )} inside YMCA ground · ${agents.length} visible groups`
            : routeError ??
              "Loading unique road-snapped starting locations"}
        </span>

        {minute >= 150 && (
          <b>
            EVENT STARTED · 7:30 PM
          </b>
        )}
      </div>
    </>
  );
}
