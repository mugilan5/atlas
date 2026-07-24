"use client";

import {
  Activity,
  Ambulance,
  CheckCircle2,
  Download,
  FileJson,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  downloadMetricsCsv,
  downloadSimulationReport,
} from "@/lib/report";

import { useAtlasStore } from "@/store/use-atlas-store";

export function ReportsSection() {
  const scenario = useAtlasStore(
    (state) => state.scenario,
  );

  const metrics = useAtlasStore(
    (state) => state.metrics,
  );

  const interventions = useAtlasStore(
    (state) => state.interventions,
  );

  const trend = useAtlasStore(
    (state) => state.trend,
  );

  const isIplMatch =
    scenario.scenarioType ===
    "ipl-match";

  const scenarioName = isIplMatch
    ? "Chepauk IPL Match"
    : "YMCA Political Rally";

  const scenarioCategory = isIplMatch
    ? "CRICKET EVENT"
    : "PUBLIC RALLY";

  return (
    <section className="workspace-page reports-page">
      <div className="page-heading">
        <div>
          <span>REPORTING</span>

          <h1>Simulation Reports</h1>

          <p>
            Export the active scenario,
            simulation outcomes,
            interventions and recorded
            trend metrics.
          </p>
        </div>

        <div className="report-heading-status">
          <CheckCircle2 size={15} />

          <div>
            <strong>
              Report data ready
            </strong>

            <span>
              {trend.length} timeline
              checkpoints recorded
            </span>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <article className="panel report-card report-card-primary">
          <div className="report-card-icon">
            <FileJson size={21} />
          </div>

          <div className="report-card-content">
            <span>
              FULL SIMULATION SNAPSHOT
            </span>

            <h2>
              JSON decision report
            </h2>

            <p>
              Includes the scenario
              configuration, current
              metrics, applied policies
              and complete recorded
              timeline.
            </p>
          </div>

          <div className="report-card-footer">
            <small>
              Recommended for complete
              audit and demonstration
              evidence.
            </small>

            <button
              onClick={() =>
                downloadSimulationReport({
                  scenario,
                  metrics,
                  interventions,
                  trend,
                })
              }
            >
              <Download size={15} />
              Download JSON
            </button>
          </div>
        </article>

        <article className="panel report-card">
          <div className="report-card-icon">
            <FileSpreadsheet size={21} />
          </div>

          <div className="report-card-content">
            <span>METRIC HISTORY</span>

            <h2>
              CSV analytics export
            </h2>

            <p>
              Exports crowd density,
              traffic congestion and
              risk score at every
              recorded simulation
              checkpoint.
            </p>
          </div>

          <div className="report-card-footer">
            <small>
              {trend.length > 0
                ? `${trend.length} checkpoints available`
                : "Run the simulation to record checkpoints"}
            </small>

            <button
              disabled={
                trend.length === 0
              }
              onClick={() =>
                downloadMetricsCsv(trend)
              }
            >
              <Download size={15} />
              Download CSV
            </button>
          </div>
        </article>

        <article className="panel report-card compliance">
          <div className="report-card-icon">
            <ShieldCheck size={21} />
          </div>

          <div className="report-card-content">
            <span>MODEL DISCLOSURE</span>

            <h2>
              Simulation limitations
            </h2>

            <p>
              Atlas uses synthetic
              agents, deterministic rules
              and estimated proxy values.
              Results are not official
              public-safety forecasts.
            </p>
          </div>

          <div className="report-disclosure-status">
            <CheckCircle2 size={14} />

            <span>
              Included automatically in
              every JSON report
            </span>
          </div>
        </article>
      </div>

      <article className="panel report-preview">
        <div className="report-preview-header">
          <div>
            <span>ACTIVE REPORT PREVIEW</span>

            <h2>{scenarioName}</h2>

            <p>
              {scenario.location}
            </p>
          </div>

          <div className="report-scenario-badge">
            {scenarioCategory}
          </div>
        </div>

        <div className="report-scenario-summary">
          <div>
            <MapPin size={15} />

            <span>
              <small>Location</small>
              <strong>
                {scenario.location}
              </strong>
            </span>
          </div>

          <div>
            <Users size={15} />

            <span>
              <small>
                Expected attendance
              </small>

              <strong>
                {scenario.expectedCrowd.toLocaleString(
                  "en-IN",
                )}
              </strong>
            </span>
          </div>

          <div>
            <Activity size={15} />

            <span>
              <small>
                Simulation window
              </small>

              <strong>
                {scenario.durationMinutes /
                  60}{" "}
                hours
              </strong>
            </span>
          </div>
        </div>

        <div className="report-kpis">
          <ReportKpi
            icon={ShieldCheck}
            value={`${metrics.riskScore.toFixed(
              0,
            )}/100`}
            label="Risk score"
            tone={
              metrics.riskScore >= 70
                ? "critical"
                : metrics.riskScore >=
                    45
                  ? "warning"
                  : "normal"
            }
          />

          <ReportKpi
            icon={Activity}
            value={`${metrics.trafficIndex.toFixed(
              0,
            )}%`}
            label="Traffic congestion"
          />

          <ReportKpi
            icon={Users}
            value={metrics.crowdDensity.toFixed(
              1,
            )}
            label="People/m²"
          />

          <ReportKpi
            icon={Ambulance}
            value={`${metrics.emergencyAccessMinutes.toFixed(
              0,
            )} min`}
            label="Emergency access"
          />

          <ReportKpi
            icon={CheckCircle2}
            value={String(
              interventions.length,
            )}
            label="Policies applied"
          />
        </div>
      </article>
    </section>
  );
}

function ReportKpi({
  icon: Icon,
  value,
  label,
  tone = "default",
}: {
  icon: typeof Activity;
  value: string;
  label: string;
  tone?:
    | "default"
    | "normal"
    | "warning"
    | "critical";
}) {
  return (
    <div
      className={`report-kpi-card ${tone}`}
    >
      <Icon size={16} />

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
