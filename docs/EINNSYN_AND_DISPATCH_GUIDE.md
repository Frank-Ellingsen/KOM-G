# Veileder: eInnsyn, NOARK 5 og Automatisk Forsendelse 🏛️

Dette dokumentet beskriver hvordan **Antigravity KOSTRA AI Workbench** integreres mot kommunens saksarkiv (**Public 360**, **Elements**, **ACOS Websak**) og **eInnsyn** ved bruk av **NOARK 5-kompatibel metadata** og automatisk PDF-eksportering.

---

## 🏛️ 1. NOARK 5 og eInnsyn Integrasjonsarkitektur

Når saksbehandler eller kommunedirektør trykker på **"📄 Last ned Saksutredning som PDF"** i Streamlit-grensesnittet, opprettes ikke bare PDF-filen, men også en tilhørende **NOARK 5 JSON-metadatafil**.

```text
[ Streamlit AI Workbench ]
            │
            ├─► Genererer PDF Saksutredning (pdf_generator.py)
            │
            └─► Genererer NOARK 5 JSON Sidecar (dispatch_manager.py)
                        │
                        ▼
          [ Hotfolder: data/einnsyn_import/ ]
            ├── saksutredning_LOG-20261027.pdf
            └── saksutredning_LOG-20261027_noark5_metadata.json
                        │
                        ▼
    [ Municipal Sak/Arkiv System (Public 360 / Elements) ]
                        │
                        ▼
             [ eInnsyn / Offentleglova ]
```

---

## 📋 2. NOARK 5 Metadata-struktur (`metadata.json`)

Metadatafilen overfører alle nødvendige saksdata direkte til saksbehandlers arkivkø:

```json
{
  "noark_version": "5.0",
  "system_id": "KOSTRA-AI-WORKBENCH",
  "journalpost": {
    "tittel": "Saksutredning KOSTRA Avvik - Område 2 Oppvekst (2020 Grunnskole)",
    "journaldato": "2026-10-27",
    "dokumenttype": "N - Internt notat med oppfølging",
    "tilgangsrestriksjon": "Offentlig (Offentleglova § 3)",
    "saksbehandler": "KOSTRA AI Workbench / Gemini 3.8 Flash",
    "sektor": "Område 2 Oppvekst",
    "funksjon": "2020 Grunnskole",
    "audit_ref_id": "LOG-202610271425",
    "opprettet_tidspunkt": "2026-10-27T14:25:00"
  },
  "filer": [
    {
      "filnavn": "saksutredning_LOG-20261027.pdf",
      "format": "PDF/A-1b",
      "mime_type": "application/pdf"
    }
  ]
}
```

---

## ⚡ 3. Automatisk Kjøring via PowerShell (`run.ps1`)

Du kan styre eInnsyn-eksporteringen og e-postutsendelsen direkte fra PowerShell i VS Code:

### A. Eksporter til Hotfolder (Public 360 / Elements)
```powershell
.\run.ps1 -DispatchPDF
```
* **Hva som skjer:** Finner den senest genererte PDF-saksutredningen i `data/reports/`, kopierer den til `data/einnsyn_import/` og oppretter NOARK 5 metadatafilen.

### B. Send e-postforsendelse til Postmottak eller Enhetsleder
```powershell
.\run.ps1 -SendEmail -Recipient "postmottak@kristiansand.kommune.no"
```
* **Hva som skjer:** Legger PDF-filen ved som e-postvedlegg med ferdig utfylt emnefelt og saksnotat.

### C. Helhetlig Oppstart og Synkronisering
```powershell
.\run.ps1 -All
```
* **Hva som skjer:** Bygger DuckDB, om-trener ML-modeller, eksporterer eInnsyn PDF/JSON, starter Docker (Streamlit + MLflow) og åpner nettleserfanene!

---

## 🔒 4. Personvern og Offentleglova § 3

* **Innsynsrett:** Saksutredningene som AI-workbench-en genererer er utformet som interne notater for oppfølging av budsjettavvik (*N-notater*).
* **Skjerming av sensitive data:** Siden KOSTRA-tallene er aggregerte regnskapstall, er dokumentene som hovedregel offentlige etter *Offentleglova § 3*.
* **Audit-sporing:** Hver PDF inneholder en uforanderlig `Audit Ref ID` som peker direkte tilbake til den e-post- og brukeridentifiserte loggen i `kostra.duckdb`.
