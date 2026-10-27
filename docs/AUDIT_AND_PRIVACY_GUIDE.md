# Transparens, Personvern, Logging og Audit Guide 🛡️

Denne veiledningen beskriver hvordan **Antigravity KOSTRA AI Workbench** ivaretar strengt personvern (GDPR), transparens, uforanderlig audit-logging og innsynsrett etter Offentleglova.

---

## 1. Personvern og GDPR (Data Protection)

1. **Aggregerte data uten PII:** Databasen (`kostra.duckdb`) opererer på samlede KOSTRA-kontokoder (f.eks. `101000 Fastlønn`) og funksjonskoder (f.eks. `2020 Grunnskole`). Det behandles ingen personalopplysninger eller enkeltansatte.
2. **100 % Lokal databehandling:** Regnskapsdata og vektordatabasen (`ChromaDB`) behandles lokalt i din Docker-container / på din PC.
3. **API Skjerming:** Ved bruk av Gemini API over HTTPS garanterer Google Enterprise Privacy at data ikke benyttes til modelltrening.

---

## 2. Serper API vs. Spider API vs. Lokal RAG (Sikkerhetsprinsipper)

* **Lokal RAG (PDF-er i localblob):** 100 % isolert på maskinen. Sjekker *Kommuneloven*, *Anskaffelsesstrategi Kristiansand* og *Terskelverdier*.
* **Spider API (Dokument-parsing):** Henter og renser offentlig tilgjengelige nettsider til Markdown uten at interne regnskapstall eksponeres.
* **Serper API (Google Search):** Sender kun generelle, anonymiserte juridiske søkeord (f.eks. `"Anskaffelsesforskriften § 5-1 terskelverdi"`). Ingenting av interne avvikstall sendes til eksterne søkemotorer.

---

## 3. Uforanderlig Audit Trail i DuckDB (`audit_log`)

Hver gang Gemini Flash genererer en **Recommended Action**, opprettes en permanent oppføring i DuckDB-tabellen `audit_log`:

```sql
SELECT timestamp, user_id, sektor_funksjon, avvik_belop_nok, recommended_action, search_source 
FROM audit_log 
ORDER BY timestamp DESC;
```

---

## 4. LLM Tracing i MLflow & Saksarkiv (Offentleglova)

* **MLflow LLM Tracing:** På `http://localhost:5000` kan kontrollutvalget inspisere nøyaktig hva som ble spurt om, hvilke paragrafutdrag som ble gitt, og hvilket svar som ble generert.
* **Saksarkiv PDF-eksport:** Ved vedtak kan anbefalingen eksporteres sammen med audit-logg-ID for journalføring i kommunens saksarkiv (f.eks. Elements / Public 360).
