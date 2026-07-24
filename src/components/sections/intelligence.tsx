"use client";

import {
  Ambulance,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrafficCone,
  Wind,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_OPTIMIZATION_WEIGHTS,
  POLICY_LABELS,
  optimizePolicyPortfolio,
} from "@/optimization/policy-optimizer";

import type {
  OptimizationWeights,
  PolicyCandidate,
} from "@/optimization/policy-optimizer";

import type {
  InterventionId,
} from "@/simulation/types";

import { useAtlasStore } from "@/store/use-atlas-store";

type WeightKey =
  keyof OptimizationWeights;

const WEIGHT_CONTROLS: Array<{
  key: WeightKey;
  label: string;
  description: string;
}> = [
  {
    key: "safety",
    label: "Safety",
    description:
      "Crowd and overall incident risk",
  },
  {
    key: "traffic",
    label: "Traffic",
    description:
      "Road-network congestion",
  },
  {
    key: "emergency",
    label: "Emergency access",
    description:
      "Ambulance and response time",
  },
  {
    key: "pollution",
    label: "Pollution",
    description:
      "Transport-related emissions",
  },
  {
    key: "cost",
    label: "Cost",
    description:
      "Estimated deployment cost",
  },
];

function percentageImprovement(
  baseline: number,
  optimized: number,
) {
  if (baseline === 0) {
    return 0;
  }

  return (
    ((baseline - optimized) /
      baseline) *
    100
  );
}

function formatImprovement(
  baseline: number,
  optimized: number,
) {
  const improvement =
    percentageImprovement(
      baseline,
      optimized,
    );

  if (
    Math.abs(improvement) < 0.05
  ) {
    return "No change";
  }

  return `${
    improvement > 0 ? "↓" : "↑"
  } ${Math.abs(improvement).toFixed(
    0,
  )}%`;
}

function PolicyChips({
  policies,
}: {
  policies: InterventionId[];
}) {
  if (policies.length === 0) {
    return (
      <span className="optimizer-policy-chip baseline">
        No additional policy
      </span>
    );
  }

  return (
    <>
      {policies.map((policy) => (
        <span
          className="optimizer-policy-chip"
          key={policy}
        >
          {POLICY_LABELS[policy]}
        </span>
      ))}
    </>
  );
}

export function IntelligenceSection() {
  const metrics = useAtlasStore(
    (state) => state.metrics,
  );

  const scenario = useAtlasStore(
    (state) => state.scenario,
  );

  const activeInterventions =
    useAtlasStore(
      (state) =>
        state.interventions,
    );

  const applyIntervention =
    useAtlasStore(
      (state) =>
        state.applyIntervention,
    );

  const setActiveView =
    useAtlasStore(
      (state) =>
        state.setActiveView,
    );

  const [weights, setWeights] =
    useState<OptimizationWeights>(
      DEFAULT_OPTIMIZATION_WEIGHTS,
    );

  const [runId, setRunId] =
    useState(1);

  const [optimizing, setOptimizing] =
    useState(false);

  const result = useMemo(
    () =>
      optimizePolicyPortfolio(
        metrics,
        scenario.expectedCrowd,
        weights,
        runId,
      ),
    [
      metrics,
      scenario.expectedCrowd,
      weights,
      runId,
    ],
  );

  const best = result.best;
  const baseline = result.baseline;

  function updateWeight(
    key: WeightKey,
    value: number,
  ) {
    setWeights((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function rerunOptimization() {
    setOptimizing(true);

    window.setTimeout(() => {
      setRunId(
        (current) => current + 1,
      );

      setOptimizing(false);
    }, 550);
  }

  function applyStrategy(
    candidate: PolicyCandidate,
  ) {
    for (const policy of candidate.policies) {
      if (
        !activeInterventions.includes(
          policy,
        )
      ) {
        applyIntervention(policy);
      }
    }

    setActiveView("overview");
  }

  const unappliedPolicies =
    best.policies.filter(
      (policy) =>
        !activeInterventions.includes(
          policy,
        ),
    );

  return (
    <section className="workspace-page optimizer-page">
      <div className="optimizer-heading">
        <div>
          <span>
            MULTI-SCENARIO POLICY ENGINE
          </span>

          <h1>
            AI Policy Optimization
          </h1>

          <p>
            Automatically generate,
            simulate, compare and rank
            policy bundles for the active
            YMCA rally scenario.
          </p>
        </div>

        <button
          type="button"
          className="optimizer-run-button"
          onClick={rerunOptimization}
          disabled={optimizing}
        >
          <RefreshCw
            size={15}
            className={
              optimizing
                ? "optimizer-spinning"
                : ""
            }
          />

          {optimizing
            ? "Optimizing..."
            : `Run ${result.totalSimulations} simulations`}
        </button>
      </div>

      <div className="optimizer-stat-grid">
        <article className="panel optimizer-stat">
          <BrainCircuit size={19} />

          <div>
            <span>
              Scenarios generated
            </span>

            <strong>
              {result.scenarioCount}
            </strong>

            <small>
              Every available policy
              combination
            </small>
          </div>
        </article>

        <article className="panel optimizer-stat">
          <Sparkles size={19} />

          <div>
            <span>
              Simulations compared
            </span>

            <strong>
              {result.totalSimulations}
            </strong>

            <small>
              {result.samplesPerScenario} uncertainty
              runs per strategy
            </small>
          </div>
        </article>

        <article className="panel optimizer-stat">
          <CheckCircle2 size={19} />

          <div>
            <span>
              Pareto strategies
            </span>

            <strong>
              {
                result.paretoFrontier
                  .length
              }
            </strong>

            <small>
              Non-dominated policy
              options
            </small>
          </div>
        </article>

        <article className="panel optimizer-stat">
          <ShieldCheck size={19} />

          <div>
            <span>
              Best strategy score
            </span>

            <strong>
              {best.score.toFixed(1)}
            </strong>

            <small>
              {best.confidence.toFixed(
                0,
              )}
              % simulation confidence
            </small>
          </div>
        </article>
      </div>

      <div className="optimizer-main-grid">
        <aside className="panel optimizer-weights">
          <div className="optimizer-card-title">
            <div>
              <span>
                OBJECTIVE WEIGHTS
              </span>

              <h2>
                Decision priorities
              </h2>
            </div>

            <SlidersHorizontal
              size={18}
            />
          </div>

          <p className="optimizer-muted">
            Increase an objective to make
            it more important in the final
            ranking.
          </p>

          <div className="optimizer-weight-list">
            {WEIGHT_CONTROLS.map(
              (control) => (
                <label
                  className="optimizer-weight-control"
                  key={control.key}
                >
                  <div>
                    <span>
                      {control.label}
                    </span>

                    <strong>
                      {
                        weights[
                          control.key
                        ]
                      }
                      %
                    </strong>
                  </div>

                  <small>
                    {
                      control.description
                    }
                  </small>

                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={
                      weights[
                        control.key
                      ]
                    }
                    onChange={(event) =>
                      updateWeight(
                        control.key,
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                  />
                </label>
              ),
            )}
          </div>

          <div className="optimizer-model-note">
            <strong>
              Auditable optimization
            </strong>

            <p>
              Scores use normalized
              multi-objective ranking,
              Monte Carlo uncertainty and
              Pareto dominance. No
              generative model controls
              the numerical result.
            </p>
          </div>
        </aside>

        <article className="panel optimizer-winner">
          <div className="optimizer-winner-top">
            <div>
              <span className="optimizer-recommended-label">
                <Sparkles size={13} />
                RECOMMENDED STRATEGY
              </span>

              <h2>{best.title}</h2>

              <div className="optimizer-policy-chips">
                <PolicyChips
                  policies={
                    best.policies
                  }
                />
              </div>
            </div>

            <div className="optimizer-score-ring">
              <strong>
                {best.score.toFixed(0)}
              </strong>

              <span>/100</span>
            </div>
          </div>

          <div className="optimizer-outcome-grid">
            <article>
              <ShieldCheck size={16} />

              <span>Safety risk</span>

              <strong>
                {best.metrics.safetyRisk.toFixed(
                  0,
                )}
                /100
              </strong>

              <small>
                {formatImprovement(
                  baseline.metrics
                    .safetyRisk,
                  best.metrics
                    .safetyRisk,
                )}
              </small>
            </article>

            <article>
              <TrafficCone size={16} />

              <span>
                Traffic congestion
              </span>

              <strong>
                {best.metrics.trafficIndex.toFixed(
                  0,
                )}
                %
              </strong>

              <small>
                {formatImprovement(
                  baseline.metrics
                    .trafficIndex,
                  best.metrics
                    .trafficIndex,
                )}
              </small>
            </article>

            <article>
              <Ambulance size={16} />

              <span>
                Emergency access
              </span>

              <strong>
                {best.metrics.emergencyAccessMinutes.toFixed(
                  1,
                )}
                min
              </strong>

              <small>
                {formatImprovement(
                  baseline.metrics
                    .emergencyAccessMinutes,
                  best.metrics
                    .emergencyAccessMinutes,
                )}
              </small>
            </article>

            <article>
              <Wind size={16} />

              <span>
                Pollution score
              </span>

              <strong>
                {best.metrics.pollutionScore.toFixed(
                  0,
                )}
              </strong>

              <small>
                {formatImprovement(
                  baseline.metrics
                    .pollutionScore,
                  best.metrics
                    .pollutionScore,
                )}
              </small>
            </article>

            <article>
              <IndianRupee size={16} />

              <span>
                Deployment cost
              </span>

              <strong>
                ₹
                {best.metrics.costCr.toFixed(
                  2,
                )}
                Cr
              </strong>

              <small>
                Estimated operating cost
              </small>
            </article>
          </div>

          <div className="optimizer-winner-footer">
            <div>
              <strong>
                {best.paretoOptimal
                  ? "Pareto-optimal solution"
                  : "Weighted optimum"}
              </strong>

              <span>
                Ranked #1 across traffic,
                safety, emergency access,
                pollution and cost.
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                applyStrategy(best)
              }
              disabled={
                best.policies.length ===
                  0 ||
                unappliedPolicies.length ===
                  0
              }
            >
              {best.policies.length === 0
                ? "Baseline selected"
                : unappliedPolicies.length ===
                    0
                  ? "Already applied"
                  : "Apply strategy"}

              <ArrowRight size={14} />
            </button>
          </div>
        </article>
      </div>

      <article className="panel optimizer-ranking-panel">
        <div className="optimizer-card-title">
          <div>
            <span>
              RANKED POLICY PORTFOLIO
            </span>

            <h2>
              Scenario comparison
            </h2>
          </div>

          <span className="optimizer-run-version">
            Optimization run #{runId}
          </span>
        </div>

        <div className="optimizer-table-wrap">
          <table className="optimizer-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Strategy</th>
                <th>Safety</th>
                <th>Traffic</th>
                <th>Emergency</th>
                <th>Pollution</th>
                <th>Cost</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {result.ranked
                .slice(0, 10)
                .map((candidate) => (
                  <tr
                    key={
                      candidate.id
                    }
                    className={
                      candidate.rank === 1
                        ? "best"
                        : ""
                    }
                  >
                    <td>
                      <strong>
                        #{candidate.rank}
                      </strong>
                    </td>

                    <td>
                      <div className="optimizer-table-strategy">
                        <strong>
                          {
                            candidate.title
                          }
                        </strong>

                        <span>
                          {candidate
                            .policies
                            .length === 0
                            ? "No additional policy"
                            : candidate.policies
                                .map(
                                  (
                                    policy,
                                  ) =>
                                    POLICY_LABELS[
                                      policy
                                    ],
                                )
                                .join(
                                  " · ",
                                )}
                        </span>

                        {candidate.paretoOptimal && (
                          <b>
                            PARETO
                          </b>
                        )}
                      </div>
                    </td>

                    <td>
                      {candidate.metrics.safetyRisk.toFixed(
                        0,
                      )}
                    </td>

                    <td>
                      {candidate.metrics.trafficIndex.toFixed(
                        0,
                      )}
                      %
                    </td>

                    <td>
                      {candidate.metrics.emergencyAccessMinutes.toFixed(
                        1,
                      )}
                      m
                    </td>

                    <td>
                      {candidate.metrics.pollutionScore.toFixed(
                        0,
                      )}
                    </td>

                    <td>
                      ₹
                      {candidate.metrics.costCr.toFixed(
                        2,
                      )}
                      Cr
                    </td>

                    <td>
                      <strong>
                        {candidate.score.toFixed(
                          1,
                        )}
                      </strong>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
