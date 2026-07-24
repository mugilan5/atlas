"use client";

import { useState } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import { YmcaRallySimulation } from "@/components/map/ymca-rally-simulation";
import { YMCA_RALLY_CENTER } from "@/data/scenario";

type MapViewStyle = "normal" | "satellite";

const MAP_STYLES: Record<MapViewStyle, string> = {
  normal: "mapbox://styles/mapbox/streets-v12",
  satellite:
    "mapbox://styles/mapbox/satellite-streets-v12",
};

const YMCA_VIEW = {
  longitude: 80.225,
  latitude: 13.055,
  zoom: 10.9,
  pitch: 0,
  bearing: 0,
};

export function AtlasMap() {
  const [mapViewStyle, setMapViewStyle] =
    useState<MapViewStyle>("normal");

  const token =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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
        initialViewState={YMCA_VIEW}
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
        minZoom={10}
        maxZoom={18}
        onError={(event) => {
          console.error(
            "Mapbox map error:",
            event.error,
          );
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

        <YmcaRallySimulation />
      </Map>

      <div
        className="map-view-switch"
        role="group"
        aria-label="Map view"
      >
        <button
          type="button"
          className={
            mapViewStyle === "normal"
              ? "active"
              : ""
          }
          onClick={() =>
            setMapViewStyle("normal")
          }
        >
          Map
        </button>

        <button
          type="button"
          className={
            mapViewStyle === "satellite"
              ? "active"
              : ""
          }
          onClick={() =>
            setMapViewStyle("satellite")
          }
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
