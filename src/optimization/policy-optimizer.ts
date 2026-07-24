import type {
  InterventionId,
  SimulationMetrics,
} from "@/simulation/types";

export type OptimizationWeights = {
  safety: number;
  traffic: number;
  emergency: number;
  pollution: number;
  cost: number;
};

export type OptimizedMetrics = {
  safetyRisk: number;
  trafficIndex: number;
  emergencyAccessMinutes: number;
  pollutionScore: number;
  publicTransportLoad: number;
  costCr: number;
};

export type PolicyCandidate = {
  id: string;
  title: string;
  policies: InterventionId[];
  metrics: OptimizedMetrics;
  score: number;
  rank: number;
  paretoOptimal: boolean;
  confidence: number;
};

export type OptimizationResult = {
  candidates: PolicyCandidate[];
  ranked: PolicyCandidate[];
  paretoFrontier: PolicyCandidate[];
  best: PolicyCandidate;
  baseline: PolicyCandidate;
  scenarioCount: number;
  samplesPerScenario: number;
  totalSimulations: number;
};

type PolicyDefinition = {
  id: InterventionId;
  label: string;
  costCr: number;
  trafficMultiplier: number;
  safetyMultiplier: number;
  emergencyMultiplier: number;
  pollutionMultiplier: number;
  transportMultiplier: number;
};

type RawCandidate = Omit<
  PolicyCandidate,
  "score" | "rank" | "paretoOptimal"
>;

const POLICY_DEFINITIONS: Record<
  InterventionId,
  PolicyDefinition
> = {
  "add-police": {
    id: "add-police",
    label: "Additional police deployment",
    costCr: 1.35,
    trafficMultiplier: 0.97,
    safetyMultiplier: 0.81,
    emergencyMultiplier: 0.91,
    pollutionMultiplier: 0.99,
    transportMultiplier: 1,
  },

  "open-gate": {
    id: "open-gate",
    label: "Additional crowd entry gates",
    costCr: 0.55,
    trafficMultiplier: 0.96,
    safetyMultiplier: 0.76,
    emergencyMultiplier: 0.88,
    pollutionMultiplier: 0.99,
    transportMultiplier: 0.98,
  },

  "add-shuttle-buses": {
    id: "add-shuttle-buses",
    label: "Temporary shuttle buses",
    costCr: 1.05,
    trafficMultiplier: 0.83,
    safetyMultiplier: 0.94,
    emergencyMultiplier: 0.93,
    pollutionMultiplier: 0.84,
    transportMultiplier: 0.76,
  },

  "open-alternate-road": {
    id: "open-alternate-road",
    label: "Alternate emergency corridor",
    costCr: 0.8,
    trafficMultiplier: 0.78,
    safetyMultiplier: 0.9,
    emergencyMultiplier: 0.58,
    pollutionMultiplier: 0.91,
    transportMultiplier: 0.96,
  },
};

export const POLICY_LABELS: Record<
  InterventionId,
  string
> = Object.fromEntries(
  Object.values(POLICY_DEFINITIONS).map(
    (policy) => [policy.id, policy.label],
  ),
) as Record<InterventionId, string>;

export const DEFAULT_OPTIMIZATION_WEIGHTS: OptimizationWeights = {
  safety: 30,
  traffic: 20,
  emergency: 25,
  pollution: 15,
  cost: 10,
};

const POLICY_IDS = Object.keys(
  POLICY_DEFINITIONS,
) as InterventionId[];

const SAMPLE_COUNT = 40;

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function seeded(
  index: number,
  salt: number,
) {
  const value =
    Math.sin(
      index * 12.9898 +
        salt * 78.233,
    ) * 43758.5453;

  return value - Math.floor(value);
}

function mean(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

function standardDeviation(
  values: number[],
) {
  const average = mean(values);

  const variance =
    values.reduce(
      (total, value) =>
        total +
        Math.pow(value - average, 2),
      0,
    ) /
    Math.max(1, values.length);

  return Math.sqrt(variance);
}

function generatePolicyBundles() {
  return Array.from(
    {
      length: Math.pow(
        2,
        POLICY_IDS.length,
      ),
    },
    (_, mask) => {
      const policies =
        POLICY_IDS.filter(
          (_, index) =>
            (mask & (1 << index)) !== 0,
        );

      return {
        mask,
        policies,
      };
    },
  );
}

function titleForPolicies(
  policies: InterventionId[],
) {
  if (policies.length === 0) {
    return "Current policy baseline";
  }

  if (policies.length === POLICY_IDS.length) {
    return "Integrated command strategy";
  }

  const hasPolice =
    policies.includes("add-police");

  const hasGates =
    policies.includes("open-gate");

  const hasShuttles =
    policies.includes(
      "add-shuttle-buses",
    );

  const hasRoad =
    policies.includes(
      "open-alternate-road",
    );

  if (
    hasPolice &&
    hasGates &&
    policies.length === 2
  ) {
    return "Crowd safety strategy";
  }

  if (
    hasShuttles &&
    hasRoad &&
    policies.length === 2
  ) {
    return "Mobility relief strategy";
  }

  if (
    hasPolice &&
    hasRoad &&
    policies.length === 2
  ) {
    return "Emergency response strategy";
  }

  if (
    hasGates &&
    hasShuttles &&
    policies.length === 2
  ) {
    return "Managed arrival strategy";
  }

  if (policies.length === 1) {
    return POLICY_LABELS[policies[0]];
  }

  return policies
    .map((policy) =>
      POLICY_LABELS[policy]
        .replace("Additional ", "")
        .replace("Temporary ", ""),
    )
    .join(" + ");
}

function evaluatePolicyBundle(
  baseline: SimulationMetrics,
  policies: InterventionId[],
  expectedCrowd: number,
  runId: number,
): RawCandidate {
  let trafficMultiplier = 1;
  let safetyMultiplier = 1;
  let emergencyMultiplier = 1;
  let pollutionMultiplier = 1;
  let transportMultiplier = 1;
  let costCr = 0;

  for (const policyId of policies) {
    const policy =
      POLICY_DEFINITIONS[policyId];

    trafficMultiplier *=
      policy.trafficMultiplier;

    safetyMultiplier *=
      policy.safetyMultiplier;

    emergencyMultiplier *=
      policy.emergencyMultiplier;

    pollutionMultiplier *=
      policy.pollutionMultiplier;

    transportMultiplier *=
      policy.transportMultiplier;

    costCr += policy.costCr;
  }

  const hasPolice =
    policies.includes("add-police");

  const hasGates =
    policies.includes("open-gate");

  const hasShuttles =
    policies.includes(
      "add-shuttle-buses",
    );

  const hasRoad =
    policies.includes(
      "open-alternate-road",
    );

  /*
   * Interaction effects model policies that perform
   * better when deployed together.
   */
  if (hasPolice && hasGates) {
    safetyMultiplier *= 0.91;
    emergencyMultiplier *= 0.96;
  }

  if (hasShuttles && hasRoad) {
    trafficMultiplier *= 0.9;
    pollutionMultiplier *= 0.95;
  }

  if (
    hasPolice &&
    hasGates &&
    hasShuttles &&
    hasRoad
  ) {
    /*
     * Shared command infrastructure lowers the
     * combined deployment cost slightly.
     */
    costCr *= 0.94;
  }

  const crowdPressure = clamp(
    expectedCrowd / 30_000,
    0.8,
    1.25,
  );

  const trafficSamples: number[] = [];
  const safetySamples: number[] = [];
  const emergencySamples: number[] = [];
  const pollutionSamples: number[] = [];
  const transportSamples: number[] = [];

  for (
    let sample = 0;
    sample < SAMPLE_COUNT;
    sample += 1
  ) {
    /*
     * Common uncertainty samples ensure every policy
     * bundle is tested under comparable conditions.
     */
    const seed =
      sample + runId * 1_000;

    const trafficNoise =
      0.94 + seeded(seed, 11) * 0.12;

    const safetyNoise =
      0.95 + seeded(seed, 12) * 0.1;

    const emergencyNoise =
      0.93 + seeded(seed, 13) * 0.14;

    const pollutionNoise =
      0.96 + seeded(seed, 14) * 0.08;

    const transportNoise =
      0.95 + seeded(seed, 15) * 0.1;

    const highCrowdPenalty =
      1 +
      Math.max(
        0,
        crowdPressure - 1,
      ) *
        0.18;

    trafficSamples.push(
      clamp(
        baseline.trafficIndex *
          trafficMultiplier *
          trafficNoise *
          highCrowdPenalty,
        4,
        100,
      ),
    );

    safetySamples.push(
      clamp(
        baseline.riskScore *
          safetyMultiplier *
          safetyNoise *
          highCrowdPenalty,
        3,
        100,
      ),
    );

    emergencySamples.push(
      clamp(
        baseline.emergencyAccessMinutes *
          emergencyMultiplier *
          emergencyNoise *
          highCrowdPenalty,
        3,
        40,
      ),
    );

    pollutionSamples.push(
      clamp(
        baseline.pollutionScore *
          pollutionMultiplier *
          pollutionNoise,
        20,
        180,
      ),
    );

    transportSamples.push(
      clamp(
        baseline.publicTransportLoad *
          transportMultiplier *
          transportNoise *
          highCrowdPenalty,
        30,
        170,
      ),
    );
  }

  const riskDeviation =
    standardDeviation(safetySamples);

  const confidence = clamp(
    96 - riskDeviation * 2.5,
    62,
    96,
  );

  return {
    id:
      policies.length === 0
        ? "baseline"
        : policies.slice().sort().join("__"),

    title: titleForPolicies(policies),

    policies,

    metrics: {
      trafficIndex:
        mean(trafficSamples),

      safetyRisk:
        mean(safetySamples),

      emergencyAccessMinutes:
        mean(emergencySamples),

      pollutionScore:
        mean(pollutionSamples),

      publicTransportLoad:
        mean(transportSamples),

      costCr,
    },

    confidence,
  };
}

function lowerIsBetterScore(
  value: number,
  minimum: number,
  maximum: number,
) {
  if (maximum === minimum) {
    return 1;
  }

  return (
    1 -
    (value - minimum) /
      (maximum - minimum)
  );
}

function candidateObjectives(
  candidate: RawCandidate,
) {
  return [
    candidate.metrics.safetyRisk,
    candidate.metrics.trafficIndex,
    candidate.metrics
      .emergencyAccessMinutes,
    candidate.metrics.pollutionScore,
    candidate.metrics.costCr,
  ];
}

function dominates(
  candidate: RawCandidate,
  comparison: RawCandidate,
) {
  const candidateValues =
    candidateObjectives(candidate);

  const comparisonValues =
    candidateObjectives(comparison);

  const noWorse =
    candidateValues.every(
      (value, index) =>
        value <=
        comparisonValues[index] + 0.0001,
    );

  const strictlyBetter =
    candidateValues.some(
      (value, index) =>
        value <
        comparisonValues[index] - 0.0001,
    );

  return noWorse && strictlyBetter;
}

export function optimizePolicyPortfolio(
  baseline: SimulationMetrics,
  expectedCrowd: number,
  weights: OptimizationWeights,
  runId = 1,
): OptimizationResult {
  const bundles =
    generatePolicyBundles();

  const rawCandidates =
    bundles.map(({ policies }) =>
      evaluatePolicyBundle(
        baseline,
        policies,
        expectedCrowd,
        runId,
      ),
    );

  const ranges = {
    safety: rawCandidates.map(
      (candidate) =>
        candidate.metrics.safetyRisk,
    ),

    traffic: rawCandidates.map(
      (candidate) =>
        candidate.metrics.trafficIndex,
    ),

    emergency: rawCandidates.map(
      (candidate) =>
        candidate.metrics
          .emergencyAccessMinutes,
    ),

    pollution: rawCandidates.map(
      (candidate) =>
        candidate.metrics.pollutionScore,
    ),

    cost: rawCandidates.map(
      (candidate) =>
        candidate.metrics.costCr,
    ),
  };

  const range = (
    values: number[],
  ): [number, number] => [
    Math.min(...values),
    Math.max(...values),
  ];

  const safetyRange =
    range(ranges.safety);

  const trafficRange =
    range(ranges.traffic);

  const emergencyRange =
    range(ranges.emergency);

  const pollutionRange =
    range(ranges.pollution);

  const costRange =
    range(ranges.cost);

  const weightTotal = Math.max(
    1,
    weights.safety +
      weights.traffic +
      weights.emergency +
      weights.pollution +
      weights.cost,
  );

  const scoredCandidates =
    rawCandidates.map((candidate) => {
      const score =
        (lowerIsBetterScore(
          candidate.metrics.safetyRisk,
          ...safetyRange,
        ) *
          weights.safety +
          lowerIsBetterScore(
            candidate.metrics.trafficIndex,
            ...trafficRange,
          ) *
            weights.traffic +
          lowerIsBetterScore(
            candidate.metrics
              .emergencyAccessMinutes,
            ...emergencyRange,
          ) *
            weights.emergency +
          lowerIsBetterScore(
            candidate.metrics.pollutionScore,
            ...pollutionRange,
          ) *
            weights.pollution +
          lowerIsBetterScore(
            candidate.metrics.costCr,
            ...costRange,
          ) *
            weights.cost) /
        weightTotal;

      const paretoOptimal =
        !rawCandidates.some(
          (comparison) =>
            comparison.id !==
              candidate.id &&
            dominates(
              comparison,
              candidate,
            ),
        );

      return {
        ...candidate,
        score: clamp(
          score * 100,
          0,
          100,
        ),
        paretoOptimal,
        rank: 0,
      };
    });

  const ranked =
    scoredCandidates
      .slice()
      .sort(
        (first, second) =>
          second.score -
          first.score,
      )
      .map(
        (candidate, index) => ({
          ...candidate,
          rank: index + 1,
        }),
      );

  const candidates =
    scoredCandidates.map(
      (candidate) =>
        ranked.find(
          (rankedCandidate) =>
            rankedCandidate.id ===
            candidate.id,
        ) ?? candidate,
    );

  const paretoFrontier =
    ranked.filter(
      (candidate) =>
        candidate.paretoOptimal,
    );

  const baselineCandidate =
    ranked.find(
      (candidate) =>
        candidate.id === "baseline",
    );

  if (!baselineCandidate) {
    throw new Error(
      "Optimization baseline was not generated.",
    );
  }

  return {
    candidates,
    ranked,
    paretoFrontier,
    best: ranked[0],
    baseline: baselineCandidate,
    scenarioCount: bundles.length,
    samplesPerScenario: SAMPLE_COUNT,
    totalSimulations:
      bundles.length * SAMPLE_COUNT,
  };
}
