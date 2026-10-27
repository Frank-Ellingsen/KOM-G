# ⚙️ 01: Prosjektarbeidsflyt og Operasjonell Drift

Dette dokumentet beskriver operasjonelle rutiner, livssyklus og versjonskontroll for **KomKostra** i Power BI Developer Mode (**PBIP**).

---

## 1. PBIP Mappestruktur og Komponenter

Prosjektet er lagret i ren tekstform for Git-sporing via Microsoft PBIP:

```text
Kom - G/
├── pbi-rep-project.pbip              # Hovedpeker / Oppstartsfil for Power BI Desktop
├── pbi-rep-project.Report/           # PBIR (Power BI Report format - JSON)
│   ├── definition/
│   │   ├── pages/                   # 25 rapportside-definisjoner
│   │   └── report.json              # Rapportkonfigurasjon og tema
│   └── StaticResources/             # Temaer, fonter og ressurser
├── pbi-rep-project.SemanticModel/    # TMDL (Tabular Model Definition Language)
│   └── definition/
│       ├── expressions.tmdl         # Power Query M hjelpefunksjoner og parametere
│       ├── model.tmdl               # Modellmeta og innstillinger
│       ├── relationships.tmdl       # Relasjoner (1:N stjerneskjema)
│       └── tables/                  # TMDL-definisjon per tabell og måltall (_Måltall.tmdl)
├── powerbi_kostra_datamodell/        # Kildedata (CSV)
│   ├── dimensjoner/                 # dim_ansvar, dim_date, dim_kostra_*, dim_sikkerhet
│   └── faktatabeller/               # Månedlige faktafiler (f.eks. 2024_01 til 2024_08)
├── docs/                             # Prosjektdokumentasjon, DQA-rapporter og referanser
│   ├── assets/screenshots/          # Skjermbilder og rapportdokumentasjon
│   └── references/                  # FT Visual Guide, Time-Visuals, metodikknotater
├── archive/                          # Historiske bygg og binære arkiver (.pbix)
└── instructions/                     # Operasjonelle standarder og veiledere (denne mappen)
```

---

## 2. Versjonskontroll og Git-Rutiner

Fordi rapporten er lagret som **PBIR/TMDL**, kan alle endringer spores linje for linje i Git.

### A. Anbefalt Branching-Strategi
* `main`: Produksjonsklar tilstand. Skal alltid kunne åpnes og oppdateres feilfritt i Power BI Desktop.
* `feature/<navn>`: Utvikling av nye dashboardsider, nye DAX-måltall eller utvidede dimensjoner.
* `data-update/m<XX>`: Ingestion av nye månedsuttrekk fra Visma Enterprise / Framsikt.

### B. Filhygiene og .gitignore
* `.pbi/localSettings.json` og `cache.abf` skal **aldri** sjekkes inn (disse er personlige og maskinspesifikke).
* Binære `.pbix`-filer lagres i `archive/` og ignoreres i Git for å forhindre depotvekst.

---

## 3. Månedlig Avstemmings- og Oppdateringsrutine (Månedsavslutning)

Når en ny regnskapsmåned (f.eks. Måned 09 / September) er avsluttet i ERP-systemet:

1. **Eksporter kildedata:**
   * Trekk ut månedens regnskap og periodisert budsjett per sektor i henhold til KOSTRA-standarden:
     * `2024_09_fact_bomiljo.csv`
     * `2024_09_fact_komskole.csv`
2. **Datavalidering før innlasting:**
   * Kontroller at filene inneholder de påkrevde 7 kolonnene:  
     `Dato, KOSTRA_Funksjonsgruppe_Kode, Kontokode_6Siffer, Ansvar_Kode, Sektor, Budsjett, Regnskap`.
   * Verifiser at enkoding er UTF-8 (65001) og at komma (`,`) er skilletegn.
3. **Plassering i faktamappen:**
   * Kopier de nye CSV-filene til:  
     [`powerbi_kostra_datamodell/faktatabeller/`](file:///C:/Users/frank/Desktop/Kom%20-%20G/powerbi_kostra_datamodell/faktatabeller/)
4. **Oppdatering i Power BI Desktop:**
   * Åpne [`pbi-rep-project.pbip`](file:///C:/Users/frank/Desktop/Kom%20-%20G/pbi-rep-project.pbip).
   * Klikk **Hjem > Oppdater (Refresh)**.
   * Modellen leser automatisk inn de nye filene via `Folder.Files`-funksjonen i Power Query.
5. **Kjør DQA-kontroll (Data Quality & Assurance):**
   * Naviger til rapportside `07. DQA Kontroll` og verifiser:
     * At Måned 09 vises med grønn status i Dekningsmatrisen.
     * At antall "Foreldreløse nøkler" (Orphan keys) er `0`.
     * At totalt avvik stemmer på øret mot rådata.
