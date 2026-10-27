# 📚 KomKostra Instruksjons- og Retningslinjesamling

Velkommen til den offisielle styrings- og instruksjonsmappen for **KomKostra** – Kristiansand kommunes helhetlige økonomistyrings- og KOSTRA-rapporteringsplattform bygget på Power BI Project (**PBIP**), **TMDL** og **PBIR**.

Denne samlingen etablerer standarder for prosjektstyring, datamodellering, DAX-beregninger, visuell formidling (Edward Tufte), datakvalitet (DQA) og retningslinjer for AI-agenter.

---

## 🗂️ Innholdsfortegnelse

| Dokument | Formål & Målgruppe | Nøkkelinnhold |
| :--- | :--- | :--- |
| **[`01_PROJECT_WORKFLOW_AND_OPERATIONS.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/01_PROJECT_WORKFLOW_AND_OPERATIONS.md)** | Prosjektoperasjoner & Git | PBIP-arkitektur, versjonskontroll med TMDL/PBIR, månedlig avstemmingsrutine, oppdatering av faktadata. |
| **[`02_DATA_MODEL_AND_ETL_STANDARDS.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/02_DATA_MODEL_AND_ETL_STANDARDS.md)** | Stjerneskjema & Power Query | 1:N stjernemodell, Folder-import, parameterisering av stier, håndtering av foreldreløse nøkler (*orphan keys*). |
| **[`03_DAX_AND_FINANCIAL_LOGIC.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/03_DAX_AND_FINANCIAL_LOGIC.md)** | Finansiell logikk & DAX | Avviksformel ($Budsjett - Regnskap$), 78 måltall, MoM, YTD, S-kurver, What-If simulering, kNOK-standard. |
| **[`04_TUFTE_VISUAL_STANDARDS.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/04_TUFTE_VISUAL_STANDARDS.md)** | Visualisering & Tufte-prinsipper | Data-Ink Ratio: null vertikale gitterlinjer, dempede farger, direkte etiketter, FT Visual Guide og Time-Visuals 60. |
| **[`05_DATA_QUALITY_AND_ASSURANCE_DQA.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/05_DATA_QUALITY_AND_ASSURANCE_DQA.md)** | Revisjon & Datakvalitet | 4-siders DQA-kontroll, dekningsmatrise, konsistenssjekk, kobling mot SSB KOSTRA-veiledere. |
| **[`06_ANTIGRAVITY_AGENT_INSTRUCTIONS.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/06_ANTIGRAVITY_AGENT_INSTRUCTIONS.md)** | AI-agent Governance | Retningslinjer for AI-kodestøtte, sikker redigering av TMDL, lokale SQL-arbeidsflyter (DuckDB/SQLite), rollback-sikring. |
| **[`docs/POWERBI_TO_EXCEL_INTEGRATION.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/docs/POWERBI_TO_EXCEL_INTEGRATION.md)** | Excel & Power BI Samhandling | 4 metoder for å koble Power BI Desktop til Excel (SSAS lokal port, DuckDB, DAX Studio, Python in Excel). |
| **[`docs/DATABASE_AND_EXCEL_STRUCTURE.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/docs/DATABASE_AND_EXCEL_STRUCTURE.md)** | Database- & ML-arkitektur | DuckDB stjerneskjema, `src/db_manager.py` byggeskript og oppsett for `KOSTRA_ML_AdHoc_Analyse.xlsx`. |

---

## 🎯 Raske Operasjonelle Snarveier

1. **Åpne rapporten i Power BI Desktop:**  
   Dobbeltklikk på [`pbi-rep-project.pbip`](file:///C:/Users/frank/Desktop/Kom%20-%20G/pbi-rep-project.pbip).
2. **Legge til nye regnskapstall:**  
   Plasser nye CSV-filer i [`powerbi_kostra_datamodell/faktatabeller/`](file:///C:/Users/frank/Desktop/Kom%20-%20G/powerbi_kostra_datamodell/faktatabeller/) og trykk *Oppdater* i Power BI Desktop.
3. **Kvalitetssikring før ledelsespresentasjon:**  
   Følg 4-trinns sjekklisten i [`05_DATA_QUALITY_AND_ASSURANCE_DQA.md`](file:///C:/Users/frank/Desktop/Kom%20-%20G/instructions/05_DATA_QUALITY_AND_ASSURANCE_DQA.md).
