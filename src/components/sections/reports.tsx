"use client";

import { Download, FileJson, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { downloadMetricsCsv, downloadSimulationReport } from "@/lib/report";
import { useAtlasStore } from "@/store/use-atlas-store";

export function ReportsSection() {
  const scenario = useAtlasStore((state) => state.scenario);
  const metrics = useAtlasStore((state) => state.metrics);
  const interventions = useAtlasStore((state) => state.interventions);
  const trend = useAtlasStore((state) => state.trend);

  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span>REPORTING</span><h1>Simulation Reports</h1><p>Export the active configuration, outcomes, interventions, and trend metrics.</p></div></div>

      <div className="report-grid">
        <article className="panel report-card"><FileJson size={24} /><span>FULL SIMULATION SNAPSHOT</span><h2>JSON decision report</h2><p>Includes scenario configuration, current metrics, active interventions, and the recorded timeline.</p><button onClick={() => downloadSimulationReport({ scenario, metrics, interventions, trend })}><Download size={15} /> Download JSON</button></article>
        <article className="panel report-card"><FileSpreadsheet size={24} /><span>METRIC HISTORY</span><h2>CSV analytics export</h2><p>Exports crowd density, traffic index, and risk score for every recorded simulation checkpoint.</p><button disabled={trend.length === 0} onClick={() => downloadMetricsCsv(trend)}><Download size={15} /> Download CSV</button></article>
        <article className="panel report-card compliance"><ShieldCheck size={24} /><span>DISCLOSURE</span><h2>Simulation limitations</h2><p>ATLAS uses synthetic agents, deterministic rules, and estimated proxy values. Outputs are not official public-safety forecasts.</p><div className="report-status">Disclosure included in every JSON report</div></article>
      </div>

      <article className="panel report-preview"><span>REPORT PREVIEW</span><h2>Marina Beach Leadership Rally</h2><div className="report-kpis"><div><strong>{metrics.riskScore.toFixed(0)}/100</strong><span>Risk score</span></div><div><strong>{metrics.trafficIndex.toFixed(0)}%</strong><span>Traffic index</span></div><div><strong>{metrics.crowdDensity.toFixed(1)}</strong><span>People/m²</span></div><div><strong>{metrics.emergencyAccessMinutes.toFixed(0)} min</strong><span>Emergency access</span></div><div><strong>{interventions.length}</strong><span>Policies applied</span></div></div></article>
    </section>
  );
}
