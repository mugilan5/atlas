"use client";

import { AlertTriangle, CheckCircle2, Play, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useAtlasStore } from "@/store/use-atlas-store";

const ScenarioSchema = z.object({
  location: z.string().min(5, "Enter a valid Chennai location"),
  expectedCrowd: z.coerce.number().min(5_000).max(500_000),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  temperature: z.coerce.number().min(15).max(50),
  durationMinutes: z.coerce.number().min(60).max(480),
  roadClosure: z.boolean(),
});

export function SimulationsSection() {
  const scenario = useAtlasStore((state) => state.scenario);
  const updateScenario = useAtlasStore((state) => state.updateScenario);
  const start = useAtlasStore((state) => state.start);
  const reset = useAtlasStore((state) => state.reset);
  const setActiveView = useAtlasStore((state) => state.setActiveView);
  const [form, setForm] = useState(scenario);
  const [message, setMessage] = useState<string | null>(null);

  function saveAndRun() {
    const parsed = ScenarioSchema.safeParse(form);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Invalid scenario configuration");
      return;
    }
    updateScenario({ ...scenario, ...parsed.data });
    setMessage("Scenario validated and loaded.");
    setTimeout(() => {
      setActiveView("overview");
      start();
    }, 250);
  }

  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div><span>SCENARIO LAB</span><h1>Simulation Configuration</h1><p>Define the initial conditions for the Marina Beach public-event simulation.</p></div>
        <div className="heading-actions"><button onClick={reset}><RotateCcw size={15} /> Reset</button><button className="red-action" onClick={saveAndRun}><Play size={15} /> Save & Run</button></div>
      </div>

      <div className="config-grid">
        <article className="config-card panel">
          <h2>Core parameters</h2>
          <label>Scenario type<select value="political-rally" disabled><option>Political Rally</option></select></label>
          <label>Location<input value={form.location} onChange={(event: { target: { value: string } }) => setForm({ ...form, location: event.target.value })} /></label>
          <div className="form-two-col">
            <label>Expected crowd<input type="number" value={form.expectedCrowd} onChange={(event: { target: { value: string } }) => setForm({ ...form, expectedCrowd: Number(event.target.value) })} /></label>
            <label>Start time<input type="time" value={form.startTime} onChange={(event: { target: { value: string } }) => setForm({ ...form, startTime: event.target.value })} /></label>
          </div>
          <div className="form-two-col">
            <label>Temperature °C<input type="number" value={form.temperature} onChange={(event: { target: { value: string } }) => setForm({ ...form, temperature: Number(event.target.value) })} /></label>
            <label>Duration minutes<input type="number" value={form.durationMinutes} onChange={(event: { target: { value: string } }) => setForm({ ...form, durationMinutes: Number(event.target.value) })} /></label>
          </div>
          <label className="toggle-row"><input type="checkbox" checked={form.roadClosure} onChange={(event: { target: { checked: boolean } }) => setForm({ ...form, roadClosure: event.target.checked })} /><span>Simulate coastal road closure</span></label>
          {message && <div className={message.includes("validated") ? "form-message success" : "form-message error"}>{message.includes("validated") ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{message}</div>}
          <button className="full-red-button" onClick={saveAndRun}><Save size={16} /> Load Scenario</button>
        </article>

        <article className="config-card panel">
          <h2>Model assumptions</h2>
          <Assumption label="Rendered agents" value="1,000" detail="One synthetic agent represents a weighted group of attendees." />
          <Assumption label="Travel corridors" value="5" detail="Predefined Chennai approach routes keep the MVP deterministic." />
          <Assumption label="Simulation tick" value="1 minute" detail="Playback runs at 1×, 2×, or 4× accelerated speed." />
          <Assumption label="Prediction method" value="Agent rules" detail="No claim of scientifically calibrated real-world forecasting." />
          <div className="warning-note"><AlertTriangle size={17} /><p>All outputs are synthetic estimates for demonstrating policy-testing workflows.</p></div>
        </article>

        <article className="scenario-preview panel">
          <span>ACTIVE PRESET</span><h2>Marina Beach Leadership Rally</h2>
          <div className="preview-stat"><strong>{form.expectedCrowd.toLocaleString("en-IN")}</strong><span>expected attendees</span></div>
          <div className="preview-stat"><strong>{form.durationMinutes / 60} hours</strong><span>simulation window</span></div>
          <div className="preview-stat"><strong>{form.roadClosure ? "Enabled" : "Disabled"}</strong><span>road closure</span></div>
          <button onClick={() => { setForm(scenario); setMessage(null); }}><RotateCcw size={15} /> Restore active values</button>
        </article>
      </div>
    </section>
  );
}

function Assumption({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="assumption-row"><div><span>{label}</span><p>{detail}</p></div><strong>{value}</strong></div>;
}
