import type {
  FeatureCollection,
  LineString,
  Point,
} from "geojson";

export type CityLocationProperties = {
  name: string;
  category:
    | "Hospital"
    | "Metro Station"
    | "Railway Station"
    | "Police Station";
  color: string;
  shortCode: string;
};

export const chennaiCityLocations: FeatureCollection<
  Point,
  CityLocationProperties
> = {
  type: "FeatureCollection",
  features: [
    // Hospitals
    {
      type: "Feature",
      properties: {
        name: "Rajiv Gandhi Government General Hospital",
        category: "Hospital",
        color: "#ef4444",
        shortCode: "H",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2768, 13.0827],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Apollo Hospital, Greams Road",
        category: "Hospital",
        color: "#ef4444",
        shortCode: "H",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2517, 13.0632],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Government Royapettah Hospital",
        category: "Hospital",
        color: "#ef4444",
        shortCode: "H",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2644, 13.055],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Kauvery Hospital, Alwarpet",
        category: "Hospital",
        color: "#ef4444",
        shortCode: "H",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2537, 13.0336],
      },
    },

    // Metro stations
    {
      type: "Feature",
      properties: {
        name: "Puratchi Thalaivar Dr. M.G. Ramachandran Central Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2736, 13.0814],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Government Estate Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2716, 13.0696],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "LIC Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.266, 13.0647],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Thousand Lights Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2546, 13.0603],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "AG-DMS Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.248, 13.0455],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Guindy Metro",
        category: "Metro Station",
        color: "#3b82f6",
        shortCode: "M",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2016, 13.009],
      },
    },

    // Railway stations
    {
      type: "Feature",
      properties: {
        name: "MGR Chennai Central Railway Station",
        category: "Railway Station",
        color: "#f97316",
        shortCode: "R",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2754, 13.0827],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Chennai Egmore Railway Station",
        category: "Railway Station",
        color: "#f97316",
        shortCode: "R",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2607, 13.0732],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Mambalam Railway Station",
        category: "Railway Station",
        color: "#f97316",
        shortCode: "R",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2254, 13.0385],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Guindy Railway Station",
        category: "Railway Station",
        color: "#f97316",
        shortCode: "R",
      },
      geometry: {
        type: "Point",
        coordinates: [80.212, 13.0092],
      },
    },

    // Police stations
    {
      type: "Feature",
      properties: {
        name: "Triplicane Police Station",
        category: "Police Station",
        color: "#06b6d4",
        shortCode: "P",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2762, 13.0586],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Anna Salai Police Station",
        category: "Police Station",
        color: "#06b6d4",
        shortCode: "P",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2645, 13.064],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "T. Nagar Police Station",
        category: "Police Station",
        color: "#06b6d4",
        shortCode: "P",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2335, 13.0408],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Egmore Police Station",
        category: "Police Station",
        color: "#06b6d4",
        shortCode: "P",
      },
      geometry: {
        type: "Point",
        coordinates: [80.26, 13.0738],
      },
    },
  ],
};

export type RoadProperties = {
  name: string;
  category: "Highway" | "Road Closure";
  color: string;
};

export const chennaiHighways: FeatureCollection<
  LineString,
  RoadProperties
> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Anna Salai / NH 32",
        category: "Highway",
        color: "#facc15",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2709, 13.0695],
          [80.2645, 13.0635],
          [80.2571, 13.055],
          [80.2491, 13.0454],
          [80.2367, 13.0351],
          [80.2235, 13.0247],
          [80.211, 13.0142],
          [80.2016, 13.009],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Poonamallee High Road",
        category: "Highway",
        color: "#facc15",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2753, 13.0826],
          [80.2634, 13.0794],
          [80.251, 13.0771],
          [80.2377, 13.075],
          [80.2241, 13.0721],
          [80.2104, 13.0691],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Inner Ring Road",
        category: "Highway",
        color: "#facc15",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.221, 13.112],
          [80.216, 13.093],
          [80.211, 13.074],
          [80.207, 13.054],
          [80.204, 13.033],
          [80.2016, 13.009],
        ],
      },
    },
  ],
};

export const chennaiRoadClosures: FeatureCollection<
  LineString,
  RoadProperties
> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Demo Closure: Marina Beach Road",
        category: "Road Closure",
        color: "#ec4899",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2824, 13.063],
          [80.283, 13.0575],
          [80.2834, 13.052],
          [80.2836, 13.047],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Demo Closure: Anna Salai Segment",
        category: "Road Closure",
        color: "#ec4899",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2645, 13.0635],
          [80.261, 13.0595],
          [80.2571, 13.055],
        ],
      },
    },
  ],
};
