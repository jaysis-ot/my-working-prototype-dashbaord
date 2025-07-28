# Product Requirements Document  
**Product:** Cyber Trust Sensor Dashboard (CTSD)  
**Version:** 1.0 – Production-Ready Release  
**Owner:** Jay Dee (Product & Architecture Lead)  
**Date:** July 2025  

---

## 1. Purpose  

The Cyber Trust Sensor Dashboard provides a single pane of glass for Governance-Risk-Compliance (GRC), security operations and business-value analytics.  
The prototype proves vision; this PRD defines requirements to transform it into a production-ready SaaS module that will:  

* Quantify organisational “trust” through evidence-driven scoring.  
* Unite security requirements, capabilities, threat intel, risk register and compliance progress.  
* Enable executives to prioritise investments through data-backed ROI and maturity insights.  
* Deliver extensible APIs and integration points to existing ITSM, SIEM, and GRC tooling.  

Success Metric (M-0): within 3 months of launch, 3 design-partner customers run live data and derive >20 actionable insights each month.

---

## 2. Scope  

| Included (MVP +) | Excluded / Future |
|------------------|-------------------|
| • All 12 prototype pages (Overview, Requirements, Capabilities, Resource Planning, MITRE ATT&CK, Threat Intelligence, Risk Management, Standards & Frameworks, Maturity Analysis, Analytics, Business Plan, Settings).<br>• JWT SSO via OIDC.<br>• REST + WebSocket APIs.<br>• Role-based Access Control (RBAC).<br>• Multi-tenant database separation.<br>• CSV/JSON import-export for requirements, risks, assessments.<br>• Basic ServiceNow & OpenCTI integrations.<br>• Dark/Light theme. | • AI-driven recommendations.<br>• Automated PDF reporting engine.<br>• Full drag-drop resource scheduling.<br>• Collaboration comments.<br>• Automated evidence gathering marketplace.<br>• Mobile native app.<br>• FedRAMP High hosting. |

---

## 3. Target Audience  

1. **CISO & Security Leadership** – need holistic risk and maturity picture.  
2. **Compliance / GRC Analysts** – manage frameworks, evidence & audits.  
3. **Security Engineers & SOC Analysts** – map threats to controls, track incidents.  
4. **Executive Stakeholders / Board** – consume trust score & ROI dashboards.  
5. **Implementation Partners** – extend via APIs and build connectors.

---

## 4. Features & Functional Requirements  

| # | Feature | Priority | Description | Acceptance Criteria |
|---|---------|----------|-------------|---------------------|
| F-1 | **Unified Overview Dashboard** | P0 | Stat cards, trust gauge, charts. | Metrics load <2 s; cards deep-link to detailed pages. |
| F-2 | **Requirements Management** | P0 | CRUD requirements, maturity & value scoring, CSV import/export, linking to risks/capabilities. | Full CRUD via UI & API; validation per schema. |
| F-3 | **Capabilities Inventory** | P0 | Heat-map, status tracking, details modal, requirement linkage. | Capability list paginates; ownership editable; heat-map reflects maturity. |
| F-4 | **Resource Planning** | P1 | Kanban & Gantt views, capacity calculations, assignment editing. | Save persists to DB; capacity bar updates in real-time. |
| F-5 | **MITRE ATT&CK Navigator** | P0 | Visual grid, coverage overlay, technique details, export JSON. | Tactics & techniques sync nightly from MITRE TAXII; 95% coverage performance <200 ms cell render. |
| F-6 | **Threat Intelligence Aggregator** | P0 | Feed ingestion, threat & IOC lists, severity scoring, search/filter. | Support OpenCTI & RSS; auto-refresh interval configurable. |
| F-7 | **Risk Management Register** | P0 | Impact-probability matrix, treatments, filter/search, CSV export. | Risk rating formula validated; change history logged. |
| F-8 | **Standards & Frameworks Assessment** | P0 | NIST CSF 2.0, ISO 27001, SOC 2 checklists, progress radar. | Each answer stored audit-ready; score calc accurate ±1%. |
| F-9 | **Maturity Analysis** | P0 | Charts, improvement filter, requirement drill-down. | Improvement list updates when maturity ≤2 & value ≥4. |
| F-10 | **Analytics Hub** | P1 | Multi-chart widgets, date range selector, export dashboard PNG/CSV. | Data loads under 3 s for 1-year range; export completes <10 s. |
| F-11 | **Business Plan Builder** | P2 | Executive summary, ROI calculator, stakeholder table. | Save & version history; downloadable DOCX. |
| F-12 | **Settings Centre** | P0 | Appearance, notifications, integrations, diagnostics. | All configs saved via API; diagnostics returns pass/fail JSON. |
| F-13 | **Security & Auth** | P0 | OIDC login, RBAC roles: Admin, Analyst, Viewer. | Role matrix enforced on all endpoints; sessions expire 1 h inactive. |
| F-14 | **API Layer** | P0 | REST & WebSocket, versioned `/v1`. | OpenAPI 3.1 spec published, >90 % integration test coverage. |
| F-15 | **Observability** | P0 | Logs, metrics, traces. | 100 % HTTP requests traced; error rate alert at 1 % threshold. |

P-values: P0 = Launch blocker, P1 = Post-GA within 3 months, P2 = Roadmap.

---

## 5. User Stories (Representative)  

1. **As a CISO** I need to log in via my corporate SSO and instantly view an overall Trust Score so that I can brief the board.  
2. **As a GRC Analyst** I can import a CSV of ISO 27001 controls and have each mapped into Requirements so that I avoid manual entry.  
3. **As a Security Engineer** I click on a MITRE technique and see linked requirements and coverage gaps so that I know what to implement next.  
4. **As a Risk Manager** I update a risk’s probability and the risk matrix recalculates in real-time so that treatment priorities remain current.  
5. **As an Executive** I download a business-case deck that summarises ROI and maturity improvements to secure budget approval.  

(Full backlog maintained in Jira project **CTSD-PRD**.)

---

## 6. Release Criteria (Definition of Done)  

* ✅ All P0 features meet acceptance criteria and unit/integration tests ≥90 % coverage.  
* ✅ End-to-end smoke suite passes in staging 3 consecutive days.  
* ✅ OWASP Top-10 penetration test issues resolved or accepted.  
* ✅ Performance: P95 page load ≤3 s on 3 Mbps connection.  
* ✅ Multi-tenant data isolation verified via tenant-restricted SQL tests.  
* ✅ Documentation: API, user guide, admin guide complete.  
* ✅ At least 2 design partners sign-off during UAT.  

---

## 7. High-Level Timeline  

| Phase | Dates | Milestones |
|-------|-------|------------|
| Discovery & Design | Aug 1 – Aug 15 | Final PRD sign-off, UX workshops, tech-stack confirmation |
| Sprint 0 – Foundations | Aug 16 – Aug 31 | Repository hardening, CI/CD, auth baseline |
| Sprints 1-4 – Core P0 Features | Sep 1 – Oct 27 | Requirements, Risk, Overview, Standards, MITRE, Threat | 
| Sprint 5 – Hardening & Integrations | Oct 28 – Nov 10 | OpenCTI & ServiceNow connectors, load tests |
| UAT / Beta | Nov 11 – Nov 24 | Design-partner onboarding, bug triage |
| **GA Launch** | **Dec 2 2025** | Production release & marketing launch |

Cadence: 2-week sprints, mid-sprint demos. Timeline assumes 6 FTE engineers + 1 UX + 1 QA.

---

## 8. UX & UI Requirements  

* **Consistency** with existing prototype: atomic component library, Tailwind tokens; WCAG 2.1 AA compliance.  
* **Responsive** – mobile portrait minimum 360 px width.  
* **Accessibility** – keyboard navigation, ARIA roles, colour contrast >4.5:1.  
* **Branding** – ProductLogo component; theming engine supports customer logo & colour overrides.  
* **Error & Empty States** – graceful, instructional messaging.  
* **Internationalisation** – text externalised; English GA, translation-ready.  

Wireframes & Figma links maintained in design system repo `ctsd-design`.

---

## 9. Assumptions, Constraints, Dependencies  

* Mock data replaced by PostgreSQL cluster via Hasura GraphQL engine.  
* Hosting on AWS us-east-1; multi-AZ RDS, S3, CloudFront.  
* Company SSO providers support OIDC or SAML 2.  
* Third-party feeds (OpenCTI, MITRE) remain publicly accessible.  
* Budget approved for 8 FTE through FY-25.  
* Constraint: must comply with SOC 2 Type II controls by GA.  

---

## 10. Open Questions  

| # | Question | Owner | Due |
|---|----------|-------|-----|
| Q1 | Do we require offline PDF evidence packs in MVP? | Product | 15 Aug |
| Q2 | Will customer tenants need custom domain support? | DevOps | 22 Aug |
| Q3 | Preferred billing model (per seat vs. per asset)? | Finance | 30 Aug |
| Q4 | Are AI recommendation features a hard P1 or experimental flag? | Leadership | 30 Aug |
| Q5 | Confirm legal review for data residency in EU? | Legal | 05 Sep |

---

## 11. Revision History  

| Date | Version | Author | Notes |
|------|---------|--------|-------|
| 19 Jul 2025 | 0.9 | Jay Dee | Initial PRD draft from prototype overview |
| — | — | — | — |
