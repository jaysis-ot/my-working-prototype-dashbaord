# Cyber Trust Sensor Dashboard  
**Comprehensive Prototype Overview**

_Last updated: July 2025_  

---

## 1 | Executive Snapshot
The Cyber Trust Sensor Dashboard (CTSD) is a 12-plus–page, React-based prototype that unifies Governance-Risk-Compliance (GRC), security operations, and business-value analytics into a single workspace.  
It demonstrates how security, compliance, and operational teams can _measure trust_, _prioritise investment_, and _drive continuous improvement_ with data-driven context.

* Business Value: Rapid evidence of platform vision for investors & prospects.  
* User Value: One login, consistent UI, instant visibility of requirements, capabilities, threats, risks and progress.  
* Technical Value: Modular, atomic-design codebase with mock APIs, illustrating integration patterns for future production services.

---

## 2 | Solution Architecture Overview
| Layer | Key Elements | Notes |
|-------|--------------|-------|
| UI / SPA | React 18, React-Router lazy routes, Tailwind CSS theme engine, Lucide iconography | Atomic design (Atoms→Molecules→Organisms→Templates→Pages) |
| State & Context | `ThemeContext`, `DashboardUIContext`, `AuthContext` (JWT) | Local state, custom hooks; ready for React-Query or Redux swap-in |
| Data Access | Mock service layer in `src/hooks` & `src/utils/dataService.js` | Stubs real REST/GraphQL; each hook returns `{data, loading, error}` |
| Security | JWT auth guard, role placeholder, CSRF-safe fetch wrapper, evidence decay & trust scoring logic | Easily replaced with enterprise IdP |
| Integration Adapters | MITRE ATT&CK API prototype, RSS/Ioc threat feeds, ServiceNow webhook stub (Incidents) | Normalised in hooks; can convert to micro-service calls |
| Dev & Ops | Vitest/Jest scaffolding, PostCSS + Tailwind, ESLint/Prettier, CI-ready scripts | Dockerfile pending |

---

## 3 | Page-by-Page Analysis

> Each page summary contains four sub-sections:  
> • Business Context • User Workflow • Feature Highlights • Technical Deep-Dive

### 3.1 Overview Page (`/dashboard/overview`)
**Business Context**  
Quick, cross-domain health-check: trust score, open risks, project velocity, compliance status.

**User Workflow**  
1. Land on dashboard → see stat cards (requirements complete %, risk heat, incident count).  
2. Hover over trust gauge for trend tooltip.  
3. Click a card to pivot (e.g., “Open Risks” opens Risk Management page).

**Feature Highlights**  
* Animated radial “Overall Trust Score” (colour-coded).  
* StatCard grid with delta indicators.  
* Mini bar & pie charts using Recharts.

**Technical Deep-Dive**  
* Data from `useAnalytics` & `useRequirementsData` hooks.  
* Components: `StatCard`, `TrustScore`, custom responsive container.  
* Rendering guarded by `<Suspense>` fallback to `LoadingSpinner`.

---

### 3.2 Requirements Page (`/dashboard/requirements`)
**Business Context**  
Central backlog of security requirements mapped to frameworks & business value.

**User Workflow**  
* Filter by status, area, priority; bulk export CSV; open modal to view/edit.  
* Progress bars show implementation %; maturity indicator badges show score 1-5.

**Feature Highlights**  
* Column toggling, paging, sort by any field.  
* CSV import/export placeholder.  
* Inline maturity & business-value visual cues.

**Technical Deep-Dive**  
* Hook `useRequirementsData` -> mock generator with 300+ rows.  
* Table organism `RequirementsTable` manages sort/paginate via internal state + `useMemo`.  
* Modal stack handled by global `ModalManager`; view/edit modals resolve promise for save.

Data Model (excerpt):

| Field | Type | Notes |
|-------|------|-------|
| id | `REQ-####` | Primary key |
| description | string | requirement text |
| status | enum `Not Started/In Progress/Completed` | |
| maturityLevel | {level, score} | 1-5 mapping |
| businessValueScore | 1-5 | decimal accepted |
| linkedRisks | string[] | id references to Risk module |

---

### 3.3 Capabilities Page (`/dashboard/capabilities`)
**Business Context**  
Inventory & roadmap of security capabilities (e.g., “Network Segmentation”, “SIEM”).

**User Workflow**  
* See heat-map of maturity vs. coverage.  
* Click capability → Details modal with description, owner, related requirements.  
* Edit capability (status, budget) via form; create new via `+ Add`.

**Feature Highlights**  
* Capability heat-map (planned in `CapabilityHeatMap.tsx`) displays coverage gaps.  
* Badge indicators for status (Planning/In-Progress/Completed).  
* Cross-linking: clicking “linked requirements” opens Requirements modal pre-filtered.

**Technical Deep-Dive**  
* Data composed from `useCapabilitiesData` plus join with `useRequirementsData`.  
* Edit modal updates local state; `useToast` fires success message.  
* Graph colour scale constants in `dashboardConstants.COLOR_SCHEMES`.

---

### 3.4 Resource Planning Page (`/dashboard/resources`)
**Business Context**  
Align people & skills to security workstreams; surface capacity conflicts.

**User Workflow**  
1. Pick team filter (Security/Network/etc.).  
2. Drag-drop requirement onto engineer (planned).  
3. Edit assignment dates in Gantt style modal.

**Feature Highlights**  
* Dual-view toggle: Kanban vs. Gantt (`LayoutGrid` vs. `GanttChartSquare` icons).  
* Capacity bar per resource (green-to-red).  
* Search & multi-criteria filter toolbar.

**Technical Deep-Dive**  
* Heavy component (~1,300 LOC) combining mock teams/resources/tasks.  
* Memoised selectors calculate weekly capacity.  
* Placeholder WebSocket stub for live updates (`ENABLE_REAL_TIME_UPDATES`).

---

### 3.5 MITRE ATT&CK Navigator (`/dashboard/mitre-attack`)
**Business Context**  
Visualise adversary tactics/techniques and map them to internal controls.

**User Workflow**  
* Select tactic in sidebar; techniques populate grid.  
* Click technique → slide-over panel with description, detection coverage %, linked requirements + capabilities.  
* Search box filters by ID or keyword.

**Feature Highlights**  
* Responsive heat-grid built with CSS grid; severity colour scale.  
* “Coverage overlay” toggle shows which techniques are mitigated.  
* Export button to generate ATT&CK report JSON.

**Technical Deep-Dive**  
* Hook `useMitreAttack` fetches tactic/technique lists from mock API (`mitreAttackAPI.js`).  
* Large component (`MitreAttackNavigator.jsx`, 2,500 LOC) with virtualised list for performance.  
* Mapping util `mitreAttackMapping.js` cross-references requirements.

---

### 3.6 Threat Intelligence Page (`/dashboard/threat-intelligence`)
**Business Context**  
Aggregates threat feeds & IOCs to inform prioritisation and incident response.

**User Workflow**  
* Browse top threats list; severity badge & risk score.  
* Click threat → details drawer; link to MITRE technique if applicable.  
* Refresh / search; filter by status (Active/Investigating/etc.).

**Feature Highlights**  
* Stat cards: new threats 24h, critical IoCs, feed health.  
* IOC table with reputation & confidence bars.  
* Integration settings (source toggles) accessible via Settings › Threat Intel tab.

**Technical Deep-Dive**  
* Hook `useThreatIntelligence` wraps two mock endpoints (`searchThreats`, `searchIOCs`).  
* SSE/WebSocket ready flag `ENABLE_REAL_TIME_UPDATES`.  
* Threat source metadata enumerated in `THREAT_INTEL_SOURCES`.

---

### 3.7 Risk Management Page (`/dashboard/risk-management`)
**Business Context**  
Maintain risk register, calculate ratings, track treatment strategies.

**User Workflow**  
1. Filter by category/severity.  
2. Click risk row → modal with treatments & linked requirements.  
3. Add new risk or update status.

**Feature Highlights**  
* Risk heat-map & funnel metrics panel.  
* Treatment timeline chips (Mitigate/Transfer/Accept).  
* Export register CSV.

**Technical Deep-Dive**  
* `useRiskManagement` generates risks & treatments; calculates rating via helper `calculateRiskRating`.  
* Risk object: `{impact, probability, rating:{score, level}}`.  
* Uses `RiskManagementView` organism with internal reducer for filters.

---

### 3.8 Standards & Frameworks Page (`/dashboard/standards-frameworks`)
**Business Context**  
Interactive self-assessment against NIST CSF 2.0, ISO 27001, SOC 2, etc.

**User Workflow**  
* Select framework; subcategory checklist appears.  
* Mark implementation level (Implemented/Partial/Planned).  
* Score gauge updates in real time; reset assessment when needed.

**Feature Highlights**  
* Framework selector badges show status (Available/Beta/Coming Soon).  
* Progress ring & radar chart of functions categories.  
* Exports assessment JSON to share with auditors.

**Technical Deep-Dive**  
* Const maps in `standardsConstants.js`; subcategory count, estimated hours.  
* Hook `useStandardsFrameworks` manages `assessment` state keyed by subcategory ID.  
* Scores calculation memoised, uses `useFrameworkProgress.js`.

---

### 3.9 Maturity Analysis Page (`/dashboard/maturity-analysis`)
**Business Context**  
Quantifies process and control maturity to guide roadmap investment.

**User Workflow**  
* View stat cards (avg score, total assessed, improvement opportunities).  
* Bar chart of maturity level distribution; radar of category averages.  
* Filter dropdown (“show Improvement” -> list requirements needing uplift).

**Feature Highlights**  
* Colour-coded by CMMI-like levels (Initial→Optimizing).  
* Drill-down list with quick “View Requirement” button.  
* Uses same mock requirements data ensuring consistency.

**Technical Deep-Dive**  
* Analytics derived by `useAnalytics(requirements)` hook.  
* Charts: Recharts `BarChart` + `RadarChart`.  
* Filter state in component; improvement calc: maturity ≤2 & businessValue ≥4.

---

### 3.10 Analytics Page (`/dashboard/analytics`)
**Business Context**  
Central hub for cross-domain metrics & executive reporting.

**User Workflow**  
* Choose time-range preset; widgets refresh.  
* Download PDF/CSV of dashboard snapshot.  
* Star favourite charts (future feature flag).

**Feature Highlights**  
* Multi-chart grid: bar, pie, scatter, radar.  
* Drag-and-drop reorder (planned).  
* KPI StatCards at top.

**Technical Deep-Dive**  
* Combines outputs from `useAnalytics`, `useCapabilitiesData`, `useRiskManagement`.  
* Export placeholder uses `html2canvas` in roadmap.  
* Feature flags `ENABLE_ADVANCED_ANALYTICS`, `ENABLE_AUTOMATED_REPORTING`.

---

### 3.11 Business Plan Page (`/dashboard/business-plan`)
**Business Context**  
Turn security initiatives into board-ready business cases.

**User Workflow**  
* Select plan (e.g., “Network Segmentation Initiative”).  
* Tabs: Executive Summary, Financials (ROI calc), Timeline, Stakeholders.  
* Edit inline, save; download DOCX (planned).

**Feature Highlights**  
* Rich text editor for narrative sections.  
* Cost-benefit widgets (CapEx/OpEx vs. risk reduction).  
* “calculator” icon toggles dynamic ROI calculator sidebar.

**Technical Deep-Dive**  
* Mock plans object keyed `BP-X-###`.  
* Local reducer tracks editing, autosave timer.  
* Designed for future coupling to project-portfolio mgmt API.

---

### 3.12 Settings Page (`/dashboard/settings`)
**Business Context**  
Unified configuration center (appearance, notifications, integrations, diagnostics).

**User Workflow**  
* Tabs across top; save button shows status “Saving… / Saved!”.  
* Theme picker, SMTP creds, backup schedule, threat feed toggles, system diagnostics run.

**Feature Highlights**  
* Modular organism per tab (`AppearanceSettings`, `IntegrationsSettings`, etc.).  
* Validation & inline error banners.  
* Last-saved timestamp.

**Technical Deep-Dive**  
* Tab selection via URL query param (`?tab=appearance`).  
* Save action batches context updates; debounced to reduce API calls.  
* Diagnostics tab triggers async health checks, returns result badges.

---

### 3.13 Additional Pages / Utilities
| Route | Purpose | Notes |
|-------|---------|-------|
| `/dashboard/company-profile` | Master company metadata feeding risk & requirement context. | Large form with industry, regions, compliance obligations. |
| `/dashboard/incident-management` | Low-fidelity POC for incident intake & status tracking. | Generates mock incidents, search & filter toolbar. |
| `/dashboard/trust` | Experimental trust scoring visualisation. | Leverages evidence decay algorithm. |

---

## 4 | Cross-Cutting Data & Mock Strategy
* All mock data lives in `src/utils/dataService.js` or per-hook internal generator.  
* IDs follow consistent prefixes (`REQ-`, `CAP-`, `RISK-`, `INC-`).  
* CSV import/export retains schema; `transformCSVToRequirement` reconciles nested objects.  
* Future switch to real API: replace generator with Axios/fetch + env endpoints.

---

## 5 | Security & Compliance Mechanics
* **Authentication**: JWT, `ProtectedRoute` wrapper; login page pre-filled demo creds (`admin@dashboard.com / demo123`).  
* **Authorisation (Roadmap)**: Role-based scopes enumerated in `types/permissions.ts`.  
* **Evidence Decay**: Trust algorithm considers incident impact & NIST CSF mapping.  
* **Secure Coding**: Error boundaries, CSRF-safe fetch abstraction, linting.  
* **Data Protection**: Placeholder encryption util, readiness for Secret Manager.

---

## 6 | Integration Patterns
| Domain | Prototype Adapter | Future Integration |
|--------|-------------------|--------------------|
| Threat Feeds | RSS parser, MITRE ATT&CK JSON | OpenCTI, CrowdStrike, MISP |
| Incidents | ServiceNow webhook stub | ITSM REST, PagerDuty |
| Compliance | CSV import/export | Audit-API, GRC SaaS |
| Authentication | Local JWT | SSO (OIDC/SAML) |
| Telemetry | React performance hooks | OpenTelemetry pipeline |

---

## 7 | User-Experience Principles
* **Consistency**: Single design-system; dark/light theming.  
* **Responsiveness**: `useResponsive` & Tailwind breakpoints.  
* **Focus**: One-line filter bars; stat cards headline metrics.  
* **Accessibility**: Semantic tags, keyboard nav hook, colour contrast tokens.

---

## 8 | Technical Roadmap
1. Replace mock data with GraphQL gateway.  
2. Implement real-time updates (WebSocket/SSE).  
3. Add AI recommendations (feature flag false today).  
4. Containerise & deploy to Kubernetes demo cluster.  
5. Expand Business Plan generator to cover budgeting API.  
6. Harden security (OWASP top-10 audit, CSP headers).  

---

## 9 | Conclusion
This prototype showcases how disparate security, risk, compliance and business drivers can converge into a cohesive, data-centric dashboard.  
Stakeholders can use the CTSD codebase as a blueprint for full-scale implementation or as a sales demo highlighting vision and technical approach.

_For questions or demo requests, contact **Jay Dee** (Product & Architecture Lead)._  
