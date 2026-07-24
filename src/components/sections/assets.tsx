"use client";

import { Camera, CheckCircle2, CircleAlert, Layers3, MapPin, RadioTower, Shield, TrainFront } from "lucide-react";
import { INFRASTRUCTURE_ASSETS, MAP_LAYERS } from "@/data/scenario";
import { useAtlasStore } from "@/store/use-atlas-store";

const iconByType = {
  "Police Unit": Shield,
  Medical: RadioTower,
  "Public Transport": TrainFront,
  CCTV: Camera,
  Barricades: Layers3,
};

export function AssetsSection() {
  const layers = useAtlasStore((state) => state.layers);
  const toggleLayer = useAtlasStore((state) => state.toggleLayer);

  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span>ASSET REGISTRY</span><h1>Operational Assets</h1><p>Infrastructure and response resources available to the active simulation.</p></div></div>

      <div className="asset-summary-grid">
        <Summary label="Registered assets" value="138" icon={MapPin} />
        <Summary label="Operational" value="112" icon={CheckCircle2} />
        <Summary label="Over capacity" value="1" icon={CircleAlert} />
        <Summary label="Map layers" value={`${Object.values(layers).filter(Boolean).length}/${MAP_LAYERS.length}`} icon={Layers3} />
      </div>

      <div className="assets-layout">
        <article className="panel asset-table-card">
          <div className="table-title"><div><span>LIVE REGISTRY</span><h2>Chennai Event Assets</h2></div><button>EXPORT</button></div>
          <div className="asset-table">
            <div className="asset-row table-head"><span>Asset</span><span>Type</span><span>Status</span><span>Quantity</span></div>
            {INFRASTRUCTURE_ASSETS.map((asset) => {
              const Icon = iconByType[asset.type as keyof typeof iconByType] ?? Layers3;
              return <div className="asset-row" key={asset.id}><span className="asset-name"><Icon size={16} />{asset.name}</span><span>{asset.type}</span><span className={`status-text ${asset.status.toLowerCase().replace(" ", "-")}`}>{asset.status}</span><strong>{asset.quantity}</strong></div>;
            })}
          </div>
        </article>

        <aside className="panel layer-manager">
          <span>MAP CONFIGURATION</span><h2>Layer Manager</h2><p>Enable or disable operational overlays on the live digital twin.</p>
          <div className="layer-list-large">
            {MAP_LAYERS.map((layer) => <label key={layer.id}><div><Layers3 size={15} /><span>{layer.label}</span></div><input type="checkbox" checked={layers[layer.id]} onChange={() => toggleLayer(layer.id)} /></label>)}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: string; icon: typeof MapPin }) {
  return <article className="summary-card panel"><Icon size={18} /><div><strong>{value}</strong><span>{label}</span></div></article>;
}
