# KOSTRA Rapportpakke – Komplett Dokumentasjon for Økonomistyring 2024
**Kristiansand Kommune – Periodisk Månedsrapport per August (Måned 08)**

---

Dette er den komplette rapportpakken for **Kristiansand kommune / KOSTRA Chart of Accounts**, utarbeidet for kommunedirektøren, formannskapet, bystyret, kommunalsjefene og controllerteamet.

Rapportpakken inneholder 6 spesialiserte **Markdown-rapporter (.md)** som dekker hele spekteret fra overordnet politisk ledelsesrapportering til detaljerte sektorrapporter, månedsutvikling, KOSTRA-strukturanalyse og What-If simuleringsmodeller for kutt og rammestyring.

Alle rapportene er 100 % synkronisert med Power BI-prosjektet [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) og bygger utelukkende på faktiske data fra datamodellens faktatabell (`fact_data`).

> **Standard konvensjon:**  
> - **Måleenhet:** Alle beløp er oppgitt i **tusen kroner (kNOK)** med én desimal.  
> - **Rapporteringsperiode:** **Siste avsluttede regnskapsmåned (Måned 08 / August 2024)** og **akkumulert YTD (Måneder 01–08)**.

---

## 📁 Innhold i Rapportpakken og Kobling til Power BI

| Rapportfil | Rapporttittel | Power BI Side & Mappe | Målgruppe | Hovedfokus |
| :--- | :--- | :--- | :--- | :--- |
| [01_Hovedrapport_Kommuneokonomi_2024.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/01_Hovedrapport_Kommuneokonomi_2024.md) | **Hovedrapport for Økonomi og Virksomhetsstyring 2024** | `p01_executive_summary`<br>*(01. Hovedrapport (Kommuneøkonomi 2024))* | Kommunedirektør, Formannskap, Bystyre | Konsolidert månedsstatus (M08: -350,7 kNOK / YTD: -2 229,6 kNOK), risikobilde og strategiske anbefalinger. |
| [02_Sektorrapport_Oppvekst_og_Utdanning.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/02_Sektorrapport_Oppvekst_og_Utdanning.md) | **Sektorrapport: Oppvekst og Utdanning** | `p02_trend_og_tidsserie`<br>*(02. Sektor: Oppvekst og Utdanning)* | Kommunalsjef Oppvekst, Rektorer, Økonomirådgivere | Dypdykk i skolesektoren (`KomSkole`), funksjon 2020/2140/2210, årsaker til merforbruk på overtid og vikarer, 3-punkts tiltaksplan. |
| [03_Sektorrapport_Helse_og_Mestring.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/03_Sektorrapport_Helse_og_Mestring.md) | **Sektorrapport: Helse og Mestring / Bomiljø** | `p04_avvik_og_drivere`<br>*(03. Sektor: Helse og Mestring)* | Kommunalsjef Helse, Enhetsledere Omsorg/Sone | Dypdykk i omsorgssektoren (`Bomiljø`), analyse av vikarbyråkjøp (253,2 kNOK i M08) og turnustillegg. |
| [04_Manedlig_Avviks_og_Prognoserapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/04_Manedlig_Avviks_og_Prognoserapport.md) | **Månedlig Avviks- og Prognoserapport** | `p03_tufte_scurve_og_prognose`<br>*(04. Månedlig Avvik og Prognose)* | Økonomiavdelingen, Controllerteam | Periodisk utvikling (Jan–Aug 2024), S-kurver, 3M Moving Average, EOY Run-Rate prognoser (-3 344,4 kNOK) og toleransegrenser. |
| [05_KOSTRA_Struktur_og_Nokkeltallrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/05_KOSTRA_Struktur_og_Nokkeltallrapport.md) | **KOSTRA Struktur- og Nøkkeltallrapport** | `p05_pareto_og_korrelasjon`<br>*(05. KOSTRA Struktur og Nøkkeltall)* | Statlig rapportering, Økonomiplanteam | Kobling mellom statlig KOSTRA-funksjon/art og intern ansvarsstruktur, personellandeler og korrelasjonsanalyse. |
| [06_Omdisponerings_og_Kuttsimuleringsrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/06_Omdisponerings_og_Kuttsimuleringsrapport.md) | **What-If Scenario- og Balanserapport** | `p06_scenario_simulering`<br>*(06. What-If Scenario og Balanse)* | Kommunedirektørens ledergruppe, Finansutvalg | Tre modellerte scenarier (A: Status Quo, B: 30% Kutt, C: 60% Kutt + Rammejustering) for å oppnå 0-balanse ved årets slutt. |

---

## 📊 Nøkkeltallsammendrag per Siste Avsluttede Måned (Måned 08 / August 2024)

### Tabell 1: Driftsresultat Måned 08 (August 2024 isolert)

| Sektor | Revidert Budsjett (kNOK) | Faktisk Regnskap (kNOK) | Avvik Kr (kNOK) | Forbruk % | Status RAG |
| :--- | ---: | ---: | ---: | ---: | :---: |
| **Oppvekst og Utdanning (Skole)** | 2 245,0 | 2 363,0 | **-118,1** | 105,26 % | 🔴 Merforbruk |
| **Helse og Omsorg (Bomiljø)** | 1 525,2 | 1 757,7 | **-232,6** | 115,25 % | 🔴 Merforbruk |
| **KONSOLIDERT MÅNED 08** | **3 770,1** | **4 120,8** | **-350,7** | **109,30 %** | 🔴 Merforbruk |

### Tabell 2: Akkumulert Driftsstatus YTD per Måned 08 (Januar–August 2024)

| Sektor | Budsjett YTD (kNOK) | Regnskap YTD (kNOK) | Avvik Kr YTD (kNOK) | Forbruk % | Status RAG |
| :--- | ---: | ---: | ---: | ---: | :---: |
| **Oppvekst og Utdanning (Skole)** | 17 958,0 | 18 902,0 | **-944,0** | 105,26 % | 🔴 Merforbruk |
| **Helse og Omsorg (Bomiljø)** | 11 337,2 | 12 622,9 | **-1 285,6** | 111,34 % | 🔴 Merforbruk |
| **KONSOLIDERT YTD TOTALT** | **29 295,2** | **31 524,9** | **-2 229,6** | **107,61 %** | 🔴 Samlet merforbruk |

---

## 💡 Hovedkonklusjoner & Strategisk Retning

1. **Gjennomgående merforbruk drevet av variable personalkostnader:** Både skolesektoren (-944,0 kNOK YTD) og helsesektoren (-1 285,6 kNOK YTD) overskrider tildelte budsjettrammer. Fire variable personalkonti (`102000`, `102013`, `104000` og `127040`) står alene for **71,4 % av det samlede merforbruket (-1 591,8 kNOK)**.
2. **Kritisk innleievekst i august:** Vikarbyråkjøp i helsesektoren (`127040`) eksploderte til **253,2 kNOK** i august måned under sommerturnusen.
3. **Kompenserende tiltakspakke:** Gjennom en kombinasjon av 60 % kutt i overtid og vikarbyråinnleie samt administrativ rammejustering i 2. tertial, kan kommunen oppnå **fullstendig 0-balanse ved årets slutt (EOY)**.
4. **Power BI Integrasjon:** Alle rapportene er fullt implementert i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) og konfigurert i henhold til Edward Tuftes standarder for høy datablekk-faktor.

---
*Rapportpakken er generert for Kristiansand kommune – KOSTRA Chart of Accounts.*
