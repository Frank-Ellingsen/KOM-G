# README: KOSTRA Datamodell & Økonomistyring i Power BI

Dette prosjektet leverer en **best-practice datamodell (stjerneskjema)** for kommunal økonomistyring, budsjettoppfølging og KOSTRA-rapportering i Power BI.

Løsningen slår sammen statlige KOSTRA-standarder (Funksjon og Art/Konto) med kommunens interne organisasjonsstruktur (Ansvar/Enhet), og tilrettelegger for automatisert **Folder Import**, **Time Intelligence**, **Prognoser (EOY Forecast)** og **Radnivåsikkerhet (RLS)**.

---

## 📋 Innholdsfortegnelse
1. [Formål & Forretningsverdi](#1-formål--forretningsverdi)
2. [Arkitektur & Datamodell (Stjerneskjema)](#2-arkitektur--datamodell-stjerneskjema)
3. [Mappeimport-strategi (Folder Import)](#3-mappeimport-strategi-folder-import)
4. [Dimensjoner & Hierarkier](#4-dimensjoner--hierarkier)
5. [DAX Måltall & Analysefunksjonalitet](#5-dax-måltall--analysefunksjonalitet)
6. [Sikkerhet & Tilgangsstyring (RLS)](#6-sikkerhet--tilgangsstyring-rls)
7. [Innhold i Leveranse-pakken (Studio Panel)](#7-innhold-i-leveranse-pakken-studio-panel)
8. [Hurtigstart: Slik kommer du i gang i Power BI](#8-hurtigstart-slik-kommer-du-i-gang-i-power-bi)

---

## 1. Formål & Forretningsverdi

* **Brobygger mellom KOSTRA og intern styring:** KOSTRA er utformet for statlig rapportering per funksjon og art. Denne modellen kobler de nasjonale KOSTRA-kodene direkte sammen med kommunens interne ansvarssteder (f.eks. skoler, omsorgssentre, stabsavdelinger).
* **Høyest mulig detaljnivå (Grain):** Modellen bevarer dataene på laveste nivå (6-sifret konto, 4-sifret funksjonsgruppe, 5-sifret ansvar og eksakt dato), noe som gir uendelig drill-down-fleksibilitet.
* **Automatisert skalerbarhet:** Ved bruk av *Folder Import* kan nye månedlige regnskaps- og budsjettuttrekk legges rett i en mappe. Power BI leser, vasker og slår sammen filene automatisk ved et enkelt klikk på **Refresh**.

---

## 2. Arkitektur & Datamodell (Stjerneskjema)

Datamodellen er bygget som et **rent stjerneskjema (Star Schema)** med felles dimensjoner (*Conformed Dimensions*) som filtrerer én konsolidert faktatabell.

```text
                  [ dim_date ]
                       │ (1)
                       ▼ (*)
 [ dim_kostra_funksjon ] ──(1)──► (*) [ fact_regnskap ] ◄──(*)──(1) [ dim_kostra_kontoplan ]
                                              ▲ (*)
                                              │ (1)
                                       [ dim_ansvar ]
```

### Relasjoner i Power BI
| Dimensjon (1-siden) | Primærnøkkel (PK) | Faktatabell (*-siden) | Fremmednøkkel (FK) | Kardinalitet | Cross Filter |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **`dim_date`** | `Dato` | `fact_regnskap` | `Dato` | **1 : \*** | Single |
| **`dim_kostra_kontoplan`** | `Kontokode_6Siffer` | `fact_regnskap` | `Kontokode_6Siffer` | **1 : \*** | Single |
| **`dim_kostra_funksjon`** | `KOSTRA_Funksjonsgruppe_Kode` | `fact_regnskap` | `KOSTRA_Funksjonsgruppe_Kode` | **1 : \*** | Single |
| **`dim_ansvar`** | `Ansvar_Kode` | `fact_regnskap` | `Ansvar_Kode` | **1 : \*** | Single |

---

## 3. Mappeimport-strategi (Folder Import)

Nye faktadata hentes ut fra økonomisystemet (f.eks. Agresso/Unit4, Visma, Xledger) og lagres i mappen `faktatabeller/`.

### Navnestandard for filer
Alle nye filuttrekk må navngis etter standarden: **`YYYY_MM_[Sektor/Kilde].csv`**

**Eksempler:**
* `2024_01_fact_bomiljo.csv`
* `2024_01_fact_komskole.csv`
* `2024_02_fact_bomiljo.csv`

### Krav til felter i faktatabellene (Standardiserte overskrifter)
1. **`Dato`** (Date, f.eks. `2024-01-01`)
2. **`KOSTRA_Funksjonsgruppe_Kode`** (4-sifret kode, f.eks. `2020` eller `2540`)
3. **`Kontokode_6Siffer`** (6-sifret kode, f.eks. `101000`)
4. **`Ansvar_Kode`** (5-sifret kode, f.eks. `20210` eller `25310`)
5. **`Sektor`** (Text, f.eks. `"Oppvekst og Utdanning"` eller `"Helse og Omsorg"`)
6. **`Budsjett`** (Decimal, måltall)
7. **`Regnskap`** (Decimal, måltall)

> **NB:** Mappen skal **ikke** tømmes! Gamle månedlige filer skal bli liggende slik at historikken bevares ved Power BI-oppdatering.

---

## 4. Dimensjoner & Hierarkier

Alle dimensjonstabeller er flate (denormaliserte) for maksimal ytelse. I Power BI er det bygget eksplisitte hierarkier for drill-down i Matrise-visuals:

### A. Kontoplan-hierarki (`dim_kostra_kontoplan`)
1. **`Kontoklasse_Kode_Navn`** *(f.eks. 1 - Drift)*
2. **`Hovedkategori_Kode_Navn`** *(f.eks. 1 - Lønn og sosiale utgifter)*
3. **`Hovedgruppe_Kode_Navn`** *(f.eks. 10 - Lønnsutgifter)*
4. **`KOSTRA_Art_4Siffer_Navn`** *(f.eks. 1010 - Fastlønn)*
5. **`Konto_Kode_Navn`** *(f.eks. 101000 - Fastlønn - ordinære)*

### B. Funksjon-hierarki (`dim_kostra_funksjon`)
1. **`Hovedfunksjon_Kode_Navn`** *(f.eks. HF2 - Oppvekst, utdanning, helse og omsorg)*
2. **`Tjenesteomrade_Kode_Navn`** *(f.eks. 20 - Oppvekst, utdanning, helse og velferd)*
3. **`Funksjonsgruppe_Kode_Navn`** *(f.eks. 2020 - Grunnskoler (1.-10. trinn))*
4. **`Funksjon_Kode_Navn`** *(f.eks. 202 - Grunnskoleopplæring)*

### C. Ansvars-hierarki (`dim_ansvar`)
1. **`Omrade_Kode_Navn`** *(f.eks. 2 - Oppvekst og utdanning)*
2. **`Ansvar_Kode_Navn`** *(f.eks. 20210 - Grunnskole A (1-10 trinn))*

---

## 5. DAX Måltall & Analysefunksjonalitet

Løsningen leveres med en komplett DAX-pakke organisert i følgende dokumenter i Studio-panelet:
* **`dax_startpakke_kostra_v2.md`**: Kjerne-DAX, MoM, YTD og EOY Forecast.
* **`dax_avansert_og_rls.md`**: RAG-fargekoder, Field Parameters, Calculation Groups og RLS.

### Viktige DAX-konsepter i modellen:
* **Basismåltall:** `Sum Regnskap`, `Sum Budsjett`, `Avvik Kr`, `Forbruk %`.
* **Måned-over-måned (MoM):** `Regnskap PM`, `Regnskap MoM Endring Kr`.
* **Prognose (EOY Forecast):** `[Regnskap YTD] + [Budsjett Resten av Året]` gir estimert årsresultat ved årets slutt.
* **Driveranalyse:** `Pct Bidrag til Totalt Avvik` avdekker hvilke enheter eller kontoer som forårsaker budsjettoverskridelsene.
* **RAG Betinget Formatering:** `RAG Farge Avvik` returnerer dynamiske HEX-fargekoder (`#D13438` rød, `#FFB900` gul, `#107C41` grønn) for bruk i visualer.

---

## 6. Sikkerhet & Tilgangsstyring (RLS)

Modellen støtter **Row-Level Security (RLS)** på ansvars- og områdenivå ved hjelp av tabellen `dim_sikkerhet` (kobles mot `dim_ansvar` via `Ansvar_Kode` eller `Omrade_Kode`).

### DAX-filterregel på `dim_sikkerhet`:
```dax
[Epost] = USERPRINCIPALNAME ()
```
* **Rektor/Enhetsleder:** Ser kun sin egen skole/enhet (`Ansvar_Kode`).
* **Kommunalområdedirektør:** Ser alle enheter i sitt område (`Omrade_Kode`).
* **Kommunedirektør / Økonomiavdeling:** Har full tilgang uten RLS-restriksjoner.

---

## 7. Innhold i Leveranse-pakken (Studio Panel)

Følgende filer er generert og tilgjengelige i Studio-panelet for nedlasting og testing:

1. **`powerbi_kostra_datamodell_v2.zip`**
   * **`dimensjoner/`**: Fullstendige CSV-dimensjoner for 2024 (`dim_date`, `dim_ansvar`, `dim_kostra_kontoplan`, `dim_kostra_funksjon`).
   * **`faktatabeller/`**: 16 månedlige testfiler for 2024 (8 for skole og 8 for helse/bomiljø) klare for *Folder Import*-testing.
2. **`fact_bomiljo_8_perioder.zip`**: Testfiler kun for helse og omsorg.
3. **`fact_komskole_8_perioder.zip`**: Testfiler kun for skole.
4. **`dax_startpakke_kostra_v2.md`**: Dokumentasjon og DAX-koder for kjerne, YTD, MoM og EOY.
5. **`dax_avansert_og_rls.md`**: Dokumentasjon for RAG, Field Parameters, Calculation Groups og RLS.
6. **`README.md`**: Dette dokumentet.

---

## 8. Hurtigstart: Slik kommer du i gang i Power BI

1. **Last ned** `powerbi_kostra_datamodell_v2.zip` fra Studio-panelet.
2. **Pakk ut** zip-filen til en lokal mappe på maskinen din (f.eks. `C:\PowerBI_Test\`).
3. **Åpne Power BI Desktop** og gjør følgende:
   * **Importer dimensjonene:** Velg **Get Data -> Text/CSV** og importer de 4 filene i `dimensjoner/`-mappen.
   * **Markér kalender:** Høyreklikk på `dim_date`, velg **Mark as date table**, og velg kolonnen `Dato`.
   * **Importer faktatabellen via Mappe:** Velg **Get Data -> Folder**, naviger til `faktatabeller/`-mappen, og klikk **Combine & Transform Data**.
   * **Sett opp relasjoner:** Koble 1-til-Mange relasjoner fra dimensjonenes PK-er til fremmednøklene i `fact_regnskap`.
   * **Legg til måltall:** Opprett tabellen `_Måltall` og kopier inn formlene fra `dax_startpakke_kostra_v2.md`.

Nå har du en komplett, skalerbar og produksjonsklar Power BI-modell for KOSTRA! 🚀
