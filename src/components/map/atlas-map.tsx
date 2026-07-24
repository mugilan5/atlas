"use client";

import { useState } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";

import { RealisticCrowd } from "@/components/map/realistic-crowd";

type MapViewStyle = "normal" | "satellite";

const MAP_STYLES: Record<MapViewStyle, string> = {
  normal: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const CHENNAI_VIEW = {
  longitude: 80.2824,
  latitude: 13.0507,
  zoom: 14.2,
  pitch: 0,
  bearing: 0,
};

export function AtlasMap() {
  const [mapViewStyle, setMapViewStyle] =
    useState<MapViewStyle>("normal");

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return (
      <div className="map-token-error">
        Mapbox token is missing. Add
        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local.
      </div>
    );
  }

  return (
    <div className="real-chennai-map">
      <Map
        key={mapViewStyle}
        initialViewState={CHENNAI_VIEW}
        mapboxAccessToken={token}
        mapStyle={MAP_STYLES[mapViewStyle]}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        attributionControl
        reuseMaps={false}
        onError={(event) => {
          console.error("Mapbox error:", event.error);
        }}
      >
        <NavigationControl
          position="bottom-right"
          showCompass
          showZoom
        />

        <ScaleControl
          position="bottom-left"
          unit="metric"
        />

        <RealisticCrowd />
      </Map>

      <div
        className="map-view-switch"
        role="group"
        aria-label="Map view"
      >
        <button
          type="button"
          className={mapViewStyle === "normal" ? "active" : ""}
          onClick={() => setMapViewStyle("normal")}
        >
          Map
        </button>

        <button
          type="button"
          className={mapViewStyle === "satellite" ? "active" : ""}
          onClick={() => setMapViewStyle("satellite")}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
