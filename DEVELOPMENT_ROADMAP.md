# Cyber Trust Sensor Dashboard – Development Roadmap  
_A living guide for Jay Dee and collaborators_

---

## 1. Celebrating Current Achievements 🏅
You have already:
- Assembled a modular React 19 codebase with atomic design.
- Implemented JWT auth, RBAC scaffolding and protected routing.
- Built 12 functional dashboard pages backed by domain-driven folders.
- Authored a detailed Product Requirements Document (PRD v1.0).
- Automated VPS provisioning scripts (Docker, PostgreSQL, Nginx, Prometheus, Grafana).
- Deployed a working prototype to an Ubuntu 24.04 VPS (http://31.97.114.80).

_✔ Progress score: 60 % of P0 foundations complete._

---

## 2. Guiding Principles
1. “Prototype fast, harden later” – keep velocity but lock quality gates before GA.
2. One source of truth: **main** branch always deployable.
3. Small, verified increments > large risky merges.
4. Automate anything repeated twice.

---

## 3. High-Level Milestones & Timeline
| Phase | Dates (target) | Key Deliverables | Success Gate |
|-------|----------------|------------------|--------------|
| Sprint 0 – Hardening | Now → +2 weeks | CI/CD, lint, tests ≥70 % | Pipeline green 3 days straight |
| Sprints 1–4 – P0 Features | +2 → +10 weeks | Requirements, Risk, Standards, MITRE, Threat pages live with DB | UAT demo passes with mock tenant |
| Sprint 5 – Integrations | +10 → +12 weeks | ServiceNow & OpenCTI connectors | Data flows & alerts raised |
| Beta / UAT | +12 → +14 weeks | 2 design partners onboarded | NPS ≥ 40 |
| **GA Launch** | Dec 2 2025 | Production release | All P0 PRD criteria ticked |

---

## 4. Immediate Next-Step Priorities (Next 10 days)
1. **CI/CD** – GitHub Actions to build, test, docker-build & push to registry.  
2. **Type-safe API stubs** – generate OpenAPI spec and client.  
3. **Database schema v0.1** – Requirements, Risks, Users tables in Postgres.  
4. **Docker Compose v1** – use the provided file; verify `docker compose up -d` on VPS.  
5. **Monitoring hooks** – Prometheus scrape configs & Grafana dashboard import.

> Track these as issues **#101-#105** in GitHub with _“priority:high”_ label.

---

## 5. Daily / Weekly Workflow
- **Daily (≈30 min)**
  1. Stand-up note in README-standup.md (what I did / today / blockers).
  2. Triage new issues & PRs.
  3. Run `npm test && npm run lint` locally before push.

- **Weekly (Friday)**
  1. Demo current build on VPS to yourself (or teammate).
  2. Update **Roadmap Progress Table** (section 9).
  3. Retrospective: 1 keep 💚 1 drop ❌ 1 try ➕.

---

## 6. Success Metrics & Checkpoints
| Metric | Target | Checkpoint Frequency |
|--------|--------|----------------------|
| Unit test coverage | ≥ 80 % | Sprint end |
| P95 page load (Overview) | < 3 s on 3 Mbps | Weekly |
| Deployment time (CI → VPS) | ≤ 10 min | Weekly |
| Uptime (Pingdom) | ≥ 99.5 % | Monthly |
| Bugs per sprint | ≤ 5 critical | Sprint retro |
| Trust Score algorithm accuracy | ±5 % expected | Feature complete |

---

## 7. Accountability Measures
- **Definition of Done (DoD)** checklist in each PR template.
- Use GitHub Projects board “CTSD Roadmap” with columns  
  _Backlog → In Progress → Review → Done_.  
- Automatic Slack / Email notifications on failed builds.
- Bi-weekly stakeholder review meeting (15 mins) – demo & metric review.

---

## 8. Deployment to Ubuntu VPS
1. SSH: `ssh ubuntu@<IP>` – ensure firewall (UFW) ports 22,80,443,9090 open.
2. Clone repo & copy `.env` → fill secrets.
3. `docker compose pull && docker compose build && docker compose up -d`.
4. Confirm:
   - Frontend: `curl -I http://localhost/health` → 200 OK  
   - API placeholder: `curl -I http://localhost/api/`  
   - Prometheus: `http://<IP>:9090/-/healthy`  
5. Set up Watchtower (auto-update containers) and fail2ban.

---

## 9. Progress Tracking Table
| Area | Planned % | Current % | Delta | Notes |
|------|-----------|-----------|-------|-------|
| CI/CD | 0 | 0 | 0 | Not started |
| Database | 0 | 0 | 0 | Schema not committed |
| Core P0 Features | 60 | 45 | -15 | Risk & Standards partial |
| Monitoring | 10 | 5 | -5 | Prometheus up, Grafana TBD |
| VPS Ops | 80 | 70 | -10 | Need SSL & backups cron |
_Update each Friday._

---

## 10. Production Readiness Checklist
- [ ] CI/CD passing on main
- [ ] Secrets in Docker Secrets / Vault
- [ ] Rolling deploy with zero downtime
- [ ] Automated DB migrations (Flyway or Prisma)
- [ ] Backup & restore verified
- [ ] OWASP Top-10 scan clean
- [ ] Rate-limiting & CORS configured
- [ ] Observability dashboards (Grafana) reviewed
- [ ] Disaster recovery doc published

---

## 11. Decision-Making Frameworks
1. **MoSCoW** – Must / Should / Could / Won’t for feature inclusion.
2. **RICE** – Reach × Impact × Confidence ÷ Effort to rank backlog items.
3. **YAGNI Guard** – Challenge any PR that adds scope not linked to PRD P0/P1.
4. **Cost of Delay** – If unsure, optimise for time-to-learning.

> Use these labels in issues: `moscow:must`, `rice:high`, `yagni-check`.

---

## 12. Living Document
- Update after **each sprint retro**.
- Keep change log at bottom with date + author.

---

### Change Log
| Date | Author | Notes |
|------|--------|-------|
| 2025-08-06 | Jay Dee & Factory Assistant | Initial roadmap |
