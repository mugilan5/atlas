import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

type OverpassNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};

type OverpassWay = {
  type: "way";
  id: number;
  geometry?: Array<{
    lat: number;
    lon: number;
  }>;
  tags?: Record<string, string>;
};

type OverpassElement = OverpassNode | OverpassWay;

type OverpassResponse = {
  elements?: OverpassElement[];
};

type NetworkPath = {
  id: string;
  name: string;
  kind:
    | "pedestrian"
    | "local-road"
    | "major-road"
    | "service-road";
  coordinates: [number, number][];
  weight: number;
};

const MARINA_LATITUDE = 13.0507;
const MARINA_LONGITUDE = 80.2824;
const SEARCH_RADIUS_METRES = 3600;

const OVERPASS_QUERY = `
[out:json][timeout:45];

(
  way(around:${SEARCH_RADIUS_METRES},${MARINA_LATITUDE},${MARINA_LONGITUDE})
    ["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|living_street"];

  way(around:${SEARCH_RADIUS_METRES},${MARINA_LATITUDE},${MARINA_LONGITUDE})
    ["highway"~"footway|pedestrian|path|steps|cycleway"];

  way(around:${SEARCH_RADIUS_METRES},${MARINA_LATITUDE},${MARINA_LONGITUDE})
    ["railway"~"rail|subway|light_rail"];
);

out tags geom;
`;

function classifyWay(
  tags: Record<string, string>,
): NetworkPath["kind"] {
  const highway = tags.highway;

  if (
    highway === "footway" ||
    highway === "pedestrian" ||
    highway === "path" ||
    highway === "steps" ||
    highway === "cycleway"
  ) {
    return "pedestrian";
  }

  if (
    highway === "motorway" ||
    highway === "trunk" ||
    highway === "primary" ||
    highway === "secondary"
  ) {
    return "major-road";
  }

  if (
    highway === "service" ||
    highway === "living_street"
  ) {
    return "service-road";
  }

  return "local-road";
}

function getWeight(kind: NetworkPath["kind"]) {
  switch (kind) {
    case "pedestrian":
      return 1.8;
    case "major-road":
      return 1.5;
    case "local-road":
      return 1.1;
    case "service-road":
      return 0.65;
  }
}

function validCoordinate(
  coordinate: [number, number],
): boolean {
  const [longitude, latitude] = coordinate;

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= 80.08 &&
    longitude <= 80.38 &&
    latitude >= 12.88 &&
    latitude <= 13.24
  );
}

function convertWay(way: OverpassWay): NetworkPath | null {
  if (!way.geometry || way.geometry.length < 2) {
    return null;
  }

  const tags = way.tags ?? {};
  const kind = classifyWay(tags);

  const coordinates = way.geometry
    .map(
      (point): [number, number] => [
        point.lon,
        point.lat,
      ],
    )
    .filter(validCoordinate);

  if (coordinates.length < 2) {
    return null;
  }

  return {
    id: `osm-way-${way.id}`,
    name:
      tags.name ??
      tags.ref ??
      `${kind.replace("-", " ")} ${way.id}`,
    kind,
    coordinates,
    weight: getWeight(kind),
  };
}

export async function GET() {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let finalError = "Unable to fetch OpenStreetMap network.";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "ATLAS-Chennai-Digital-Twin/1.0",
        },
        body: new URLSearchParams({
          data: OVERPASS_QUERY,
        }),
        next: {
          revalidate: 86400,
        },
        signal: AbortSignal.timeout(50000),
      });

      if (!response.ok) {
        finalError = `Overpass returned HTTP ${response.status}`;
        continue;
      }

      const payload =
        (await response.json()) as OverpassResponse;

      const paths = (payload.elements ?? [])
        .filter(
          (element): element is OverpassWay =>
            element.type === "way",
        )
        .map(convertWay)
        .filter(
          (path): path is NetworkPath =>
            path !== null,
        )
        .filter((path) => path.coordinates.length >= 2)
        .slice(0, 850);

      if (paths.length === 0) {
        finalError = "OpenStreetMap returned no usable roads.";
        continue;
      }

      return NextResponse.json(
        {
          center: {
            longitude: MARINA_LONGITUDE,
            latitude: MARINA_LATITUDE,
          },
          paths,
          pathCount: paths.length,
          source: "OpenStreetMap",
          fetchedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        },
      );
    } catch (error) {
      finalError =
        error instanceof Error
          ? error.message
          : "Unknown map network error";
    }
  }

  return NextResponse.json(
    {
      paths: [],
      source: "fallback",
      error: finalError,
    },
    {
      status: 503,
    },
  );
}
