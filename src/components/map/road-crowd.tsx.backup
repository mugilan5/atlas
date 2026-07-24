"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  FeatureCollection,
  LineString,
  Point,
  Position,
} from "geojson";
import { Layer, Source } from "react-map-gl/maplibre";

type CrowdAgent = {
  id: number;
  routeIndex: number;
  progress: number;
  speed: number;
  direction: 1 | -1;
  offsetX: number;
  offsetY: number;
  type: "pedestrian" | "vehicle" | "public-transport";
};

type RoadProperties = {
  name: string;
};

/*
 * Hackathon road paths for Chennai.
 *
 * Each route contains many intermediate coordinates, so agents follow
 * curved streets instead of moving directly between two endpoints.
 *
 * Coordinates use [longitude, latitude].
 */
const CHENNAI_ROAD_PATHS: Array<{
  name: string;
  coordinates: Position[];
}> = [
  {
    name: "Anna Salai",
    coordinates: [
      [80.2721, 13.0697],
      [80.2694, 13.0673],
      [80.2666, 13.0647],
      [80.2639, 13.0621],
      [80.2610, 13.0590],
      [80.2581, 13.0558],
      [80.2552, 13.0522],
      [80.2524, 13.0488],
      [80.2490, 13.0452],
      [80.2459, 13.0420],
      [80.2424, 13.0388],
      [80.2383, 13.0357],
      [80.2338, 13.0320],
      [80.2291, 13.0284],
      [80.2245, 13.0247],
      [80.2195, 13.0209],
      [80.2147, 13.0173],
      [80.2102, 13.0138],
      [80.2055, 13.0109],
      [80.2016, 13.0090],
    ],
  },
  {
    name: "Marina Beach Road",
    coordinates: [
      [80.2870, 13.0850],
      [80.2860, 13.0795],
      [80.2852, 13.0745],
      [80.2845, 13.0695],
      [80.2839, 13.0640],
      [80.2834, 13.0590],
      [80.2831, 13.0542],
      [80.2833, 13.0495],
      [80.2838, 13.0446],
      [80.2840, 13.0398],
      [80.2838, 13.0350],
      [80.2830, 13.0300],
      [80.2820, 13.0250],
      [80.2810, 13.0200],
      [80.2800, 13.0150],
    ],
  },
  {
    name: "Cathedral Road to Mylapore",
    coordinates: [
      [80.2521, 13.0589],
      [80.2540, 13.0565],
      [80.2558, 13.0538],
      [80.2573, 13.0509],
      [80.2588, 13.0480],
      [80.2605, 13.0450],
      [80.2622, 13.0423],
      [80.2640, 13.0395],
      [80.2660, 13.0367],
      [80.2680, 13.0340],
      [80.2698, 13.0315],
    ],
  },
  {
    name: "Poonamallee High Road",
    coordinates: [
      [80.2760, 13.0831],
      [80.2724, 13.0821],
      [80.2683, 13.0810],
      [80.2640, 13.0798],
      [80.2593, 13.0788],
      [80.2545, 13.0778],
      [80.2495, 13.0769],
      [80.2442, 13.0760],
      [80.2390, 13.0750],
      [80.2335, 13.0739],
      [80.2280, 13.0727],
      [80.2225, 13.0715],
      [80.2170, 13.0702],
      [80.2110, 13.0690],
    ],
  },
  {
    name: "T Nagar to Adyar",
    coordinates: [
      [80.2332, 13.0414],
      [80.2347, 13.0380],
      [80.2365, 13.0347],
      [80.2383, 13.0310],
      [80.2402, 13.0275],
      [80.2424, 13.0240],
      [80.2445, 13.0203],
      [80.2465, 13.0165],
      [80.2480, 13.0127],
      [80.2490, 13.0088],
      [80.2496, 13.0047],
      [80.2500, 13.0005],
      [80.2508, 12.9962],
    ],
  },
  {
    name: "Mylapore to Thiruvanmiyur",
    coordinates: [
      [80.2694, 13.0342],
      [80.2680, 13.0302],
      [80.2670, 13.0260],
      [80.2664, 13.0218],
      [80.2658, 13.0176],
      [80.2655, 13.0130],
      [80.2650, 13.0086],
      [80.2640, 13.0042],
      [80.2628, 12.9997],
      [80.2615, 12.9953],
      [80.2600, 12.9908],
      [80.2585, 12.9864],
      [80.2570, 12.9820],
    ],
  },
  {
    name: "Egmore Connector",
    coordinates: [
      [80.2608, 13.0733],
      [80.2630, 13.0716],
      [80.2652, 13.0695],
      [80.2676, 13.0672],
      [80.2700, 13.0648],
      [80.2723, 13.0622],
      [80.2745, 13.0594],
      [80.2765, 13.0563],
      [80.2785, 13.0532],
      [80.2810, 13.0500],
      [80.2833, 13.0480],
    ],
  },
];

function seededRandom(seed: number) {
  const value = Math.sin(seed * 999.91) * 43758.5453;
  return value - Math.floor(value);
}

function createAgents(count: number): CrowdAgent[] {
  return Array.from({ length: count }, (_, index) => {
    const typeRandom = seededRandom(index + 500);

    return {
      id: index,
      routeIndex: Math.floor(
        seededRandom(index + 20) * CHENNAI_ROAD_PATHS.length,
      ),
      progress: seededRandom(index + 40),
      speed: 0.00035 + seededRandom(index + 60) * 0.0008,
      direction: seededRandom(index + 80) > 0.5 ? 1 : -1,
      offsetX: (seededRandom(index + 100) - 0.5) * 0.00011,
      offsetY: (seededRandom(index + 120) - 0.5) * 0.00008,
      type:
        typeRandom < 0.68
          ? "pedestrian"
          : typeRandom < 0.91
            ? "vehicle"
            : "public-transport",
    };
  });
}

function interpolateAlongRoad(
  coordinates: Position[],
  progress: number,
): [number, number] {
  if (coordinates.length === 0) {
    return [80.2707, 13.0827];
  }

  if (coordinates.length === 1) {
    return [coordinates[0][0], coordinates[0][1]];
  }

  /*
   * Calculate each segment length so movement speed remains reasonably
   * consistent across both short and long road segments.
   */
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let index = 0; index < coordinates.length - 1; index += 1) {
    const start = coordinates[index];
    const end = coordinates[index + 1];

    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.sqrt(dx * dx + dy * dy);

    segmentLengths.push(length);
    totalLength += length;
  }

  const normalizedProgress = ((progress % 1) + 1) % 1;
  const targetDistance = normalizedProgress * totalLength;

  let travelledDistance = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];

    if (
      travelledDistance + segmentLength >= targetDistance ||
      index === segmentLengths.length - 1
    ) {
      const start = coordinates[index];
      const end = coordinates[index + 1];

      const localProgress =
        segmentLength === 0
          ? 0
          : (targetDistance - travelledDistance) / segmentLength;

      return [
        start[0] + (end[0] - start[0]) * localProgress,
        start[1] + (end[1] - start[1]) * localProgress,
      ];
    }

    travelledDistance += segmentLength;
  }

  const finalCoordinate = coordinates[coordinates.length - 1];

  return [finalCoordinate[0], finalCoordinate[1]];
}

function getAgentColor(type: CrowdAgent["type"]) {
  switch (type) {
    case "vehicle":
      return "#facc15";
    case "public-transport":
      return "#38bdf8";
    default:
      return "#4ade80";
  }
}

export function RoadCrowd() {
  const [agents, setAgents] = useState<CrowdAgent[]>(() =>
    createAgents(180),
  );

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = Math.min((currentTime - previousTime) / 16.67, 2.5);
      previousTime = currentTime;

      setAgents((currentAgents) =>
        currentAgents.map((agent) => {
          let nextProgress =
            agent.progress + agent.speed * agent.direction * delta;

          let nextDirection = agent.direction;

          /*
           * Agents turn around at route ends rather than teleporting.
           */
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
        }),
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const roadGeoJson = useMemo<
    FeatureCollection<LineString, RoadProperties>
  >(
    () => ({
      type: "FeatureCollection",
      features: CHENNAI_ROAD_PATHS.map((road) => ({
        type: "Feature",
        properties: {
          name: road.name,
        },
        geometry: {
          type: "LineString",
          coordinates: road.coordinates,
        },
      })),
    }),
    [],
  );

  const crowdGeoJson = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: agents.map((agent) => {
        const route = CHENNAI_ROAD_PATHS[agent.routeIndex];

        const [longitude, latitude] = interpolateAlongRoad(
          route.coordinates,
          agent.progress,
        );

        return {
          type: "Feature",
          properties: {
            id: agent.id,
            type: agent.type,
            color: getAgentColor(agent.type),
          },
          geometry: {
            type: "Point",
            coordinates: [
              longitude + agent.offsetX,
              latitude + agent.offsetY,
            ],
          },
        };
      }),
    }),
    [agents],
  );

  return (
    <>
      <Source
        id="atlas-crowd-road-paths"
        type="geojson"
        data={roadGeoJson}
      >
        <Layer
          id="atlas-crowd-road-path-shadow"
          type="line"
          paint={{
            "line-color": "#020506",
            "line-width": 5,
            "line-opacity": 0.4,
          }}
        />

        <Layer
          id="atlas-crowd-road-path"
          type="line"
          paint={{
            "line-color": "#22c55e",
            "line-width": 1.2,
            "line-opacity": 0.22,
          }}
        />
      </Source>

      <Source
        id="atlas-road-crowd"
        type="geojson"
        data={crowdGeoJson}
      >
        <Layer
          id="atlas-road-crowd-glow"
          type="circle"
          paint={{
            "circle-radius": [
              "match",
              ["get", "type"],
              "vehicle",
              5,
              "public-transport",
              6,
              4,
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.2,
            "circle-blur": 0.8,
          }}
        />

        <Layer
          id="atlas-road-crowd-points"
          type="circle"
          paint={{
            "circle-radius": [
              "match",
              ["get", "type"],
              "vehicle",
              2.8,
              "public-transport",
              3.5,
              2.1,
            ],
            "circle-color": ["get", "color"],
            "circle-stroke-color": "#06100a",
            "circle-stroke-width": 0.8,
            "circle-opacity": 0.95,
          }}
        />
      </Source>
    </>
  );
}
