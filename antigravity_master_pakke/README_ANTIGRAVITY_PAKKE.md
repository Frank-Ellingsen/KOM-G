# Antigravity Master Pakke for KOSTRA Power BI (Tilpasset pbi-rep-project.pbip)

Denne masterpakken inneholder den fullstendige, produksjonsklare dokumentasjonen, DAX-kodebiblioteket, visualiseringskatalogene og tekstrapportene for KOSTRA-modellen, 100 % tilpasset og validert mot Power BI-prosjektet **[`pbi-rep-project.pbip`](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)**.

---

## 📁 Innhold i Masterpakken:

1. **[`01_Control_Cockpit_Status_Prognose.md`](file:///c:/Users/frank/Desktop/Kom/antigravity_master_pakke/01_Control_Cockpit_Status_Prognose.md)**:
   * Komplett DAX-kode for Control Cockpit, Status- og Prognoserapport (EOY Forecast).
   * Betinget RAG-formatering (`#D13438` merforbruk, `#FFB900` advarsel, `#107C41` i rute, `#0078D4` mindreforbruk).
   * Dashboard layout og 2x2 gridspesifikasjon etter Edward Tuftes prinsipper.

2. **[`02_FT_Visual_Guide_Integration.md`](file:///c:/Users/frank/Desktop/Kom/antigravity_master_pakke/02_FT_Visual_Guide_Integration.md)**:
   * Kartlegging av alle 9 kjernefunksjonelle temaer i **Financial Times (FT) Visual Guide** (Deviation, Correlation, Ranking, Distribution, Change over Time, Magnitude, Part-to-Whole, Spatial, Flow).
   * Felt- og måltallskonfigurasjon koblet direkte mot `fact_data` og dimensjonene.

3. **[`03_Time_Visuals_60_Katalog.md`](file:///c:/Users/frank/Desktop/Kom/antigravity_master_pakke/03_Time_Visuals_60_Katalog.md)**:
   * Komplett katalog over **alle 60 tidsserie-visualiseringer** fra Time-Visuals.pdf.
   * Fullstendig DAX-kode og visualoppsett for Bullet Charts (#33), Index Charts Base 100 (#37), Slope Graphs (#40 & #49), Sparklines (#10 & #54) og glidende snitt (#11).

4. **[`04_Datainnsikt_og_Funnrapport.md`](file:///c:/Users/frank/Desktop/Kom/antigravity_master_pakke/04_Datainnsikt_og_Funnrapport.md)**:
   * Finansiell tekstrapport for Project Controller basert på de faktiske CSV-kildedataene (Jan–Aug 2024).
   * Konkrete funn på overforbruk i Skolesektoren (-944 000 kr) og Helse/Bomiljø (-1 285 614 kr).
   * Årsaksforklaringer (vikarbruk på konto `102013`/`102000`, overtid på `104000` og byråkjøp på `127040`).
   * Konkret omdisponerings- og kuttmodellering for EOY-balanse.

5. **[`05_Slicers_TextSelection_Layout.md`](file:///c:/Users/frank/Desktop/Kom/antigravity_master_pakke/05_Slicers_TextSelection_Layout.md)**:
   * Konfigurasjon av slicere, synkronisering (Sync Slicers) og nullstillingsknapp (Reset Bookmark).
   * DAX for dynamiske tekstbokser (Selection Display) for overskrifter og utsnittsvisning.
   * Edward Tuftes UX/UI-retningslinjer (høy Data-Ink ratio, ingen vertikale rutenettlinjer, ingen bakgrunnsskygger).

---

## 🛠️ Integrasjon mot pbi-rep-project.pbip:

Modellen er tilrettelagt for to bruksmåter:

### Metode 1: Native TMDL (Ingen eksterne verktøy nødvendig)
Tabellen **`_Måltall`** med alle 41 måltall er lagt direkte inn i TMDL-format i prosjektet:
* [`pbi-rep-project.SemanticModel/definition/tables/_Måltall.tmdl`](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.SemanticModel/definition/tables/_Måltall.tmdl)
* Koblet i [`pbi-rep-project.SemanticModel/definition/model.tmdl`](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.SemanticModel/definition/model.tmdl)
* Når du åpner `pbi-rep-project.pbip` i **Power BI Desktop**, ligger alle måltallene klare i feltlisten sortert i 8 undermapper med kalkulator-ikon øverst.

### Metode 2: Tabular Editor C# Script
Dersom du foretrekker å gjøre endringer eller re-kjøre måltallsopprettelsen fra Tabular Editor:
* Bruk skriptet i **[`tabular_editor_dax_script.md`](file:///c:/Users/frank/Desktop/Kom/tabular_editor_dax_script.md)**.
* Skriptet er tilpasset `fact_data` og `dim_kostra_kontoplan[Kontokode_6Siffer]` som tekststrenger.
