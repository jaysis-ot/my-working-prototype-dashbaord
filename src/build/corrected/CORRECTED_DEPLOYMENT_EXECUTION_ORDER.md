# ✅ Corrected Deployment Execution Order  
**File:** `src/build/corrected/CORRECTED_DEPLOYMENT_EXECUTION_ORDER.md`  
**Version:** 1.0.0 • 2025-07-28  

This document supersedes the previous deployment order. It fixes naming mismatches, path inconsistencies, dependency gaps, and adds mandatory validation / rollback at every phase.  

---

## 0. Global Prerequisites

| Requirement | Minimum | Validation Command |
|-------------|---------|---------------------|
| Ubuntu Server | 24.04 LTS | `grep VERSION_ID /etc/os-release` |
| CPU / RAM / Disk | 4 cores / 16 GB / 100 GB | `lscpu && free -h && df -h /` |
| Root / sudo | yes | `sudo -v` |
| Internet access | outbound 443 | `curl -I https://github.com` |
| Domain & DNS | FQDN resolves to host | `dig +short risk-platform.example.com` |

Failing any check **aborts** execution.

```bash
# one-liner prerequisite validator
/opt/risk-platform/scripts/validate/prerequisites.sh   # ← MUST exist (create if missing)
```

---

## Directory & Script Map (Canonical)

```
/opt/risk-platform
├── scripts
│   ├── automation              # ← main orchestration
│   │   └── refactored_automation_script.sh
│   ├── database
│   │   └── database_setup_script.sh
│   ├── validation
│   │   ├── validate_database.sh
│   │   └── validate_platform.sh
│   ├── rollback
│   │   ├── rollback_database.sh
│   │   └── rollback_platform.sh
│   ├── operational
│   │   ├── create_essential_scripts.sh
│   │   ├── install_operational_scripts.sh
│   │   ├── create_final_scripts.sh
│   │   └── install_final_scripts.sh
│   └── security
│       └── manage_certificates.sh
└── docker-compose
    ├── base.yml
    └── db.yml
```

> 📌 **Missing Script Notice**  
> If any script above is not yet present, create a *stub* that prints “NOT IMPLEMENTED – ABORTING” and exits with code 1. This prevents silent failures.

---

## Phase-by-Phase Execution

| # | Phase | Driver Script & Mode | Expected Duration | Validation Gate |
|---|-------|----------------------|-------------------|-----------------|
| 1 | System Hardening | `refactored_automation_script.sh --system` | 15 m | `validate/prerequisites.sh` |
| 2 | Docker Engine | `refactored_automation_script.sh --docker` | 10 m | `docker --version` |
| 3 | Project Structure | `refactored_automation_script.sh --structure` | 5 m | `ls -la /opt/risk-platform/{scripts,database}` |
| 4 | Database Layer | `database/database_setup_script.sh` | 15 m | `validation/validate_database.sh` |
| 5 | API + Monitoring | `refactored_automation_script.sh --services` | 10 m | `curl -f http://localhost:3000/health` |
| 6 | Service Deployment | `refactored_automation_script.sh --deploy` | 10 m | `validation/validate_platform.sh` |
| 7 | Operational Tooling | `operational/{create_essential_scripts.sh,install_operational_scripts.sh}` | 5 m | `risk-platform --help` |
| 8 | Advanced Tooling | `operational/{create_final_scripts.sh,install_final_scripts.sh}` | 5 m | `risk-platform-ioc list` |
| 9 | TLS & Integrations | `security/manage_certificates.sh` | 10 m | Browser loads HTTPS site |
|10 | Prod Hardening | `risk-platform security verify` | 5 m | No “FAIL” lines in report |

Phases **must** be executed sequentially. Each validation gate must return exit code 0 before advancing.

---

### Detailed Steps, Validation & Roll-backs

#### Phase 1 – System Hardening

```bash
sudo /opt/risk-platform/scripts/automation/refactored_automation_script.sh --system
```

Validation:  

```bash
sudo ufw status | grep -q "Status: active"           # firewall
sudo systemctl is-active fail2ban                    # intrusion
```

Rollback: `/opt/risk-platform/scripts/rollback/rollback_platform.sh --system`  
(undo UFW rules, restore sshd_config.backup)

---

#### Phase 2 – Docker Engine

```bash
sudo /opt/risk-platform/scripts/automation/refactored_automation_script.sh --docker
```

Validation: `docker info && docker compose version`

Rollback: disable and purge docker packages.

---

#### Phase 3 – Project Structure

```bash
sudo /opt/risk-platform/scripts/automation/refactored_automation_script.sh --structure
```

Validation: permissions 750 on `database` and `scripts`.

Rollback: remove `/opt/risk-platform` directory (only if no data yet).

---

#### Phase 4 – Database Layer

```bash
/opt/risk-platform/scripts/database/database_setup_script.sh
/opt/risk-platform/scripts/validation/validate_database.sh
```

Validation Script checks:  
* PG container healthy  
* 15+ tables exist  
* Redis responds to `PING`

Rollback: `/opt/risk-platform/scripts/rollback/rollback_database.sh`  
(stops compose-db stack, drops volumes)

---

#### Phase 5 – API & Monitoring Services

```bash
sudo /opt/risk-platform/scripts/automation/refactored_automation_script.sh --services
```

Validation:  

```bash
curl -f http://localhost:3000/health
curl -f http://localhost:9090/-/healthy
```

Rollback: bring down service containers only.

---

#### Phase 6 – Service Deployment

```bash
sudo /opt/risk-platform/scripts/automation/refactored_automation_script.sh --deploy
sleep 180
/opt/risk-platform/scripts/validation/validate_platform.sh
```

Rollback: `/opt/risk-platform/scripts/rollback/rollback_platform.sh --deploy`

---

#### Phase 7 – Essential Operational Tooling

```bash
/opt/risk-platform/scripts/operational/create_essential_scripts.sh
/opt/risk-platform/scripts/operational/install_operational_scripts.sh
```

Validation: `risk-platform platform status`

Rollback: uninstall binaries under `/usr/local/bin/risk-platform*`

---

#### Phase 8 – Final Tooling

```bash
/opt/risk-platform/scripts/operational/create_final_scripts.sh
/opt/risk-platform/scripts/operational/install_final_scripts.sh
```

Validation: `risk-platform-analytics executive-dashboard`

Rollback: remove added scripts, restore previous config backups.

---

#### Phase 9 – TLS & Integrations

```bash
/opt/risk-platform/scripts/security/manage_certificates.sh risk-platform.example.com letsencrypt
docker compose -f /opt/risk-platform/docker-compose/base.yml restart nginx
```

Validation: `curl -k https://risk-platform.example.com/health`

Rollback: revert nginx.conf.backup and restart nginx.

---

#### Phase 10 – Production Hardening Audit

```bash
risk-platform security verify
```

Validation passes when the tool prints `ALL CHECKS PASSED`.

Rollback: address failing items individually; do **not** proceed to go-live until resolved.

---

## 🎯 Master Safe-Resume Deployment Script

`/opt/risk-platform/scripts/automation/deploy_all.sh`

```bash
#!/bin/bash
# Master orchestrator – idempotent & resumable
set -e
PHASE_FILE="/opt/risk-platform/.deploy_phase"

phase_done()  { echo "$1" > "$PHASE_FILE"; }
current_phase(){ [[ -f $PHASE_FILE ]] && cat "$PHASE_FILE" || echo "0"; }

case "$(current_phase)" in
  0)  ./automation/refactored_automation_script.sh --system        && phase_done 1 ;;
  1)  ./automation/refactored_automation_script.sh --docker        && phase_done 2 ;;
  2)  ./automation/refactored_automation_script.sh --structure     && phase_done 3 ;;
  3)  ./database/database_setup_script.sh                          && \
      ./validation/validate_database.sh                            && phase_done 4 ;;
  4)  ./automation/refactored_automation_script.sh --services      && phase_done 5 ;;
  5)  ./automation/refactored_automation_script.sh --deploy        && \
      ./validation/validate_platform.sh                            && phase_done 6 ;;
  6)  ./operational/create_essential_scripts.sh                    && \
      ./operational/install_operational_scripts.sh                 && phase_done 7 ;;
  7)  ./operational/create_final_scripts.sh                        && \
      ./operational/install_final_scripts.sh                       && phase_done 8 ;;
  8)  ./security/manage_certificates.sh risk-platform.example.com letsencrypt && phase_done 9 ;;
  9)  risk-platform security verify                                && phase_done 10 ;;
  10) echo "🎉 Deployment already completed."; exit 0 ;;
  *)  echo "Unknown phase state"; exit 1 ;;
esac

echo "Phase $(current_phase) completed successfully."
echo "Rerun this script to resume the next phase if interrupted."
```

---

## Security Checkpoints Summary

| Checkpoint | Tool / Command | Phase |
|------------|----------------|-------|
| OS CIS Hardening | `lynis audit system` | 1 |
| Container Vulnerability Scan | `docker scan --file Dockerfile api` | 5 |
| DB Password Complexity | evaluated by `validate_database.sh` | 4 |
| Certificate Integrity | `openssl x509 -noout -text -in cert.pem` | 9 |
| Final Audit | `risk-platform security verify` | 10 |

---

## Troubleshooting Matrix

| Symptom | Likely Cause | Diagnostic Command | Remediation |
|---------|--------------|--------------------|-------------|
| Docker fails to start | Low kernel version | `journalctl -u docker` | `sudo apt dist-upgrade` |
| API container restart loop | DB unreachable | `docker logs api` | Validate Phase 4 again |
| Prometheus not scraping | Port clash | `ss -tlnp | grep 9090` | Stop other service |
| TLS handshake error | Wrong domain | `openssl s_client -connect host:443` | Re-issue certificate |
| `risk-platform` cmd not found | PATH not updated | `echo $PATH` | `hash -r && source /etc/profile` |

---

## Change Log

| Date | Author | Description |
|------|--------|-------------|
| 2025-07-28 | Factory Assistant | Initial corrected deployment order |

---

## Next Actions

1. **Create missing stub scripts** flagged above.  
2. **Commit this document** to VCS for peer review.  
3. **Dry-run** phases in a staging server using `deploy_all.sh`.  
4. Capture lessons learned & update rollback scripts accordingly.

