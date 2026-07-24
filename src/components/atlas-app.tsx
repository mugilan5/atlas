"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  Boxes,
  BrainCircuit,
  ChevronDown,
  FileText,
  Grid2X2,
  MapPinned,
  Play,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { AssetsSection } from "@/components/sections/assets";
import { IntelligenceSection } from "@/components/sections/intelligence";
import { OverviewSection } from "@/components/sections/overview";
import { ReportsSection } from "@/components/sections/reports";
import { SimulationsSection } from "@/components/sections/simulations";
import type { ViewId } from "@/simulation/types";
import { useAtlasStore } from "@/store/use-atlas-store";

const navItems: Array<{ id: ViewId; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "simulations", label: "Simulations", icon: Play },
  { id: "assets", label: "Assets", icon: Boxes },
  { id: "intelligence", label: "Intelligence", icon: BrainCircuit },
  { id: "reports", label: "Reports", icon: FileText },
];

export function AtlasApp() {
  const activeView = useAtlasStore((state) => state.activeView);
  const setActiveView = useAtlasStore((state) => state.setActiveView);
  const status = useAtlasStore((state) => state.status);



  return (
    <main className="atlas-app-shell">
      <header className="global-header">
        <button
          className="global-brand"
          onClick={() => setActiveView("overview")}
          aria-label="Open ATLAS overview"
        >
          <Image
            src="/logo/atlas-logo-dark.svg"
            alt="ATLAS"
            width={138}
            height={42}
            className="global-brand-logo"
            priority
          />
          <span>Chennai Digital Twin</span>
        </button>
        <nav className="top-navigation" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => setActiveView(item.id)}>{item.label}</button>
          ))}
        </nav>
        <div className="header-actions">
          
          <button><ShieldCheck size={15} /><span>Chennai Corporation</span><ChevronDown size={13} /></button>
        </div>
      </header>

      <aside className="icon-rail">
        <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}><Grid2X2 size={17} /></button>
        <button onClick={() => setActiveView("overview")}><MapPinned size={17} /></button>
        <button onClick={() => setActiveView("assets")}><Boxes size={17} /></button>
        <button onClick={() => setActiveView("intelligence")}><BrainCircuit size={17} /></button>
        <button><Bell size={17} /></button>
        <button onClick={() => setActiveView("reports")}><FileText size={17} /></button>
        <div className="rail-spacer" />
        <button><Settings size={17} /></button>
      </aside>

      <div className="global-status-bar">
        <span><i className={`status-indicator ${status}`} />SYSTEM {status.toUpperCase()}</span>
        <span>MODEL: ATLAS-ABM-01</span>
        <span>DATA: SYNTHETIC</span>
      </div>

      <section className="view-container">
        {activeView === "overview" && <OverviewSection />}
        {activeView === "simulations" && <SimulationsSection />}
        {activeView === "assets" && <AssetsSection />}
        {activeView === "intelligence" && <IntelligenceSection />}
        {activeView === "reports" && <ReportsSection />}
      </section>
    </main>
  );
}

