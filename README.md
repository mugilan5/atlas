# Atlas

## AI-Powered Digital Twin Platform for Smarter Public Decision Making

<img width="6772" height="3716" alt="Frame 37" src="https://github.com/user-attachments/assets/ac14a0f8-7e1a-4e1a-8dde-71f230bbc46e" />


Atlas enables governments and organizations to test critical decisions before they affect real people.

By creating a living digital twin of a city populated with autonomous AI citizens, Atlas simulates how people move, commute, gather, and respond to changing conditions. Whether it's a flood, a political rally, a road closure, or a new transport policy, decision-makers can understand the consequences before lives, time, and public resources are put at risk.

Every simulation provides real-time insights into traffic, crowd movement, emergency accessibility, pollution, and public infrastructure. Helping authorities make decisions that are safer, faster, and more informed.

---

# Team

**Team Name:** Atlas

| Name               | Role                          |
| ------------------ | ----------------------------- |
| Naazim Jaleel      | Product Lead & UI/UX Designer |
| Mugilan            | Full Stack Developer          |
| Aristo Don Annucio | Full Stack Developer          |

---

# Problem Statement
<img width="1920" height="1080" alt="3" src="https://github.com/user-attachments/assets/0d58b695-53a5-474b-8b64-a54481724dee" />

Every major public decision impacts thousands—sometimes millions—of people.

A road closure can delay ambulances.

An overcrowded venue can become dangerous.

Poor evacuation planning can cost lives.

A transport policy can leave entire communities disconnected.

Today, governments largely depend on historical data and static reports. These explain what happened yesterday, but cannot reliably predict what could happen tomorrow.

Without the ability to safely test decisions beforehand, authorities are forced to react after problems occur—leading to congestion, overwhelmed emergency services, economic losses, environmental damage, and, in critical situations, preventable loss of life.

---

# Solution
<img width="1920" height="1080" alt="6" src="https://github.com/user-attachments/assets/ca9028b9-0267-46c3-92d4-3d95e004236c" />


Atlas gives governments a safe environment to predict before they act.

Using autonomous AI citizens with realistic daily routines, transportation preferences, destinations, and behavioral patterns, Atlas recreates how an entire city responds to change.

Decision-makers can simulate multiple scenarios, compare outcomes, identify risks, and choose the safest strategy before implementing policies in the real world.

Instead of reacting to crises, cities can anticipate them.

Instead of guessing, they can simulate.

Instead of learning from disasters, they can help prevent them.

---

# Features

<img width="1920" height="1080" alt="9" src="https://github.com/user-attachments/assets/9fa0fbb3-4632-482f-a20c-6df770d3598b" />


## AI Citizen Simulation

* Autonomous agent-based citizens
* Independent decision-making
* Dynamic behavioral responses
* Realistic mobility and crowd movement

---

## Digital Twin Visualization

* Interactive city-scale digital twin
* Real-world map visualization using Mapbox
* Live visualization of AI citizen movement
* Dynamic event and infrastructure overlays

---

## Scenario Simulation

Create and evaluate real-world scenarios, including:

* Political rallies
* Road closures
* Metro fare revisions
* Infrastructure development
* Emergency evacuations
* Public gatherings
* Disaster response planning

---

## Real-Time Analytics Dashboard

Monitor live simulation metrics, including:

* Traffic congestion
* Crowd density
* Pollution estimates
* Public transportation usage
* Government revenue projections
* Emergency response accessibility

---

## Policy Testing

Evaluate multiple intervention strategies before implementation, including:

* Opening or closing roads
* Police deployment planning
* Temporary shuttle services
* Additional entry and exit points
* Traffic diversions
* Public transport optimization

Each intervention can be compared instantly to determine the most effective outcome.

---

## Predictive Decision Intelligence

Atlas enables decision-makers to answer critical questions before implementing policies, such as:

* How will a road closure affect city-wide traffic?
* Will a public event create dangerous crowd density?
* Can emergency services access critical locations efficiently?
* Which policy produces the safest and most efficient outcome?

---

# Vision

Atlas aims to become the decision intelligence platform for modern cities by enabling governments to test policies, infrastructure projects, and emergency response strategies in a virtual environment before applying them in the real world.

Rather than reacting to incidents after they occur, Atlas empowers authorities to anticipate outcomes, reduce risk, and make informed, data-driven decisions through AI-powered digital twin simulation.

---
## Complete Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend Framework** | Next.js 15 (App Router) | Builds the web application and dashboard interface. |
| **Programming Language** | TypeScript | Ensures type safety, maintainability, and scalability. |
| **UI Library** | React 19 | Component-based frontend development. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for responsive UI design. |
| **UI Components** | shadcn/ui | Pre-built, accessible UI components. |
| **Icons** | Lucide React | Lightweight and customizable icon library. |
| **Interactive Maps** | Mapbox GL JS | Renders the city's digital twin and geospatial visualizations. |
| **Geospatial Analysis** | Turf.js | Performs spatial operations such as distance calculations, polygons, and route analysis. |
| **Simulation Engine** | Custom Agent-Based Simulation (TypeScript) | Simulates autonomous AI citizens and their interactions within the city. |
| **Background Processing** | Web Workers | Executes simulation logic without blocking the user interface. |
| **State Management** | Zustand | Manages application and simulation state efficiently. |
| **Charts & Analytics** | Recharts | Displays real-time simulation metrics and analytics. |
| **Validation** | Zod | Validates API requests and simulation configurations. |
| **Data Format** | GeoJSON | Stores roads, buildings, hospitals, event zones, and other geospatial data. |
| **Static Storage** | JSON & Local Storage | Stores predefined scenarios and simulation preferences for the MVP. |
| **Backend APIs** | Next.js Route Handlers | Provides lightweight server-side endpoints for AI-assisted features. |
| **AI Integration (Optional)** | OpenAI API | Converts natural language into simulation scenarios and generates policy recommendations. |
| **Testing** | Vitest & Playwright | Unit testing, integration testing, and end-to-end testing. |
| **Deployment** | Vercel | Deploys the application with optimized performance. |
| **Version Control** | Git & GitHub | Source code management and collaborative development. |

### Technology Overview

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Mapping** | Mapbox GL JS, Turf.js, GeoJSON |
| **Simulation** | Custom Agent-Based Simulation Engine, Web Workers |
| **State Management** | Zustand |
| **Visualization** | Recharts |
| **Backend** | Next.js Route Handlers |
| **AI** | OpenAI API (Optional) |
| **Testing** | Vitest, Playwright |
| **Deployment** | Vercel |
| **Version Control** | Git, GitHub |

---

## System Architecture

Atlas follows a modular architecture where user inputs are processed by an agent-based simulation engine that evaluates policy changes and visualizes their impact on a real-time digital twin of the city.

```mermaid
flowchart LR

    A[Government Authority / Decision Maker]

    A --> B[Atlas Web Dashboard]

    subgraph Frontend
        B
        C[Scenario Configuration]
        D[Mapbox Digital Twin]
        E[Analytics Dashboard]
        F[Policy Controls]
    end

    B --> C
    B --> D
    B --> E
    B --> F

    C --> G[Agent-Based Simulation Engine]
    F --> G

    subgraph Simulation Core
        G
        H[AI Citizen Generator]
        I[Behaviour Engine]
        J[Policy Evaluation Engine]
        K[Metrics Calculator]
    end

    G --> H
    H --> I
    I --> J
    J --> K

    K --> D
    K --> E

    subgraph Data Sources
        L[GeoJSON City Data]
        M[Mapbox Maps]
        N[Scenario Presets]
    end

    L --> G
    M --> D
    N --> C

    subgraph Optional AI Services
        O[LLM Scenario Parser]
        P[Policy Recommendation Engine]
    end

    C --> O
    O --> G
    K --> P
    P --> E
```

### Architecture Components

| Component | Responsibility |
|----------|----------------|
| **Atlas Dashboard** | Primary interface for configuring scenarios and visualizing simulation outcomes. |
| **Scenario Configuration** | Captures event details, policy changes, and simulation parameters. |
| **Mapbox Digital Twin** | Displays the virtual city, AI citizen movement, heatmaps, and infrastructure layers. |
| **Agent-Based Simulation Engine** | Coordinates the complete simulation lifecycle and executes AI citizen behavior. |
| **AI Citizen Generator** | Creates autonomous citizens with individual routines, travel preferences, and behavioral attributes. |
| **Behaviour Engine** | Determines how each citizen reacts to events, congestion, and policy changes. |
| **Policy Evaluation Engine** | Applies interventions such as road closures, additional exits, police deployment, or transport modifications. |
| **Metrics Calculator** | Computes key performance indicators including congestion, crowd density, pollution, emergency accessibility, and public transport utilization. |
| **GeoJSON Data** | Provides geographic information including roads, buildings, hospitals, metro stations, and event zones. |
| **Optional AI Services** | Converts natural language into simulation scenarios and generates policy recommendations using an LLM. |

---

## Detailed Workflow

<img width="1920" height="1080" alt="7" src="https://github.com/user-attachments/assets/9efae196-3d59-4481-b0cb-20d3b8dfbac4" />
<img width="1920" height="1080" alt="8" src="https://github.com/user-attachments/assets/8f472565-177e-4f81-a353-c894f3c1853b" />


```mermaid
flowchart LR

A[Configure Scenario]
--> B[Load City Data]

B --> C[Generate AI Citizens]

C --> D[Run Agent-Based Simulation]

D --> E[Apply Policies & Interventions]

E --> F[Calculate Metrics]

F --> G[Visualize Results]

G --> H[Support Decision Making]
```

### Workflow

<img width="1920" height="1080" alt="14" src="https://github.com/user-attachments/assets/00f3689c-3d14-4e0f-a14a-6bc7b84fd098" />


1. **Configure Scenario** – Select an event, location, and simulation parameters.
2. **Load City Data** – Initialize the digital twin using GeoJSON and map data.
3. **Generate AI Citizens** – Create autonomous citizens with unique behaviors and travel patterns.
4. **Run Simulation** – Simulate citizen movement and interactions in real time.
5. **Apply Interventions** – Test policies such as road closures, police deployment, or shuttle services.
6. **Calculate Metrics** – Measure traffic, crowd density, emergency access, pollution, and other KPIs.
7. **Visualize Results** – Display live insights through maps, charts, and analytics.
8. **Support Decision Making** – Compare outcomes and identify the most effective strategy before real-world implementation.

---
## Folder Structure

```text
atlas/
├── public/
│   ├── data/
│   │   ├── roads.geojson
│   │   ├── buildings.geojson
│   │   ├── hospitals.geojson
│   │   └── event-zones.geojson
│   └── assets/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── simulation/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── styles/
│
├── docs/
├── package.json
├── README.md
└── tsconfig.json
```

### Directory Overview

| Directory | Description |
|-----------|-------------|
| `public/data` | GeoJSON files containing roads, buildings, hospitals, and event zones. |
| `src/app` | Next.js application routes and pages. |
| `src/components` | Reusable UI components including dashboard panels, maps, and charts. |
| `src/simulation` | Agent-based simulation engine and policy evaluation logic. |
| `src/lib` | Shared libraries and helper functions. |
| `src/stores` | Zustand state management for simulation and UI state. |
| `src/types` | TypeScript interfaces and type definitions. |
| `src/utils` | Utility functions and common helpers. |
| `docs` | Project documentation, diagrams, and supporting assets. |

## Installation & Usage Guide

### Prerequisites

- Node.js 20+
- npm
- Git
- Mapbox Access Token

### Installation

1. Clone the repository.

```bash
git clone https://github.com/mugilan5/atlas.git
cd atlas
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env.local` file and add your Mapbox access token.

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

4. Start the development server.

```bash
npm run dev
```

5. Open the application in your browser.

```
http://localhost:3000
```

---

## Usage

1. Launch the Atlas dashboard.
2. Select or configure a simulation scenario.
3. Run the agent-based simulation.
4. Observe real-time AI citizen movement and analytics.
5. Apply policy interventions such as road closures or additional shuttle services.
6. Compare the simulation outcomes to support decision-making.

---

## API & Database Documentation

### API Endpoints

Atlas uses lightweight Next.js Route Handlers for optional AI-powered features.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/parse-scenario` | POST | Converts natural language into structured simulation parameters. *(Optional)* |
| `/api/recommendations` | POST | Generates AI-assisted policy recommendations based on simulation metrics. *(Optional)* |
| `/api/health` | GET | Returns the application health status. |

---

### Database

The current MVP does **not** use a dedicated database.

Simulation data is managed using:

- **GeoJSON** for map and infrastructure data
- **JSON** for predefined scenarios
- **Local Storage** for temporary simulation preferences

This lightweight approach keeps the application fast, portable, and easy to deploy during the hackathon.

Future versions may integrate **PostgreSQL** or **Supabase** for persistent storage of simulation scenarios, analytics, and historical reports.

---

## AI/ML Workflow

Atlas uses an **Agent-Based AI Simulation** approach where autonomous virtual citizens independently make decisions based on predefined behavioral rules. An optional Large Language Model (LLM) can assist in converting natural language into simulation scenarios and generating policy recommendations.

```mermaid
flowchart LR

A[Scenario Input]
--> B[Generate AI Citizens]

B --> C[Agent-Based Simulation]

C --> D[Citizen Decision Making]

D --> E[Metrics Calculation]

E --> F[Dashboard Visualization]

F --> G[Policy Recommendations]
```

### Workflow

1. **Scenario Input** – The user defines an event or policy change.
2. **AI Citizen Generation** – Autonomous citizens are created with unique travel patterns and behaviors.
3. **Agent-Based Simulation** – Citizens independently respond to the simulated environment.
4. **Decision Making** – Each agent adapts to factors such as congestion, road closures, and transportation availability.
5. **Metrics Calculation** – The system computes traffic, crowd density, pollution, and emergency accessibility.
6. **Policy Recommendations** *(Optional)* – An LLM can suggest interventions based on the simulation results.

---

## Hardware Components

Atlas is a **software-only** platform and does not require any dedicated hardware components, sensors, microcontrollers, or embedded systems.

The following hardware was used during development and demonstration:

| Hardware | Purpose |
|----------|---------|
| Laptop/Desktop | Application development and simulation execution |
| Internet Connection | Mapbox services and cloud deployment |
| Projector/Display *(Optional)* | Live demonstration during presentations |

---

## Circuit / Wiring Diagram

**Not Applicable**

Atlas does not involve any electronic circuits, IoT devices, or hardware interfaces. Therefore, no circuit or wiring diagrams are required.

---

## Hardware Workflow

```mermaid
flowchart LR

A[User]
--> B[Laptop/Desktop]

B --> C[Atlas Web Application]

C --> D[Simulation Results]
```

---

## Security Measures

Atlas incorporates basic security measures to ensure secure and reliable operation of the platform.

| Security Measure | Description |
|------------------|-------------|
| **Input Validation** | User inputs and simulation parameters are validated before processing. |
| **Environment Variables** | Sensitive credentials such as API keys are stored securely using environment variables. |
| **HTTPS Communication** | All client-server communication is secured using HTTPS in production. |
| **Secure API Design** | Server-side APIs validate requests and return standardized responses. |
| **Data Integrity** | Simulation data is processed without modifying the original map datasets. |
| **Role-Based Access (Future)** | Administrative access can be restricted through authentication and authorization mechanisms. |

> **Note:** Atlas is an MVP developed for a hackathon. It uses synthetic simulation data and does not collect or store any personally identifiable information (PII).

---

## Testing & Performance

### Testing

The following tests were performed to validate the core functionality of Atlas.

| Test | Status |
|------|--------|
| Dashboard Rendering | ✅ Running |
| Map Visualization | ✅ Running |
| AI Citizen Generation | ✅ Running |
| Agent-Based Simulation | ✅ Running |
| Policy Intervention Logic | ✅ Running |
| Real-Time Metrics Update | ✅ Running |
| Responsive UI | ✅ Running |

---

### Performance

| Metric | Result |
|--------|--------|
| Initial Load Time | < 3 seconds |
| Simulation Start Time | < 1 second |
| Dashboard Updates | Real-time |
| Map Rendering | Smooth interaction with dynamic layers |
| Simulation Processing | Executed using Web Workers to maintain UI responsiveness |

> Atlas is optimized for interactive simulations, enabling real-time visualization and analysis while maintaining a responsive user experience.

---

## Challenges Faced

During the development of Atlas, the team encountered several technical and design challenges:

- Simulating realistic citizen behavior while maintaining high performance.
- Balancing simulation accuracy with the limited development time of a hackathon.
- Designing an intuitive dashboard capable of presenting complex urban analytics.
- Managing large geospatial datasets efficiently for real-time visualization.
- Creating a scalable architecture that can support future city-wide simulations.

---

## Future Scope

<img width="1920" height="1080" alt="15" src="https://github.com/user-attachments/assets/44474bd1-0f8c-49ca-bf37-5dce20e83a9f" />


Atlas has the potential to evolve into a comprehensive decision intelligence platform for governments and smart cities. Future enhancements include:

- Integration with real-time traffic and public transport data.
- AI-powered policy optimization and predictive recommendations.
- Weather and disaster-aware simulations.
- Support for multiple cities and nationwide digital twins.
- IoT sensor integration for live urban monitoring.
- Historical simulation replay and scenario comparison.
- Multi-user collaboration for government agencies.
- Automated report generation and policy impact assessment.
- 3D city visualization for enhanced situational awareness.

---
## Demo

### Application

> **Live Demo:** *(https://atlas-pink-iota.vercel.app/)*

---

### Demo Video

> **Demo Video:** *(https://drive.google.com/file/d/1jGPD3ZrhE7dlckpawgq7RlsGxuuyjdw-/view?usp=sharing)*

---

### Screenshots
> **Screenshot:**
<img width="1470" height="826" alt="image" src="https://github.com/user-attachments/assets/981e06c3-2951-4c49-b633-d628f4c9a30e" />
<img width="1470" height="835" alt="image" src="https://github.com/user-attachments/assets/a8ec8d0c-d62f-4e6d-974c-204b9de21bbc" />
<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/06a8984b-f2d6-48c7-ab94-3834ff48ec2f" />
<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/e0605d84-63f2-4d2a-86b8-a9f7ae58cd46" />
<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/c4f5f948-a8d4-429b-84ab-8efb1f3759e9" />



---

## References

1. Mapbox GL JS Documentation – https://docs.mapbox.com/mapbox-gl-js/
2. OpenStreetMap – https://www.openstreetmap.org/
3. Turf.js Documentation – https://turfjs.org/
4. Next.js Documentation – https://nextjs.org/docs
5. React Documentation – https://react.dev/
6. Tailwind CSS Documentation – https://tailwindcss.com/docs
7. Zustand Documentation – https://zustand-demo.pmnd.rs/
8. Recharts Documentation – https://recharts.org/
9. Agent-Based Modeling – https://en.wikipedia.org/wiki/Agent-based_model
10. Digital Twin Technology – https://en.wikipedia.org/wiki/Digital_twin
