# 📊 04: Edward Tufte Data-Ink Standarder og Visuelt Design

Dette dokumentet etablerer de visuelle retningslinjene for dashboards og rapporter i **KomKostra**, basert på **Edward Tufte's Data-Ink Ratio** og profesjonelle visualiseringstaksonomier (Financial Times Visual Guide og Time-Visuals 60).

---

## 1. Edward Tufte Data-Ink Ratio: Grunnregler

Målet med enhver visualisering i prosjektet er å maksimere andelen blekk som representerer reelle data, og eliminere "chartjunk" (visuell støy).

| Element | Regel i KomKostra | Begrunnelse |
| :--- | :--- | :--- |
| **Vertikale gitterlinjer** | 🚫 **Strengt forbudt** i tabeller, matriser og linjediagrammer. | Skaper unødvendig visuell oppstykking; horisontale linjer holder for lesbarhet. |
| **Skygger og 3D-effekter** | 🚫 **Fjernes helt** fra kort, bannere og diagrammer. | Gir et umoderne inntrykk og stjeler oppmerksomhet fra tallene. |
| **Dekorative ikoner** | 🚫 **Ingen overflødige ikoner** på KPI-kort. | Dataene skal tale for seg selv. |
| **Fargebruk (Color Palette)** | ⚪ **Muted / Nøytral grå og mørkeblå** som basis. | Farger skal kun brukes for å fremheve avvik eller risiko. |
| **Uthevingsfarge (Highlight)** | 🔴 **Rød** reserveres utelukkende for merforbruk / avvik over grenseverdi.<br>🟡 **Gul/Amber** for varselgrense. | Skaper umiddelbar situasjonsforståelse for controllere. |
| **Tufte S-Kurver** | 📈 **Direkte etiketter (Direct Labeling)** på selve kurvene. | Unngå at leseren må se frem og tilbake mellom en fargeforklaring og kurven. |
| **Talljustering i tabeller** | ➡️ **Høyrejuster alle tall**. Venstrejuster tekst. | Sikrer at sifre og desimaler flukter vertikalt for rask sammenligning. |

---

## 2. Integrasjon av Financial Times (FT) Visual Guide

Rapporten implementerer 9 spesialiserte sider basert på Financial Times' visualiseringskatalog:
1. **Deviation (`p_ft01_deviation`):** Divergerende stolpediagrammer sentrert rundt null-aksen. Viser umiddelbart hvem som under- eller overskrider budsjett.
2. **Correlation (`p_ft02_correlation`):** Scatter plots med regresjonslinjer (f.eks. samvariasjon mellom sykefravær og vikarutgifter).
3. **Ranking (`p_ft03_ranking`):** Horisontale stolper og lollipop-grafer sortert etter avviksstørrelse.
4. **Distribution (`p_ft04_distribution`):** Kvartil- og spredningsanalyser over avvik på tvers av tjenestesteder.
5. **Change over Time (`p_ft05_time`):** Stepped lines (trappetrinn) som synliggjør diskrete hopp i utgiftsnivå.
6. **Magnitude (`p_ft06_magnitude`):** Grupperte kolonner (budsjett vs. regnskap) per KOSTRA-funksjon.
7. **Part-to-Whole (`p_ft07_part_to_whole`):** Treemaps som viser proporsjonalt bidrag til samlet kommunalt forbruk.
8. **Spatial (`p_ft08_spatial`):** Fordeling etter geografiske soner og lokasjoner i Kristiansand kommune.
9. **Flow (`p_ft09_flow`):** Allokeringsvannfall fra fellesramme ned til ansvarsområde.

---

## 3. Integrasjon av Time-Visuals 60 Katalog

For tidsrekker og prosjektkontroll implementeres 10 familier fra Time-Visuals katalogen:
* **Familie 1 (Lines):** Standard, stepped og indekserte serier.
* **Familie 2 (Moving Averages):** 3M rullerende gjennomsnitt med konfidensbånd.
* **Familie 3 (Areas):** Stablede arealer som viser sektorenes relative utvikling over året.
* **Familie 4 (Variances):** MoM endringsstolper med fargekodet polaritet.
* **Familie 5 (Running Totals):** Akkumulert Tufte S-kurve mot budsjettbane og EAC.
* **Familie 6 (Bars & Columns):** Grupperte månedskolonner.
* **Familie 7 (Lollipops):** Slanke punktsøyler med referanselinjer for risikoterskler (80 % buffer, 110 % varsel).
* **Familie 8 (Slopes):** Hellingsgrafer (Slope charts) som sammenligner startmåned (Januar) mot siste måned (August).
* **Familie 9 (Sparklines):** Kompakte miniatyrtabeller med innebygde mikrografer for hver KOSTRA-art.
* **Familie 10 (Waterfalls):** Månedlige trinnvise avvik som forklarer differansen mellom opprinnelig budsjett og forventet årssluttresultat (EOY).

---

## 4. Typografi og Formatstandard

* **Skrifttype:** `Segoe UI` eller tilsvarende ren sans-serif med faste tallbredder (tabular figures).
* **Tallformat:**
  * Valuta: `#,##0.0` (kNOK)
  * Prosent: `0.0 %`
  * Desimaltegn: Norsk komma (`,`) eller punktum (`.`) konsekvent avhengig av regionalisering.
