# ATLAS — Palantir-Inspired Chennai Digital Twin MVP

ATLAS is a browser-based urban simulation dashboard for testing a Marina Beach political-rally scenario before real-world implementation.

## Current build

- Palantir-inspired black, white, and red command-center interface
- Cover experience based on the supplied ATLAS visual theme
- Functional top navigation:
  - Overview
  - Simulations
  - Assets
  - Intelligence
  - Reports
- 1,000 deterministic weighted agents representing the configured crowd
- Five Chennai approach routes
- Start, pause, reset, and 1×/2×/4× controls
- Live risk, crowd, traffic, transport, emergency, pollution, and revenue metrics
- Four policy interventions with visible metric effects
- Explainable rule-based recommendations
- Map layer controls
- JSON and CSV exports
- Mapbox integration with an offline local fallback when no token is configured
- Zustand state management, Recharts analytics, Zod form validation, and TypeScript simulation logic

## Setup

```bash
npm install
cp .env.example .env.local
```

Add an optional public Mapbox token:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_public_mapbox_token
```

The application still works without a token using the synthetic Chennai map fallback.

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

## Demo flow

```text
Enter Command Center
→ Run Marina Beach simulation
→ crowd and traffic conditions worsen
→ review recommendations
→ apply police, gates, shuttles, or alternate-road policies
→ observe improved outcomes
→ export a report
```

## Architecture

```text
Next.js App Router
├── Palantir-inspired React dashboard
├── Zustand simulation/application store
├── TypeScript deterministic agent engine
├── Mapbox GL visualization
│   └── local synthetic-map fallback
├── Recharts analytics
├── Zod scenario validation
└── client-side JSON/CSV reporting
```

## Important limitation

ATLAS MVP uses synthetic agents, simplified assumptions, deterministic intervention modifiers, and estimated proxy metrics. It is a decision-simulation prototype, not an official public-safety prediction system.

## Real Chennai map

The dashboard fetches a real Chennai basemap at runtime using:

- MapLibre GL JS
- CARTO Dark Matter vector basemap
- OpenStreetMap-derived geographic data

No Mapbox access token is required. Internet access is required for map tiles.
