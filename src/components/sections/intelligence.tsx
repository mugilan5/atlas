"use client";

import { ArrowRight, BrainCircuit, CheckCircle2, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { useAtlasStore } from "@/store/use-atlas-store";

export function IntelligenceSection() {
  const metrics = useAtlasStore((state) => state.metrics);
  const recommendations = useAtlasStore((state) => state.recommendations);
  const interventions = useAtlasStore((state) => state.interventions);
  const applyIntervention = useAtlasStore((state) => state.applyIntervention);

  return (
    <section className="workspace-page">
      <div className="page-heading"><div><span>DECISION INTELLIGENCE</span><h1>Policy Recommendations</h1><p>Explainable rule-based guidance generated from the active simulation state.</p></div></div>

      <div className="intelligence-summary">
        <article className="panel intelligence-score"><BrainCircuit size={21} /><span>Current simulated risk</span><strong>{metrics.riskScore.toFixed(0)}/100</strong><p>{metrics.riskScore > 70 ? "Immediate intervention recommended." : metrics.riskScore > 45 ? "Conditions require active monitoring." : "Current intervention set is controlling risk."}</p></article>
        <article className="panel intelligence-score"><TrendingDown size={21} /><span>Emergency access</span><strong>{metrics.emergencyAccessMinutes.toFixed(0)} min</strong><p>Estimated response route under current congestion and road availability.</p></article>
        <article className="panel intelligence-score"><ShieldAlert size={21} /><span>Policies active</span><strong>{interventions.length}</strong><p>Applied policies immediately alter simulation parameters and agent movement.</p></article>
      </div>

      <div className="recommendation-board">
        <article className="panel recommendation-column">
          <div className="board-title"><div><span>RECOMMENDED ACTIONS</span><h2>Prioritised interventions</h2></div><Sparkles size={19} /></div>
          {recommendations.length === 0 ? <div className="intelligence-empty"><CheckCircle2 size={24} /><h3>No urgent action pending</h3><p>Start or continue the simulation to evaluate changing conditions.</p></div> : recommendations.map((item) => <div className="recommendation-card" key={item.id}><div className={`priority ${item.priority}`}>{item.priority}</div><h3>{item.title}</h3><p>{item.rationale}</p><small>{item.expectedImpact}</small><button onClick={() => applyIntervention(item.id)}>Apply intervention <ArrowRight size={14} /></button></div>)}
        </article>

        <aside className="panel model-card"><span>MODEL TRACE</span><h2>Why this is explainable</h2><ol><li>Observe current simulated metrics.</li><li>Compare each metric against explicit thresholds.</li><li>Recommend a policy mapped to the affected metric.</li><li>Apply deterministic modifiers.</li><li>Recalculate outcomes and expose the change.</li></ol><div className="model-disclaimer">No hidden model determines the numerical result in this MVP. Recommendations are rule-based and auditable.</div></aside>
      </div>
    </section>
  );
}
