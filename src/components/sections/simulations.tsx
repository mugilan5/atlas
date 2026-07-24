"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";

import { useState } from "react";
import { z } from "zod";

import {
  CHEPAUK_IPL_SCENARIO,
  YMCA_RALLY_SCENARIO,
} from "@/data/scenario";

import type {
  ScenarioConfig,
} from "@/simulation/types";

import { useAtlasStore } from "@/store/use-atlas-store";

const ScenarioSchema = z.object({
  location: z
    .string()
    .min(
      5,
      "Enter a valid Chennai location",
    ),

  expectedCrowd: z.coerce
    .number()
    .min(5_000)
    .max(500_000),

  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/),

  temperature: z.coerce
    .number()
    .min(15)
    .max(50),

  durationMinutes: z.coerce
    .number()
    .min(60)
    .max(480),

  roadClosure: z.boolean(),
});

export function SimulationsSection() {
  const scenario =
    useAtlasStore(
      (state) => state.scenario,
    );

  const updateScenario =
    useAtlasStore(
      (state) =>
        state.updateScenario,
    );

  const start =
    useAtlasStore(
      (state) => state.start,
    );

  const reset =
    useAtlasStore(
      (state) => state.reset,
    );

  const setActiveView =
    useAtlasStore(
      (state) =>
        state.setActiveView,
    );

  const [form, setForm] =
    useState<ScenarioConfig>(
      scenario,
    );

  const [message, setMessage] =
    useState<string | null>(null);

  const isIplMatch =
    form.scenarioType ===
    "ipl-match";

  function selectPreset(
    scenarioType:
      | "political-rally"
      | "ipl-match",
  ) {
    const preset =
      scenarioType === "ipl-match"
        ? CHEPAUK_IPL_SCENARIO
        : YMCA_RALLY_SCENARIO;

    setForm({
      ...preset,
    });

    setMessage(
      `${
        scenarioType === "ipl-match"
          ? "Chepauk IPL match"
          : "YMCA rally"
      } preset selected.`,
    );
  }

  function saveAndRun() {
    const parsed =
      ScenarioSchema.safeParse(
        form,
      );

    if (!parsed.success) {
      setMessage(
        parsed.error.issues[0]
          ?.message ??
          "Invalid scenario configuration",
      );

      return;
    }

    updateScenario({
      ...form,
      ...parsed.data,
    });

    setMessage(
      "Scenario validated and loaded.",
    );

    setTimeout(() => {
      setActiveView("overview");
      start();
    }, 250);
  }

  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <span>SCENARIO LAB</span>

          <h1>
            Simulation Configuration
          </h1>

          <p>
            Select and configure a
            Chennai public-event
            simulation.
          </p>
        </div>

        <div className="heading-actions">
          <button onClick={reset}>
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            className="red-action"
            onClick={saveAndRun}
          >
            <Play size={15} />
            Save & Run
          </button>
        </div>
      </div>

      <div className="scenario-preset-grid">
        <button
          className={
            !isIplMatch
              ? "scenario-preset-card active"
              : "scenario-preset-card"
          }
          onClick={() =>
            selectPreset(
              "political-rally",
            )
          }
        >
          <span>SCENARIO 01</span>
          <strong>
            YMCA Political Rally
          </strong>
          <small>
            25,000–35,000 attendees
          </small>
        </button>

        <button
          className={
            isIplMatch
              ? "scenario-preset-card active"
              : "scenario-preset-card"
          }
          onClick={() =>
            selectPreset(
              "ipl-match",
            )
          }
        >
          <span>SCENARIO 02</span>
          <strong>
            Chepauk IPL Match
          </strong>
          <small>
            Up to 38,000 spectators
          </small>
        </button>
      </div>

      <div className="config-grid">
        <article className="config-card panel">
          <h2>Core parameters</h2>

          <label>
            Scenario type

            <select
              value={form.scenarioType}
              onChange={(event) =>
                selectPreset(
                  event.target.value as
                    | "political-rally"
                    | "ipl-match",
                )
              }
            >
              <option value="political-rally">
                Political Rally
              </option>

              <option value="ipl-match">
                IPL Cricket Match
              </option>
            </select>
          </label>

          <label>
            Location

            <input
              value={form.location}
              onChange={(event) =>
                setForm({
                  ...form,
                  location:
                    event.target.value,
                })
              }
            />
          </label>

          <div className="form-two-col">
            <label>
              Expected crowd

              <input
                type="number"
                value={
                  form.expectedCrowd
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    expectedCrowd:
                      Number(
                        event.target
                          .value,
                      ),
                  })
                }
              />
            </label>

            <label>
              Arrivals begin

              <input
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm({
                    ...form,
                    startTime:
                      event.target
                        .value,
                  })
                }
              />
            </label>
          </div>

          <div className="form-two-col">
            <label>
              Temperature °C

              <input
                type="number"
                value={
                  form.temperature
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    temperature:
                      Number(
                        event.target
                          .value,
                      ),
                  })
                }
              />
            </label>

            <label>
              Duration minutes

              <input
                type="number"
                value={
                  form.durationMinutes
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    durationMinutes:
                      Number(
                        event.target
                          .value,
                      ),
                  })
                }
              />
            </label>
          </div>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={
                form.roadClosure
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  roadClosure:
                    event.target
                      .checked,
                })
              }
            />

            <span>
              Simulate nearby road
              restriction
            </span>
          </label>

          {message && (
            <div
              className={
                message.includes(
                  "validated",
                ) ||
                message.includes(
                  "selected",
                )
                  ? "form-message success"
                  : "form-message error"
              }
            >
              {message.includes(
                "validated",
              ) ||
              message.includes(
                "selected",
              ) ? (
                <CheckCircle2
                  size={15}
                />
              ) : (
                <AlertTriangle
                  size={15}
                />
              )}

              {message}
            </div>
          )}

          <button
            className="full-red-button"
            onClick={saveAndRun}
          >
            <Save size={16} />
            Load Scenario
          </button>
        </article>

        <article className="config-card panel">
          <h2>Model assumptions</h2>

          <Assumption
            label="Rendered agents"
            value={
              isIplMatch
                ? "650–900"
                : "625–875"
            }
            detail="Each visible dot represents a weighted group of attendees."
          />

          <Assumption
            label="Travel corridors"
            value="Live routes"
            detail="Mapbox Directions keeps visible spectators on mapped travel routes."
          />

          <Assumption
            label="Simulation tick"
            value="1 minute"
            detail="Playback runs at 1×, 2× or 4× accelerated speed."
          />

          <Assumption
            label="Prediction method"
            value="Agent rules"
            detail="Synthetic estimates demonstrate policy-testing workflows."
          />

          <div className="warning-note">
            <AlertTriangle
              size={17}
            />

            <p>
              Outputs are synthetic
              hackathon estimates and
              are not official crowd or
              emergency-planning
              standards.
            </p>
          </div>
        </article>

        <article className="scenario-preview panel">
          <span>ACTIVE PRESET</span>

          <h2>
            {isIplMatch
              ? "Chepauk IPL Match"
              : "YMCA Political Rally"}
          </h2>

          <div className="preview-stat">
            <strong>
              {form.expectedCrowd.toLocaleString(
                "en-IN",
              )}
            </strong>

            <span>
              expected attendees
            </span>
          </div>

          <div className="preview-stat">
            <strong>
              {form.durationMinutes /
                60}{" "}
              hours
            </strong>

            <span>
              simulation window
            </span>
          </div>

          <div className="preview-stat">
            <strong>
              {form.roadClosure
                ? "Enabled"
                : "Disabled"}
            </strong>

            <span>road restriction</span>
          </div>

          <button
            onClick={() => {
              setForm(scenario);
              setMessage(null);
            }}
          >
            <RotateCcw size={15} />
            Restore active values
          </button>
        </article>
      </div>
    </section>
  );
}

function Assumption({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="assumption-row">
      <div>
        <span>{label}</span>
        <p>{detail}</p>
      </div>

      <strong>{value}</strong>
    </div>
  );
}
