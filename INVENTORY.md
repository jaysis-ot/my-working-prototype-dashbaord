# my-working-prototype-dashbaord — Inventory & File Functionality Overview

This document provides a hierarchical inventory of the repository along with concise descriptions of what each part of the dashboard does. It prioritizes the React application under `src/` and summarizes auxiliary scripts, deployment assets, and documents at the root.

If you want this as a PDF, export this Markdown via your editor or let me know and I’ll generate it for you.

---

## 1) High-Level Architecture

- React single-page application (SPA) in `src/` following atomic design and domain-driven structure.
- UI building blocks: atoms → molecules → organisms → pages → templates.
- Centralized UI/data state via custom reducers and hooks (see `src/store`, `src/shared`, `src/hooks`).
- Demo/client-side JWT auth in `src/auth` for gated content.
- Tailwind CSS for styling; PostCSS pipeline.
- Extensive developer tooling, deployment scripts, and architecture docs at the repo root and under `Downloads/`.

---

## 2) Top-Level Inventory (Root)

Below are the key root-level files and their roles. Files ending with `- BAK`, `copy`, or numbered variants are historical/backup snapshots used during refactors.

- `.gitignore` — Git ignore rules.
- `Dockerfile` — Container build for frontend.
- `docker-compose.yml`, `docker-compose-frontend-only.yml` — Orchestrate services locally/production; the frontend-only variant excludes backend services.
- `nginx.conf`, `nginx-frontend-only.conf`, `nginx/conf.d/default.conf` — Nginx reverse proxy/static serving configs.
- `package.json`, `package-lock.json` — Node metadata, dependencies, and scripts.
- `postcss.config.js`, `tailwind.config.js` — CSS processing and Tailwind setup.
- `README.md`, `README-standup.md`, `dashboard-implementation-guide.md`, `DEPLOYMENT_GUIDE.md`, `ENV_CONFIGURATION_GUIDE.md`, `VPS_DEPLOYMENT_WALKTHROUGH.md`, `ENTERPRISE_PRODUCTION_SCRIPTS_ANALYSIS.md`, `DEVELOPMENT_ROADMAP.md` — Project docs and deployment/roadmap guidance.
- `PRD_CYBER_TRUST_SENSOR_DASHBOARD.md`, `complete-file-structure-analysis.md`, `dashboard-refactor-structure.md` — Product requirements and architecture/refactor notes.
- PDFs (`A Novel Trust-Centric GRC System Architecture.pdf`, `Enhanced Requirements Dashboard – Technical Architecture Design.pdf`, `Cyber Trust Sensor Dashboard – Architecture Analysis.pdf`, etc.) — Reference and design documents.
- Root JS utilities and prototypes (selected):
  - `analyzeStructure.js`, `file_structure.js`, `list-files.js` — Structure/static analysis utilities.
  - `dashboard-*.js`, `requirements-*.tsx`, `enhanced-requirements-dashboard.js`, `main-*.js`, `updated-*.js` — Iterations/prototypes used during refactoring.
  - `standards-*.js`, `constants-*.js`, `theme-utils.js`, `utils-index.js` — Constants and helper aggregates.
  - `dev-diagnostics-server.js` — Local diagnostic server (developer aid).
- Deployment/diagnostics scripts (root): `check-dashboard-status.sh`, `complete-deployment.sh`, `continue-vps-deployment.sh`, `fix-*`, `vps-*`, `debug-*`, etc. — Shell scripts for VPS/docker/network fixes and deployments (Linux/macOS). Windows equivalent: `migrate-to-production-dashboard-windows.ps1` in `Downloads/`.
- CSV tooling and samples: `csv-download-tool*.html`, `sample_requirements_format_*.csv`, `transformed_requirements_*.csv` — Local CSV/Excel import/export aids and sample datasets.
- Static HTML demos: `debug.html`, `framework_assessment_standards.html`, `nist-csf-assessment.html`, `trust-diagnostics.html`, `trust-tester.html`, `swim_lane_resource_dashboard.html` — Prototype visualizations/testing.
- Auth prototypes at root: `JWTAuthProvider.js`, `JWTLoginForm.js`, `JWTManager.js`, `JWTProtectedContent.js`, `auth-config.js` — Standalone/demo versions; the app uses `src/auth`.
- Structure outputs: `structure-report.json` — Generated structure dump from analysis tools.

### Downloads/ (deployment assets and scripts)
- Contains deployment guides and dozens of bash scripts: docker setup, API fixes, database setup, port diagnostics, and complete VPS deployment. These are operational runbooks and automation scripts used during infrastructure bring-up.

---

## 3) Public Assets

- `public/index.html`, `favicon.ico`, `logo192.png`, `logo512.png`, `manifest.json`, `robots.txt` — CRA public assets.
- `public/diagnostic-viewer.html`, `public/trust-test.html` — Diagnostic/demonstration pages.

---

## 4) Application Source (src/)

This is the production dashboard code.

- `src/index.tsx` / `src/index.js` — CRA entry point mounting `<App />`.
- `src/App.jsx` / `src/App.js` — Root component; wires providers (Theme, Toast, etc.) and layout routing.
- `src/App.css`, `src/index.css`, `src/theme.css` — Global styles; Tailwind layers.
- `src/logo.svg` — Logo asset.
- `src/reportWebVitals.js` — CRA perf metrics hook.
- `src/setupTests.{js,ts}` — Testing bootstrap.

### 4.1 Auth (`src/auth`)
- `AuthContext.js`, `useAuth.js` — Auth context and React hook exposing auth state/actions.
- `JWTAuthProvider.js`, `JWTManager.js` — Client-side JWT token management (demo).
- `JWTLoginForm.js`, `LoginPage.js` — Demo login form and page.
- `ProtectedRoute.js`, `JWTProtectedContent.js` — Guard components for protected content.
- `auth-config.js` — Demo auth configuration (token expiry, storage keys).

### 4.2 Constants (`src/constants`)
- `dashboardConstants.js` — View modes, default filters, storage keys, and UI constants.
- `standardsConstants.js` — Standards definitions (e.g., NIST CSF, ISO) and scoring dimensions.
- `companyProfile.js`, `threatIntelligence.js`, `index.js` — Business/profile/threat constants and re-exports.

### 4.3 Contexts (`src/contexts`)
- `ThemeContext.jsx` — Theme provider (light/dark/custom) via CSS variables.
- `ToastContext.jsx` — App-wide toast notifications provider and hook.
- `DashboardUIContext.jsx` — UI-specific state (sidebar, modals, layout flags).

### 4.4 Store (`src/store`)
- `dashboardActions.js` — Action creators/types (filtering, sorting, CRUD, UI toggles).
- `dashboardReducer.js` — Pure reducer updating centralized state.
- `initialState.js` — Demo/initial data and defaults.
- `index.js` — Store wiring utilities.

### 4.5 Hooks (`src/hooks`)
Reusable stateful logic:
- Data: `useRequirementsData.js`, `useCapabilitiesData.js`, `useThreatIntelligence.js`, `useMitreAttackData.js`, `useRiskManagement.js`, `useTrustData.js`, `useStandardsFrameworks.js` — Fetch/shape domain data (demo/mocked).
- UI/UX: `useToast.js`, `useAnalytics.js`, `useDebounce.js`, `useMediaQuery.js`, `useResponsive.js`, `useKeyboardShortcuts.js`, `useIntersectionObserver.js`, `usePagination.ts`, `useSort.ts`, `useFilter.ts` — Cross-cutting concerns.
- Helpers: `useLocalStorage.js`, `usePrevious.js`, `usePortal.js`, `useClickOutside.js` — Utility behaviors.

### 4.6 Components (`src/components`)
- Atoms (`atoms/`):
  - `Button.jsx`, `Input.jsx`, `Badge.jsx`, `StatCard.jsx`, `LoadingSpinner.jsx`, `Modal.jsx`, `Portal.jsx`, `DropdownMenu.jsx`, `Toast.jsx`, `MaturityIndicator.jsx`, `SkeletonGrid.jsx`, `ProductLogo.jsx` — Small reusable UI elements.
- Molecules (`molecules/`):
  - Editing and detail units: `EditRequirementModal.jsx`, `EditCapabilityModal.jsx`, `EditAssignmentModal.jsx`, `RequirementModal.jsx`.
  - Evidence: `EvidenceAutomationMarketplace.jsx`, `EvidenceGraph.jsx`, `EvidenceHealthCard.jsx`, `EvidenceJourneyMap.jsx`, `EvidenceLifecycleTimeline.jsx`, `ViewRequirementModal.jsx`.
  - Risk & Incident: `RiskCreateModal.jsx`, `RiskEditModal.jsx`, `RiskRequirementsModal.jsx`, `IncidentCreateModal.jsx`.
  - Errors/Status: `ErrorDisplay.jsx`, `ColorPreview.jsx`.
- Organisms (`organisms/`):
  - Tables/Views: `RequirementsTable.jsx`, `RepositoryView.jsx`, `RepositoryEvidenceView.jsx`, `ThreatIntelligenceView.jsx`, `RiskManagementView.jsx`, `CapabilitiesView.jsx`, `StandardsFrameworksView.jsx`, `IncidentsView.jsx`.
  - Settings: `AppearanceSettings.jsx`, `CompanyProfileSettings.jsx`, `ComplianceSettings.jsx`, `DataBackupSettings.jsx`, `IntegrationsSettings.jsx`, `NotificationsSettings.jsx`, `PerformanceSettings.jsx`, `SystemDiagnosticsSettings.jsx`.
  - Navigation/Control: `FilterToolbar.jsx`, `ModalManager.jsx`, `UserSettingsDropdown.jsx`, `MitreAttackNavigator.jsx`.
- Pages (`pages/`):
  - Top-level routes: `OverviewPage.jsx`, `RequirementsPage.jsx`, `CapabilitiesPage.jsx`, `RiskManagementPage.jsx`, `ThreatIntelligencePage.jsx`, `StandardsFrameworksPage.jsx`, `CompanyProfilePage.jsx`, `SettingsPage.jsx`, `TrustPage.jsx`, `AnalyticsPage.jsx`.
  - Incident tooling: `IncidentManagementPage.jsx`, `IncidentDebugPage.jsx`, `IncidentsPage.jsx`.
  - Demos: `AdvancedEvidenceDemo.jsx`, `MaturityAnalysisPage.jsx`, `MitreAttackPage.jsx`, `ResourcePlanningPage.jsx`, `BusinessPlanPage.jsx` (currently excluded in nav per notes).
- Templates (`templates/`):
  - `DashboardLayout.jsx` — App shell (header/sidebar/content slots).
  - `ModalManager.jsx` — Centralized modal orchestration.

### 4.7 Shared (`src/shared`)
Cross-domain assets intended for broad reuse.
- Components: reusable charts, dashboard shell (alternate/shared), modal provider, and atoms with stories/tests (TypeScript variants).
- Layout: `ErrorBoundary.jsx`, `LoadingSpinner.jsx`, `ModalManager.jsx`, `Sidebar.jsx`, `Header.jsx`.
- Modals: `CSVUploadModal.jsx`, `EditRequirementModal.jsx`, `NewCapabilityModal.jsx`, `PurgeConfirmationModal.jsx`, `ViewRequirementModal.jsx` (multiple backups/copies included).
- Requirements: `RequirementsTable.jsx`, `RequirementsView.jsx` — reusable versions.
- Settings tabs: `AppearanceTab.jsx`, `ComplianceTab.jsx`, `DataBackupTab.jsx`, `IntegrationsTab.jsx`, `NotificationsTab.jsx`, `PerformanceTab.jsx`, `SystemSettings.jsx`.
- Views: higher-level view components (Overview, Requirements, ThreatIntelligence, RiskManagement, Standards, etc.).
- Config: `environment.ts`, `features.ts`, `theme.ts` — Shared config & feature flags.
- Contexts: `AppContext.tsx`, `AuthContext.tsx`, `NotificationContext.tsx`, `ThemeContext.tsx` — Alternative/shared providers.
- Hooks: common hooks (`useDashboardState{.js,.jsx}`, `useAnalytics.js`, etc.) and TypeScript utilities.
- Services: `api/` (ApiClient/BaseApiService), `auth/` (AuthService/TokenService), `notification/`, `storage/` — Client-side service layer (ready for backend integration).
- Styles: `styles/tokens` (design tokens), global CSS splits.
- Utils: `utils/constants` (endpoints, app constants, error messages), `formatters/`, `helpers/`, `validation/`.

### 4.8 Domains (`src/domains`)
Each domain is a mini-module with components (atoms/molecules/organisms), context/provider, hooks, models, services, and utils.
- `capabilities/` — Capability definitions, maturity scoring, assessments, matrices.
- `evidence/` — Evidence library, upload/validation, audit trails, freshness/validity indicators.
- `requirements/` — Requirement entities, filters, matrices, framework mapping.
- `resources/` — Resource planning, capacity modeling, swimlanes.
- `risks/` — Risk entities, calculations, matrices/heatmaps.
- `threats/` — Threat models, MITRE ATT&CK mapping, navigator, filters.
- `trust/` — Trust score, metrics, trends, reporting and dashboard.

### 4.9 Utils (`src/utils`)
- `companyProfile.js` — Company profile helpers/mappers.
- `dataService.js` — Data access helpers (local/demo).

### 4.10 Types (`src/types`) and TS config
- Strong typing for API, entities, events, and permissions.
- `tsconfig.json` — TypeScript compiler options.

### 4.11 Build Artifacts and Guides (`src/build`)
- `guide/` — Operational procedures and infrastructure guides.
- `overview/COMPREHENSIVE_DASHBOARD_OVERVIEW.md` — High-level feature overview.
- `requirements/PRD_CYBER_TRUST_SENSOR_DASHBOARD.md` — Product requirement doc copy.
- `corrected/` — Corrected deployment analysis & orders with scripts.

---

## 5) Patterns for Backup/Variant Files
- Files with `- BAK`, `copy`, `copy N`, or numbered suffixes are intermediate snapshots from refactors or experiments. They serve as reference implementations and can be safely ignored by the running app.

---

## 6) How Major Files Work Together (Functional Overview)
- App boot: `src/index.{js,tsx}` → `src/App.jsx` → `templates/DashboardLayout.jsx`.
- Navigation: Sidebar/Header update UI state; `DashboardLayout` renders Pages.
- State: Page components and Organisms dispatch actions from `src/store/dashboardActions.js`; `src/store/dashboardReducer.js` updates the central state.
- Data: Hooks under `src/hooks` and domain hooks fetch/shape data, often demo/mocked. Shared services under `src/shared/services` are prepared for real API integration.
- Auth: `src/auth` provides context and guards to gate protected pages or components.
- Styling: Tailwind via `index.css` and theme variables via `ThemeContext.jsx`.
- Modals: Centralized by `templates/ModalManager.jsx` and `organisms/ModalManager.jsx`.

---

## 7) Full Directory Trees (Snapshot)

Below snapshots capture the overall hierarchy (abridged to avoid repetition of backups and duplicates):

```
public/
  diagnostic-viewer.html
  favicon.ico
  index.html
  logo192.png
  logo512.png
  manifest.json
  robots.txt
  trust-test.html

src/
  App.css
  App.js
  App.jsx
  index.css
  index.js
  index.tsx
  logo.svg
  reportWebVitals.js
  setupTests.js
  setupTests.ts
  theme.css
  auth/
    AuthContext.js
    JWTAuthProvider.js
    JWTLoginForm.js
    JWTManager.js
    JWTProtectedContent.js
    LoginPage.js
    ProtectedRoute.js
    auth-config.js
    useAuth.js
  components/
    atoms/ (...atoms listed above)
    molecules/ (...molecules listed above)
    organisms/ (...organisms listed above)
    pages/ (...pages listed above)
    templates/
      DashboardLayout.jsx
      ModalManager.jsx
  constants/
    companyProfile.js
    dashboardConstants.js
    index.js
    standardsConstants.js
    threatIntelligence.js
  contexts/
    DashboardUIContext.jsx
    ThemeContext.jsx
    ToastContext.jsx
  domains/
    capabilities/ (...atoms, molecules, organisms, context, hooks, models, services, utils)
    evidence/ (...)
    requirements/ (...)
    resources/ (...)
    risks/ (...)
    threats/ (...)
    trust/ (...)
  hooks/ (...hooks listed above)
  shared/ (...components, contexts, hooks, services, styles, utils)
  store/
    dashboardActions.js
    dashboardReducer.js
    initialState.js
    index.js
  types/ (...TypeScript types)
  utils/
    companyProfile.js
    dataService.js

Downloads/ (...deployment scripts and guides)
nginx/
  conf.d/
    default.conf
```

For the exhaustive list, refer to the repository root and `src/`—all files under those trees are included in this inventory and categorized in the sections above.

---

## 8) Notes
- Many non-app root files are developer and deployment aids. The running app is primarily driven from `src/`.
- To locate a specific component quickly, search within `src/components` or the relevant `src/domains/<domain>/components` folder.

