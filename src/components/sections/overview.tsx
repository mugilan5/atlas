"use client";

import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bus,
  CloudSun,
  Download,
  Pause,
  Play,
  RotateCcw,
  Route,
  Shield,
  Users,
} from "lucide-react";

import { useState } from "react";
import { downloadSimulationReport } from "@/lib/report";
import { formatSimulationTime, metricClass, riskLabel } from "@/lib/format";
import { useAtlasStore } from "@/store/use-atlas-store";
import { AtlasMap } from "@/components/map/atlas-map";

export function OverviewSection() {
  const store = useAtlasStore();
  const running = store.status === "running";
  const currentTime = formatSimulationTime(store.scenario.startTime, store.minute);
  const [populationDraft, setPopulationDraft] = useState(store.scenario.expectedCrowd);

  function simulateWithPopulation() {
    const clamped = Math.min(35_000, Math.max(25_000, populationDraft));
    setPopulationDraft(clamped);
    store.updateScenario({ ...store.scenario, expectedCrowd: clamped });
    store.start();
  }

  return (
    <div className="overview-layout">
      <aside className="scenario-panel panel">
        <PanelHeader eyebrow="SCENARIO" title="Live Configuration" />

        <Field label="Scenario Type" value="Political Party Rally" />
        <Field label="Location" value={store.scenario.location} />
        <div className="scenario-field">
          <span>Population (Expected Crowd)</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              min={25000}
              max={35000}
              step={1000}
              value={populationDraft}
              onChange={(event: { target: { value: string } }) => setPopulationDraft(Number(event.target.value))}
              style={{ flex: 1 }}
            />
            <button className="primary-light-button" onClick={simulateWithPopulation}>
              Simulate
            </button>
          </div>
        </div>
        <div className="two-column-fields">
          <Field label="Event Starts" value="19:30" />
          <Field label="Arrivals From" value={store.scenario.startTime} />
        </div>
        <Field
          label="Weather"
          value={`${store.scenario.weather} · ${store.scenario.temperature}°C`}
          icon={<CloudSun size={14} />}
        />

        <div className="scenario-detail-box">
          <span>EVENT DETAILS</span>
          <dl>
            <div><dt>Event</dt><dd>Political Party Rally</dd></div>
            <div><dt>Origins</dt><dd>Chennai neighbourhoods</dd></div>
            <div><dt>Travel</dt><dd>Public transport + walking</dd></div>
            <div><dt>Venue</dt><dd>YMCA Grounds, Nandanam</dd></div>
          </dl>
        </div>

        <button className="primary-light-button" onClick={running ? store.pause : store.start}>
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? "PAUSE SIMULATION" : "RUN SIMULATION"}
        </button>
        <small className="helper-text">25k–35k rally · road-routed arrivals · event at 7:30 PM</small>

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
