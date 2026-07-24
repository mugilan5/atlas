import type { InterventionId, ScenarioConfig, SimulationMetrics, TrendPoint } from "@/simulation/types";

export function downloadSimulationReport(input: {
  scenario: ScenarioConfig;
  metrics: SimulationMetrics;
  interventions: InterventionId[];
  trend: TrendPoint[];
}) {
  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Synthetic agents and estimated metrics; not an official public-safety prediction.",
    ...input,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atlas-simulation-report-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadMetricsCsv(trend: TrendPoint[]) {
  const header = "minute,crowdDensity,trafficIndex,riskScore";
  const rows = trend.map((point) =>
    [point.minute, point.crowdDensity.toFixed(2), point.trafficIndex.toFixed(2), point.riskScore.toFixed(2)].join(","),
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atlas-metrics-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
