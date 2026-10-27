# Antigravity KOSTRA AI Workbench - Full Oppdatert Pakke 🚀

Komplett lokal AI- og Power BI-workbench for kommunal økonomistyring, avviksanalyse, uforanderlig audit-logging og preskriptiv juridisk vurdering.

---

## 📦 Inkluderte Filer i Pakken:

1. **`app.py`**: Streamlit Web UI med Gemini Flash, DuckDB live-tall, RAG, Serper API og uforanderlig audit-logging.
2. **`db_manager.py`**: DuckDB databasebygger med uforanderlig `audit_log`-tabell og automatisk Excel-eksport.
3. **`retrain_pipeline.py`**: ML-omtreningsskript med MLflow-loggingsmotor og Model Drift-deteksjon.
4. **`run.ps1`**: Komplett PowerShell-skript for alle prosjektaktiviteter (`-All`, `-BuildDB`, `-Up`, `-Retrain`, `-GitPush`).
5. **`docker-compose.yml`**: Multi-container Docker med Streamlit Workbench (Port 8501) og MLflow UI (Port 5000).
6. **`Dockerfile`**: Container-definisjon for Python 3.11.
7. **`env-example`**: Mal for API-nøkler (`GEMINI_API_KEY`, `SPIDER_API_KEY`, `SERPER_API_KEY`).
8. **`gitignore`**: Git-avskjerming for hemmeligheter, `.env` og databaser.
9. **`AUDIT_AND_PRIVACY_GUIDE.md`**: Komplett veileder for GDPR, transparens, audit logging, Serper/Spider sikkerhet og Offentleglova.

---

## ⚡ Quickstart med PowerShell:

```powershell
# 1. Bygg DuckDB, start Docker AI Stack og åpne dashboarder
.\run.ps1 -All
```

### Tilgang i nettleseren:
* **Streamlit AI Workbench:** `http://localhost:8501`
* **MLflow Tracking UI:** `http://localhost:5000`
