"use client";

import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bus,
  Camera,
  Check,
  CloudSun,
  Download,
  Hospital,
  Pause,
  Play,
  RotateCcw,
  Route,
  Shield,
  TrainFront,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MAP_LAYERS } from "@/data/scenario";
import { downloadSimulationReport } from "@/lib/report";
import { formatSimulationTime, metricClass, riskLabel } from "@/lib/format";
import type { InterventionId } from "@/simulation/types";
import { useAtlasStore } from "@/store/use-atlas-store";
import { AtlasMap } from "@/components/map/atlas-map";

const interventions: Array<{
  id: InterventionId;
  label: string;
  description: string;
  icon: typeof Shield;
}> = [
  { id: "add-police", label: "Add Police", description: "Deploy 200 personnel", icon: Shield },
  { id: "open-gate", label: "Open New Gate", description: "Add 2 entry gates", icon: Route },
  { id: "add-shuttle-buses", label: "Add Shuttle Buses", description: "Increase capacity", icon: Bus },
  { id: "open-alternate-road", label: "Open Alternate Road", description: "Divert traffic", icon: RotateCcw },
];

const transportData = [
  { name: "Metro", value: 38, fill: "#2f7ef5" },
  { name: "Bus", value: 32, fill: "#37c780" },
  { name: "Cars", value: 20, fill: "#e7b436" },
  { name: "Auto/Taxi", value: 10, fill: "#8f62de" },
];

export function OverviewSection() {
  const store = useAtlasStore();
  const running = store.status === "running";
  const currentTime = formatSimulationTime(store.scenario.startTime, store.minute);

  return (
    <div className="overview-layout">
      <aside className="scenario-panel panel">
        <PanelHeader eyebrow="SCENARIO" title="Live Configuration" />

        <Field label="Scenario Type" value="Political Rally · Public Event" />
        <Field label="Location" value={store.scenario.location} />
        <Field label="Expected Crowd" value={`${store.scenario.expectedCrowd.toLocaleString("en-IN")} people`} />
        <div className="two-column-fields">
          <Field label="Date" value="25 May 2025" />
          <Field label="Start" value={store.scenario.startTime} />
        </div>
        <Field
          label="Weather"
          value={`${store.scenario.weather} · ${store.scenario.temperature}°C`}
          icon={<CloudSun size={14} />}
        />

        <div className="scenario-detail-box">
          <span>EVENT DETAILS</span>
          <dl>
            <div><dt>Event</dt><dd>Leadership Rally</dd></div>
            <div><dt>Start Point</dt><dd>Island Grounds</dd></div>
            <div><dt>End Point</dt><dd>Gandhi Statue</dd></div>
            <div><dt>Stage Area</dt><dd>Marina Beach</dd></div>
          </dl>
        </div>

        <button className="primary-light-button" onClick={running ? store.pause : store.start}>
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? "PAUSE SIMULATION" : "RUN SIMULATION"}
        </button>
        <small className="helper-text">Synthetic 4-hour scenario · accelerated playback</small>

        <div className="data-source-row">
          <span className="live-dot" /> 12 ACTIVE DATA SOURCES
        </div>
      </aside>

      <section className="map-column">
        <div className="map-shell panel">
          <div className="map-status-strip">
            <span>LIVE SIMULATION</span>
            <i className="live-dot" />
            <strong>{currentTime}</strong>
          </div>

          <div className="layer-control">
            <strong>MAP LAYERS</strong>
            {MAP_LAYERS.map((layer) => (
              <label key={layer.id}>
                <input
                  type="checkbox"
                  checked={store.layers[layer.id]}
                  onChange={() => store.toggleLayer(layer.id)}
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>

          <AtlasMap />
        </div>

        <div className="timeline-panel panel">
          <div className="timeline-heading">
            <span>SIMULATION TIMELINE</span>
            <strong>{currentTime}</strong>
          </div>
          <div className="timeline-controls">
            <button onClick={running ? store.pause : store.start} aria-label={running ? "Pause" : "Start"}>
              {running ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={store.reset} aria-label="Reset"><RotateCcw size={16} /></button>
            <select value={store.speed} onChange={(event: { target: { value: string } }) => store.setSpeed(Number(event.target.value) as 1 | 2 | 4)}>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={4}>4×</option>
            </select>
            <div className="timeline-range-wrap">
              <input
                aria-label="Simulation timeline"
                type="range"
                min={0}
                max={store.scenario.durationMinutes}
                value={store.minute}
                readOnly
              />
              <div className="timeline-labels"><span>05:00 PM</span><span>06:00 PM</span><span>07:00 PM</span><span>08:00 PM</span><span>09:00 PM</span></div>
            </div>
          </div>
        </div>
      </section>

      <aside className="intelligence-panel panel">
        <div className="status-line"><span>SIMULATION STATUS</span><strong><i className="live-dot" /> {store.status.toUpperCase()}</strong></div>

        <section className="risk-summary">
          <div className="risk-title"><span>OVERALL RISK SCORE</span><strong>{riskLabel(store.metrics.riskScore)}</strong></div>
          <div className="risk-number"><Shield size={27} /> <b>{store.metrics.riskScore.toFixed(0)}</b><span>/100</span></div>
          <div className="risk-bar"><i style={{ width: `${store.metrics.riskScore}%` }} /></div>
          <div className="risk-scale"><span>0</span><span>50</span><span>100</span></div>
        </section>

        <section className="right-section">
          <h3>KEY METRICS</h3>
          <div className="key-metrics-grid">
            <MetricBox icon={Users} label="Max Crowd Density" value={store.metrics.maxCrowdDensity.toLocaleString("en-IN", { maximumFractionDigits: 0 })} unit="people/km²" className={metricClass(store.metrics.crowdDensity, 4.5, 6)} />
            <MetricBox icon={Activity} label="Traffic Congestion" value={`${store.metrics.trafficIndex.toFixed(0)}%`} unit="network load" className={metricClass(store.metrics.trafficIndex, 65, 82)} />
            <MetricBox icon={Ambulance} label="Emergency Access" value={`${store.metrics.emergencyAccessMinutes.toFixed(0)} min`} unit="estimated" className={metricClass(store.metrics.emergencyAccessMinutes, 10, 14)} />
            <MetricBox icon={Bus} label="Public Transport" value={`${store.metrics.publicTransportLoad.toFixed(0)}%`} unit="capacity" className={metricClass(store.metrics.publicTransportLoad, 100, 120)} />
          </div>
        </section>

        <section className="right-section recommendations-list">
          <div className="right-section-title"><h3>AI RECOMMENDATIONS</h3><span>RULE-BASED</span></div>
          {store.recommendations.length === 0 ? (
            <p className="empty-copy">Run the simulation to generate live recommendations.</p>
          ) : (
            store.recommendations.slice(0, 5).map((recommendation) => (
              <button key={recommendation.id} onClick={() => store.applyIntervention(recommendation.id)}>
                <AlertTriangle size={13} />
                <span>{recommendation.title}</span>
                <b>APPLY</b>
              </button>
            ))
          )}
        </section>

        <section className="right-section resource-section">
          <h3>RESOURCE DEPLOYMENT <span>(SUGGESTED)</span></h3>
          <div className="resource-grid">
            <Resource icon={Shield} label="Police Units" value="56" />
            <Resource icon={Ambulance} label="Ambulances" value="14" />
            <Resource icon={Route} label="Barricades" value="18" />
          </div>
        </section>

        <button
          className="download-button"
          onClick={() => downloadSimulationReport({
            scenario: store.scenario,
            metrics: store.metrics,
            interventions: store.interventions,
            trend: store.trend,
          })}
        >
          <Download size={15} /> DOWNLOAD REPORT
        </button>
      </aside>

      <section className="analysis-strip panel">
        <div className="chart-panel">
          <div className="strip-heading"><span>CROWD DENSITY OVER TIME</span><b>LIVE</b></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={store.trend.length ? store.trend : [{ minute: 0, crowdDensity: store.metrics.crowdDensity, riskScore: store.metrics.riskScore }]}>
                <defs>
                  <linearGradient id="crowdFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4141" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff4141" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#202830" vertical={false} />
                <XAxis dataKey="minute" stroke="#6e7882" fontSize={9} tickFormatter={(value: number) => `${Math.floor(value / 60) + 5} PM`} />
                <YAxis stroke="#6e7882" fontSize={9} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "#090d11", border: "1px solid #30363d", fontSize: 11 }} />
                <Area type="monotone" dataKey="crowdDensity" stroke="#ff4141" fill="url(#crowdFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="transport-panel">
          <div className="strip-heading"><span>TRANSPORT USAGE</span><b>MODE SPLIT</b></div>
          <div className="transport-content">
            <ResponsiveContainer width={150} height={128}>
              <PieChart>
                <Pie data={transportData} dataKey="value" innerRadius={36} outerRadius={57} paddingAngle={1} stroke="none">
                  {transportData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="transport-legend">
              {transportData.map((item) => <span key={item.name}><i style={{ background: item.fill }} />{item.name}<b>{item.value}%</b></span>)}
            </div>
          </div>
        </div>

        <div className="intervention-panel">
          <div className="strip-heading"><span>INTERVENTIONS</span><b>{store.interventions.length} ACTIVE</b></div>
          <div className="intervention-list">
            {interventions.map(({ id, label, description, icon: Icon }) => {
              const applied = store.interventions.includes(id);
              return (
                <button key={id} className={applied ? "applied" : ""} disabled={applied} onClick={() => store.applyIntervention(id)}>
                  <Icon size={15} />
                  <span><strong>{label}</strong><small>{description}</small></span>
                  {applied ? <Check size={14} /> : <b>+</b>}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="panel-header"><span>{eyebrow}</span><strong>{title}</strong></div>;
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="scenario-field"><span>{label}</span><div>{icon}{value}</div></div>;
}

function MetricBox({ icon: Icon, label, value, unit, className }: { icon: typeof Users; label: string; value: string; unit: string; className: string }) {
  return <article className={`metric-box ${className}`}><Icon size={15} /><div><span>{label}</span><strong>{value}</strong><small>{unit}</small></div></article>;
}

function Resource({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return <article><Icon size={14} /><strong>{value}</strong><span>{label}</span></article>;
}
