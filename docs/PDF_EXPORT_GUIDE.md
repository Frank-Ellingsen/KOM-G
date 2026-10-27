# Automatisk PDF-Saksutredning & Arkivering (Elements / Public 360) 📄

I **Antigravity KOSTRA AI Workbench** er det integrert en automatisk PDF-rapportgenerator (`pdf_generator.py`) bygd med **ReportLab**.

Når saksbehandlere eller kommunalsjefer genererer et **Recommended Action** eller gjør en juridisk forvaltningssjekk i Streamlit (`app.py`), opprettes det automatisk en formell saksutredning som er klar for nedlasting og journalføring i kommunens saksarkiv (Elements / Public 360).

---

## 🏛️ Innhold i den genererte PDF-saksutredningen:

1. **Kommunalt Brevhode & Tittel:**  
   Offisiell profil for Kristiansand kommune (Økonomi og virksomhetsstyring).
2. **Saksmetadatakort (Info Panel):**  
   Dato, saksbehandler, sektor, KOSTRA-funksjon, konto, Early Warning-statusbadge (🔴 KRITISK / 🟡 AVVIK / 🟢 I RUTE), samt **Audit Log Reference ID**.
3. **Finansielt Tallgrunnlag (Tabell):**  
   Eksakt sammenstilling av `Budsjett`, `Regnskap`, `Avvik YTD` og `Projisert EOY`.
4. **Juridisk Vurdering & Regelverkshjemmel:**  
   Utdrag fra RAG-oppslaget i `localblob` PDF-ene (*Kommuneloven § 16-1*, *Anskaffelsesstrategi Kristiansand*, *DFØ Terskelverdier*).
5. **Preskriptiv Recommended Action (Anbefalt Tiltak):**  
   Formelt innstillingsvedtak generert av Gemini Flash.
6. **Revisjonsspor & GDPR-erklæring:**  
   Ref. ID til uforanderlig `audit_log`-tabell i DuckDB for kontrollutvalget og kommunerevisjonen.

---

## ⚡ Slik fungerer det i Streamlit:

1. Velg et avvik i venstre kolonne i Streamlit-dashboardet.
2. Trykk på **"⚖️ Generer Recommended Action for valgt avvik"**.
3. Gemini Flash orkestrerer svar med kildehenvisninger.
4. Rett under svaret dukker knappen **"📄 Last ned Saksutredning som PDF (Elements / Public 360)"** opp!
