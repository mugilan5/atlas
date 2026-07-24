import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO } from "@/data/scenario";
import { advanceAgents, calculateMetrics, createAgents } from "./engine";

describe("ATLAS simulation engine", () => {
  it("generates the same agents for the same configuration", () => {
    expect(createAgents(DEFAULT_SCENARIO, 10)).toEqual(createAgents(DEFAULT_SCENARIO, 10));
  });

  it("advances eligible agents along their routes", () => {
    const agents = createAgents(DEFAULT_SCENARIO, 20).map((agent) => ({ ...agent, departureMinute: 0 }));
    const advanced = advanceAgents(agents, 10, 1, [], DEFAULT_SCENARIO);
    expect(advanced.some((agent, index) => agent.progress > agents[index].progress)).toBe(true);
  });

  it("alternate-road intervention improves traffic and emergency access", () => {
    const agents = createAgents(DEFAULT_SCENARIO, 100);
    const baseline = calculateMetrics(180, agents, [], DEFAULT_SCENARIO);
    const improved = calculateMetrics(180, agents, ["open-alternate-road"], DEFAULT_SCENARIO);
    expect(improved.trafficIndex).toBeLessThan(baseline.trafficIndex);
    expect(improved.emergencyAccessMinutes).toBeLessThan(baseline.emergencyAccessMinutes);
  });
});
