import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type LocationCategory =
  | "Hospital"
  | "Metro Station"
  | "Railway Station"
  | "Police Station";

type OsmLocation = {
  id: string;
  name: string;
  category: LocationCategory;
  longitude: number;
  latitude: number;
  color: string;
  osmType: OverpassElement["type"];
  osmId: number;
  source: "OpenStreetMap";
};

const CATEGORY_DETAILS: Record<
  LocationCategory,
  {
    color: string;
    maximumItems: number;
  }
> = {
  Hospital: {
    color: "#ef4444",
    maximumItems: 80,
  },
  "Metro Station": {
    color: "#3b82f6",
    maximumItems: 80,
  },
  "Railway Station": {
    color: "#f97316",
    maximumItems: 50,
  },
  "Police Station": {
    color: "#06b6d4",
    maximumItems: 100,
  },
};

/*
 * Greater Chennai bounding box:
 * south, west, north, east
 *
 * This keeps the request focused on Chennai and avoids downloading
 * unrelated Tamil Nadu POIs.
 */
const CHENNAI_BBOX = "12.88,80.08,13.24,80.38";

const OVERPASS_QUERY = `
[out:json][timeout:40];

(
  nwr["amenity"="hospital"]["name"](${CHENNAI_BBOX});
  nwr["amenity"="police"]["name"](${CHENNAI_BBOX});
  nwr["railway"="station"]["station"="subway"]["name"](${CHENNAI_BBOX});
  nwr["railway"="subway_entrance"]["name"](${CHENNAI_BBOX});

  nwr["railway"="station"]["name"](${CHENNAI_BBOX});
  nwr["railway"="halt"]["name"](${CHENNAI_BBOX});
);

out center tags;
`;

function determineCategory(
  tags: Record<string, string>,
): LocationCategory | null {
  if (tags.amenity === "hospital") {
    return "Hospital";
  }

  if (tags.amenity === "police") {
    return "Police Station";
  }

  if (
    tags.station === "subway" ||
    tags.railway === "subway_entrance" ||
    tags.subway === "yes"
  ) {
    return "Metro Station";
  }

  if (
    tags.railway === "station" ||
    tags.railway === "halt"
  ) {
    return "Railway Station";
  }


  return null;
}

function normalizeName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("en-IN")
    .replace(/\s+/g, " ");
}

function convertElement(
  element: OverpassElement,
): OsmLocation | null {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags["name:en"];

  if (!name) {
    return null;
  }

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return null;
  }

  const category = determineCategory(tags);

  if (!category) {
    return null;
  }

  return {
    id: `${element.type}-${element.id}`,
    name,
    category,
    longitude,
    latitude,
    color: CATEGORY_DETAILS[category].color,
    osmType: element.type,
    osmId: element.id,
    source: "OpenStreetMap",
  };
}

function deduplicateLocations(locations: OsmLocation[]) {
  const seen = new Set<string>();

  return locations.filter((location) => {
    /*
     * Rounded coordinates prevent a station node, station building,
     * and relation with the same name appearing as three markers.
     */
    const roundedLongitude = location.longitude.toFixed(4);
    const roundedLatitude = location.latitude.toFixed(4);

    const key = [
      location.category,
      normalizeName(location.name),
      roundedLongitude,
      roundedLatitude,
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function limitByCategory(locations: OsmLocation[]) {
  const counts = new Map<LocationCategory, number>();

  return locations.filter((location) => {
    const currentCount = counts.get(location.category) ?? 0;
    const maximumItems =
      CATEGORY_DETAILS[location.category].maximumItems;

    if (currentCount >= maximumItems) {
      return false;
    }

    counts.set(location.category, currentCount + 1);
    return true;
  });
}

export async function GET() {
  const overpassEndpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let lastError = "OpenStreetMap request failed.";

  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "ATLAS-Chennai-Hackathon/1.0",
        },
        body: new URLSearchParams({
          data: OVERPASS_QUERY,
        }),
        next: {
          revalidate: 86400,
        },
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        lastError =
          `Overpass returned HTTP ${response.status}.`;
        continue;
      }

      const payload =
        (await response.json()) as OverpassResponse;

      const converted = (payload.elements ?? [])
        .map(convertElement)
        .filter(
          (location): location is OsmLocation =>
            location !== null,
        );

      const locations = limitByCategory(
        deduplicateLocations(converted),
      );

      return NextResponse.json(
        {
          locations,
          source: "OpenStreetMap",
          fetchedAt: new Date().toISOString(),
          count: locations.length,
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        },
      );
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : "Unknown OpenStreetMap error";
    }
  }

  return NextResponse.json(
    {
      locations: [],
      source: "OpenStreetMap",
      error: lastError,
      fetchedAt: new Date().toISOString(),
    },
    {
      status: 503,
    },
  );
}
