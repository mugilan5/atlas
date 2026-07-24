"use client";

import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bus,
  CloudSun,
  Download,
  Info,
  Pause,
  Play,
  RotateCcw,
  Route,
  Shield,
  Users,
} from "lucide-react";

import { useState } from "react";

import { AtlasMap } from "@/components/map/atlas-map";
import {
  formatSimulationTime,
  metricClass,
  riskLabel,
} from "@/lib/format";
import { downloadSimulationReport } from "@/lib/report";
import { useAtlasStore } from "@/store/use-atlas-store";

import type {
  SimulationMetrics,
  SimulationStatus,
} from "@/simulation/types";

type ResourceNeedLevel =
  | "normal"
  | "elevated"
  | "critical";

type SuggestedResources = {
  policeUnits: number;
  ambulances: number;
  barricades: number;
  level: ResourceNeedLevel;
  message: string;
};

const KPI_DESCRIPTIONS = {
  overallRisk:
    "A combined 0–100 score based on crowd density, traffic congestion, public-transport overload, emergency response delay, pollution and active interventions. A higher score means greater overall operational risk.",

  crowdDensity:
    "The highest estimated concentration of people near the venue. It is derived from attendee arrivals, expected crowd size and simulated crowd concentration.",

  traffic:
    "Estimated road-network pressure based on simulation time, crowd size, road closures and active transport interventions. A higher percentage means heavier congestion.",

  emergency:
    "Estimated time required for an ambulance or emergency vehicle to reach the venue under the current road availability and traffic conditions.",

  publicTransport:
    "Estimated passenger demand compared with available bus and metro capacity. Values over 100% indicate that the transport network is overloaded.",

  resources:
    "These are planning estimates calculated from the expected crowd, live risk score, crowd density, traffic congestion and emergency access time. They update automatically as the simulation changes.",

  police:
    "Suggested police deployment is based mainly on crowd size, overall risk and crowd concentration.",

  ambulances:
    "Suggested ambulance availability is based on crowd size, overall risk and the current estimated emergency response time.",

  barricades:
    "Suggested barricade requirement is based on crowd size, crowd concentration and traffic pressure around the venue.",
};

export function OverviewSection() {
  const store = useAtlasStore();

  const running =
    store.status === "running";

  const currentTime =
    formatSimulationTime(
      store.scenario.startTime,
      store.minute,
    );

  const [
    populationDraft,
    setPopulationDraft,
  ] = useState(
    store.scenario.expectedCrowd,
  );

  const suggestedResources =
    calculateSuggestedResources(
      store.metrics,
      store.scenario.expectedCrowd,
      store.status,
    );

  function simulateWithPopulation() {
    const clamped = Math.min(
      35_000,
      Math.max(
        25_000,
        populationDraft,
      ),
    );

    setPopulationDraft(clamped);

    store.updateScenario({
      ...store.scenario,
      expectedCrowd: clamped,
    });

    store.start();
  }

  return (
    <div className="overview-layout">
      <aside className="scenario-panel panel">
        <PanelHeader
          eyebrow="SCENARIO"
          title="Live Configuration"
        />

        <Field
          label="Scenario Type"
          value="Political Party Rally"
        />

        <Field
          label="Location"
          value={store.scenario.location}
        />

        <div className="scenario-field">
          <span>
            Population (Expected Crowd)
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="number"
              min={25000}
              max={35000}
              step={1000}
              value={populationDraft}
              onChange={(event) =>
                setPopulationDraft(
                  Number(
                    event.target.value,
                  ),
                )
              }
              style={{ flex: 1 }}
            />

            <button
              className="primary-light-button"
              onClick={
                simulateWithPopulation
              }
            >
              Simulate
            </button>
          </div>
        </div>

        <div className="two-column-fields">
          <Field
            label="Event Starts"
            value="19:30"
          />

          <Field
            label="Arrivals From"
            value={
              store.scenario.startTime
            }
          />
        </div>

        <Field
          label="Weather"
          value={`${store.scenario.weather} · ${store.scenario.temperature}°C`}
          icon={
            <CloudSun size={14} />
          }
        />

        <div className="scenario-detail-box">
          <span>EVENT DETAILS</span>

          <dl>
            <div>
              <dt>Event</dt>
              <dd>
                Political Party Rally
              </dd>
            </div>

            <div>
              <dt>Origins</dt>
              <dd>
                Chennai neighbourhoods
              </dd>
            </div>

            <div>
              <dt>Travel</dt>
              <dd>
                Public transport +
                walking
              </dd>
            </div>

            <div>
              <dt>Venue</dt>
              <dd>
                YMCA Grounds, Nandanam
              </dd>
            </div>
          </dl>
        </div>

        <button
          className="primary-light-button"
          onClick={
            running
              ? store.pause
              : store.start
          }
        >
          {running ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )}

          {running
            ? "PAUSE SIMULATION"
            : "RUN SIMULATION"}
        </button>

        <small className="helper-text">
          25k–35k rally · road-routed
          arrivals · event at 7:30 PM
        </small>

        <div className="data-source-row">
          <span className="live-dot" />
          12 ACTIVE DATA SOURCES
        </div>
      </aside>

      <section className="map-column">
        <div className="map-shell panel">
          <div className="map-status-strip">
            <span>LIVE SIMULATION</span>
            <i className="live-dot" />
            <strong>
              {currentTime}
            </strong>
          </div>

          <AtlasMap />
        </div>

        <div className="timeline-panel panel">
          <div className="timeline-heading">
            <span>
              SIMULATION TIMELINE
            </span>

            <strong>
              {currentTime}
            </strong>
          </div>

          <div className="timeline-controls">
            <button
              onClick={
                running
                  ? store.pause
                  : store.start
              }
              aria-label={
                running
                  ? "Pause"
                  : "Start"
              }
            >
              {running ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>

            <button
              onClick={store.reset}
              aria-label="Reset"
            >
              <RotateCcw size={16} />
            </button>

            <select
              value={store.speed}
              onChange={(event) =>
                store.setSpeed(
                  Number(
                    event.target.value,
                  ) as 1 | 2 | 4,
                )
              }
            >
              <option value={1}>
                1×
              </option>

              <option value={2}>
                2×
              </option>

              <option value={4}>
                4×
              </option>
            </select>

            <div className="timeline-range-wrap">
              <input
                aria-label="Simulation timeline"
                type="range"
                min={0}
                max={
                  store.scenario
                    .durationMinutes
                }
                value={store.minute}
                readOnly
              />

              <div className="timeline-labels">
                <span>05:00 PM</span>
                <span>06:00 PM</span>
                <span>07:00 PM</span>
                <span>08:00 PM</span>
                <span>09:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="intelligence-panel panel">
        <div className="status-line">
          <span>
            SIMULATION STATUS
          </span>

          <strong>
            <i className="live-dot" />

            {store.status.toUpperCase()}
          </strong>
        </div>

        <section className="risk-summary">
          <div className="risk-title">
            <div className="label-with-info">
              <span>
                OVERALL RISK SCORE
              </span>

              <KpiInfo
                text={
                  KPI_DESCRIPTIONS.overallRisk
                }
              />
            </div>

            <strong>
              {riskLabel(
                store.metrics.riskScore,
              )}
            </strong>
          </div>

          <div className="risk-number">
            <Shield size={27} />

            <b>
              {store.metrics.riskScore.toFixed(
                0,
              )}
            </b>

            <span>/100</span>
          </div>

          <div className="risk-bar">
            <i
              style={{
                width: `${store.metrics.riskScore}%`,
              }}
            />
          </div>

          <div className="risk-scale">
            <span>0 · Low</span>
            <span>50 · Medium</span>
            <span>100 · Critical</span>
          </div>
        </section>

        <section className="right-section">
          <h3>KEY METRICS</h3>

          <div className="key-metrics-grid">
            <MetricBox
              icon={Users}
              label="Max Crowd Density"
              value={store.metrics.maxCrowdDensity.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 0,
                },
              )}
              unit="people/km²"
              description={
                KPI_DESCRIPTIONS.crowdDensity
              }
              className={metricClass(
                store.metrics.crowdDensity,
                4.5,
                6,
              )}
            />

            <MetricBox
              icon={Activity}
              label="Traffic Congestion"
              value={`${store.metrics.trafficIndex.toFixed(
                0,
              )}%`}
              unit="network load"
              description={
                KPI_DESCRIPTIONS.traffic
              }
              className={metricClass(
                store.metrics.trafficIndex,
                65,
                82,
              )}
            />

            <MetricBox
              icon={Ambulance}
              label="Emergency Access"
              value={`${store.metrics.emergencyAccessMinutes.toFixed(
                0,
              )} min`}
              unit="estimated response"
              description={
                KPI_DESCRIPTIONS.emergency
              }
              className={metricClass(
                store.metrics
                  .emergencyAccessMinutes,
                10,
                14,
              )}
            />

            <MetricBox
              icon={Bus}
              label="Public Transport"
              value={`${store.metrics.publicTransportLoad.toFixed(
                0,
              )}%`}
              unit="available capacity"
              description={
                KPI_DESCRIPTIONS.publicTransport
              }
              className={metricClass(
                store.metrics
                  .publicTransportLoad,
                100,
                120,
              )}
            />
          </div>
        </section>

        <section className="right-section recommendations-list">
          <div className="right-section-title">
            <h3>
              AI RECOMMENDATIONS
            </h3>

            <span>
              SIMULATION-DRIVEN
            </span>
          </div>

          {store.recommendations.length ===
          0 ? (
            <p className="empty-copy recommendation-empty">
              Run the simulation to
              generate live policy
              recommendations.
            </p>
          ) : (
            store.recommendations
              .slice(0, 5)
              .map(
                (
                  recommendation,
                ) => (
                  <button
                    className={`recommendation-action ${recommendation.priority}`}
                    key={
                      recommendation.id
                    }
                    onClick={() =>
                      store.applyIntervention(
                        recommendation.id,
                      )
                    }
                  >
                    <AlertTriangle
                      size={16}
                    />

                    <span className="recommendation-copy">
                      <strong>
                        {
                          recommendation.title
                        }
                      </strong>

                      <small>
                        {
                          recommendation.rationale
                        }
                      </small>
                    </span>

                    <b>APPLY</b>
                  </button>
                ),
              )
          )}
        </section>

        <section className="right-section resource-section">
          <div className="right-section-title resource-section-heading">
            <h3>
              RESOURCE DEPLOYMENT{" "}
              <span>
                (LIVE SUGGESTION)
              </span>
            </h3>

            <KpiInfo
              text={
                KPI_DESCRIPTIONS.resources
              }
            />
          </div>

          <div className="resource-grid">
            <Resource
              icon={Shield}
              label="Police Units"
              value={
                suggestedResources.policeUnits
              }
              description={
                KPI_DESCRIPTIONS.police
              }
            />

            <Resource
              icon={Ambulance}
              label="Ambulances"
              value={
                suggestedResources.ambulances
              }
              description={
                KPI_DESCRIPTIONS.ambulances
              }
            />

            <Resource
              icon={Route}
              label="Barricades"
              value={
                suggestedResources.barricades
              }
              description={
                KPI_DESCRIPTIONS.barricades
              }
            />
          </div>

          <div
            className={`resource-need-banner ${suggestedResources.level}`}
          >
            <span>
              {suggestedResources.level}
            </span>

            <p>
              {
                suggestedResources.message
              }
            </p>
          </div>
        </section>

        <button
          className="download-button"
          onClick={() =>
            downloadSimulationReport({
              scenario:
                store.scenario,
              metrics: store.metrics,
              interventions:
                store.interventions,
              trend: store.trend,
            })
          }
        >
          <Download size={15} />
          DOWNLOAD REPORT
        </button>
      </aside>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="panel-header">
      <span>{eyebrow}</span>
      <strong>{title}</strong>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="scenario-field">
      <span>{label}</span>

      <div>
        {icon}
        {value}
      </div>
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
  unit,
  className,
  description,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  unit: string;
  className: string;
  description: string;
}) {
  return (
    <article
      className={`metric-box ${className}`}
    >
      <Icon size={15} />

      <div className="metric-content">
        <div className="metric-label-row">
          <span>{label}</span>

          <KpiInfo
            text={description}
            compact
          />
        </div>

        <strong>{value}</strong>
        <small>{unit}</small>
      </div>
    </article>
  );
}

function Resource({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Shield;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="resource-card">
      <Icon size={15} />

      <strong>{value}</strong>

      <div className="resource-label-row">
        <span>{label}</span>

        <KpiInfo
          text={description}
          compact
        />
      </div>
    </article>
  );
}

function KpiInfo({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`kpi-info ${
        compact ? "compact" : ""
      }`}
      tabIndex={0}
      aria-label={text}
    >
      <Info size={compact ? 11 : 13} />

      <span
        className="kpi-tooltip"
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}

function clampResource(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      Math.round(value),
    ),
  );
}

function calculateSuggestedResources(
  metrics: SimulationMetrics,
  expectedCrowd: number,
  status: SimulationStatus,
): SuggestedResources {
  /*
   * These values are transparent planning heuristics
   * for the hackathon MVP. They are not real emergency
   * deployment standards.
   */

  const operatingFactor =
    status === "idle" ? 0.92 : 1;

  const densityPressure =
    Math.max(
      0,
      metrics.crowdDensity - 3,
    );

  const policeUnits =
    clampResource(
      (expectedCrowd / 800 +
        metrics.riskScore * 0.25 +
        densityPressure * 2.1) *
        operatingFactor,
      24,
      96,
    );

  const ambulances =
    clampResource(
      expectedCrowd / 5_000 +
        metrics.emergencyAccessMinutes /
          3.4 +
        metrics.riskScore / 38,
      5,
      24,
    );

  const barricades =
    clampResource(
      expectedCrowd / 2_000 +
        metrics.crowdDensity * 1.55 +
        metrics.trafficIndex / 20,
      12,
      48,
    );

  const critical =
    metrics.riskScore >= 75 ||
    metrics.emergencyAccessMinutes >=
      15 ||
    metrics.crowdDensity >= 7;

  const elevated =
    metrics.riskScore >= 55 ||
    metrics.trafficIndex >= 70 ||
    metrics.publicTransportLoad >=
      105;

  if (critical) {
    return {
      policeUnits,
      ambulances,
      barricades,
      level: "critical",
      message:
        "High operational pressure detected. Prioritise emergency access, crowd separation and rapid-response positioning.",
    };
  }

  if (elevated) {
    return {
      policeUnits,
      ambulances,
      barricades,
      level: "elevated",
      message:
        "Additional standby resources are recommended as crowd and network pressure increase.",
    };
  }

  return {
    policeUnits,
    ambulances,
    barricades,
    level: "normal",
    message:
      "Current conditions can be handled with standard planned deployment and active monitoring.",
  };
}
