"use client";

import { AlertTriangle, Bus, Cross, Hospital, Shield, TrainFront } from "lucide-react";
import { RALLY_CENTER, ROUTES } from "@/data/scenario";
import { useAtlasStore } from "@/store/use-atlas-store";

const bounds = {
  minLng: 80.238,
  maxLng: 80.293,
  minLat: 12.975,
  maxLat: 13.09,
};

function project([lng, lat]: [number, number]) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { x, y };
}

function routePath(route: Array<[number, number]>) {
  return route.map((coordinate) => {
    const point = project(coordinate);
    return `${point.x},${point.y}`;
  }).join(" ");
}

export function FallbackCityMap() {
  const agents = useAtlasStore((state) => state.agents);
  const layers = useAtlasStore((state) => state.layers);
  const interventions = useAtlasStore((state) => state.interventions);
  const rally = project(RALLY_CENTER);

  return (
    <div className="fallback-map" aria-label="Synthetic Chennai map fallback">
      <div className="fallback-grid" />
      <div className="sea" />
      <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {ROUTES.map((route, index) => (
          <polyline
            key={index}
            points={routePath(route)}
            className={`route-line route-${index}`}
          />
        ))}
        {layers["road-congestion"] && (
          <polyline
            points="57,34 64,41 72,47 80,53"
            className="blocked-route"
          />
        )}
      </svg>

      {layers["crowd-density"] && (
        <>
          <div className="density-glow density-green" style={{ left: `${rally.x - 21}%`, top: `${rally.y - 23}%` }} />
          <div className="density-glow density-yellow" style={{ left: `${rally.x - 14}%`, top: `${rally.y - 16}%` }} />
          <div className="density-glow density-red" style={{ left: `${rally.x - 8}%`, top: `${rally.y - 9}%` }} />
        </>
      )}

      {layers["traffic-flow"] && agents.slice(0, 720).map((agent) => {
        const point = project(agent.coordinate);
        return (
          <span
            key={agent.id}
            className={`map-agent mode-${agent.transportMode} status-${agent.status}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        );
      })}

      <MapBadge className="badge-stage" x={rally.x} y={rally.y} label="MAIN STAGE" icon={<Cross size={13} />} />
      <MapBadge className="badge-metro" x={50} y={38} label="METRO" icon={<TrainFront size={13} />} />
      <MapBadge className="badge-hospital" x={55} y={73} label="HOSPITAL" icon={<Hospital size={13} />} />
      <MapBadge className="badge-road" x={43} y={58} label="ROAD BLOCK" icon={<AlertTriangle size={13} />} />

      {layers["police-units"] && (
        <MapBadge className="badge-police" x={69} y={43} label="POLICE" icon={<Shield size={13} />} />
      )}
      {layers["public-transport"] && (
        <MapBadge className="badge-bus" x={34} y={64} label="SHUTTLE HUB" icon={<Bus size={13} />} />
      )}

      {interventions.includes("open-alternate-road") && (
        <div className="alternate-route-label">ALTERNATE CORRIDOR ACTIVE</div>
      )}

      <div className="map-watermark">LOCAL FALLBACK · ADD MAPBOX TOKEN FOR LIVE MAP</div>
    </div>
  );
}

function MapBadge({
  x,
  y,
  label,
  icon,
  className,
}: {
  x: number;
  y: number;
  label: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`map-badge ${className}`} style={{ left: `${x}%`, top: `${y}%` }}>
      <span>{icon}</span>
      {label}
    </div>
  );
}
