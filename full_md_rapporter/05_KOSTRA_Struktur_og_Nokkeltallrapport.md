# KOSTRA Struktur- og Nøkkeltallrapport
**Statlig Rapporteringsstruktur og Effektivitetsindikatorer per Måned 08 (August 2024)**

---

## 1. KOSTRA Formål og Struktur

KOSTRA (Kommune-Stat-Rapportering) er det nasjonale informasjonssystemet som gir samordnede, transparente og sammenlignbare styringsdata for norske kommuner og fylkeskommuner. 

I datamodellen til [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) kobles kommunens faktiske regnskaps- og budsjettposter fra `KomSkole` og `Bomiljø` (i `fact_data`) direkte mot:
- **Funksjonskontoplan (`dim_kostra_funksjon`):** 4-sifrede standardiserte KOSTRA-tjenesteområder (f.eks. `2020 Grunnskoleundervisning`, `2140 SFO`, `2210 PPT`, `2540 Pleie og omsorg i institusjon/bolig`).
- **Artskontoplan (`dim_kostra_kontoplan`):** 6-sifrede KOSTRA-standardkonti som skiller mellom faste lønnsarter (`101000`), variable vikarutgifter (`102000`/`102013`), overtid (`104000`), vikarbyråkjøp (`127040`) og statlige refusjoner (`171000`/`171005`).

Rapporten er tilknyttet side **05. KOSTRA Struktur og Nøkkeltall** (`p05_pareto_og_korrelasjon`) i Power BI.

> **Måleenhet:** Alle beløp er oppgitt i **tusen kroner (kNOK)** med én desimal.

---

## 2. Nøkkeltallsanalyse per KOSTRA Tjenesteområde

### Tabell 1: Siste Avsluttede Måned (Måned 08 / August 2024)

| KOSTRA Tjenesteområde | Funksjonskoder | Budsjett Måned 08 (kNOK) | Regnskap Måned 08 (kNOK) | Avvik Kr (kNOK) | Forbruk % | Status |
| :--- | :---: | ---: | ---: | ---: | ---: | :---: |
| **01. Grunnskole** | 2020, 2030, 2040 | 1 702,8 | 1 770,9 | **-68,1** | 104,00 % | 🔴 Merforbruk |
| **02. SFO, Voksenoppl. & Skyss** | 2130, 2140, 2150 | 376,0 | 410,6 | **-34,6** | 109,20 % | 🔴 Merforbruk |
| **03. PPT & Spesialpedagogikk** | 2210, 2220, 2230 | 166,2 | 181,6 | **-15,4** | 109,27 % | 🔴 Merforbruk |
| **04. Pleie & Omsorg (Bomiljø)** | 2540 | 1 525,2 | 1 757,7 | **-232,6** | 115,25 % | 🔴 Merforbruk |
| **KONSOLIDERT MÅNED 08** | **Alle** | **3 770,1** | **4 120,8** | **-350,7** | **109,30 %** | 🔴 Samlet merforbruk |

### Tabell 2: Akkumulert YTD per Måned 08 (Januar–August 2024)

| KOSTRA Tjenesteområde | Funksjonskoder | Budsjett YTD (kNOK) | Regnskap YTD (kNOK) | Avvik Kr YTD (kNOK) | Forbruk % | Status |
| :--- | :---: | ---: | ---: | ---: | ---: | :---: |
| **01. Grunnskole** | 2020, 2030, 2040 | 13 620,0 | 14 167,0 | **-547,0** | 104,02 % | 🔴 Merforbruk |
| **02. SFO, Voksenoppl. & Skyss** | 2130, 2140, 2150 | 3 009,0 | 3 283,0 | **-274,0** | 109,11 % | 🔴 Merforbruk |
| **03. PPT & Spesialpedagogikk** | 2210, 2220, 2230 | 1 329,0 | 1 452,0 | **-123,0** | 109,25 % | 🔴 Merforbruk |
| **04. Pleie & Omsorg (Bomiljø)** | 2540 | 11 337,2 | 12 622,9 | **-1 285,6** | 111,34 % | 🔴 Merforbruk |
| **KONSOLIDERT YTD TOTALT** | **Alle** | **29 295,2** | **31 524,9** | **-2 229,6** | **107,61 %** | 🔴 Samlet merforbruk |

---

## 3. KOSTRA Sammenligningsindikatorer

1. **Lønnsandel av brutto driftsutgifter:**
   * **Skolesektoren:** **87,4 %** av samlede driftskostnader utgjøres av lønn, vikarer og sosiale avgifter (Konto `101000–109999`). Tjenesteproduksjonen er personellintensiv, noe som gjør sektoren sårbar for sykefravær og vikarbehov.
   * **Helse og Omsorg (Bomiljø):** **88,2 %** av driftskostnadene er direkte knyttet til turnuspersonell, nattillegg og ekstern vikarbyråinnleie.
2. **Vikar- og Innleieandel:**
   * **Skolesektoren:** Variable personalkostnader (ordinære vikarer, korttidsvikarer og overtid) utgjorde **163,6 kNOK** i august (6,9 % av månedsregnskapet).
   * **Helse og Omsorg:** Ekstern vikarbyråinnleie (`127040`) utgjorde alene **253,2 kNOK** i august (14,4 % av månedsregnskapet).
3. **Statistisk Korrelasjon Budsjett vs. Regnskap:**
   * Pearson korrelasjonskoeffisient mellom periodisert budsjett og faktisk regnskap er målt til **r = 0,94** på tvers av KOSTRA-kontoene, noe som viser en stabil budsjettfordeling men med systematiske personellekstrabehov i ferie- og oppstartsperioder.

---

## 4. Power BI Implementasjon & DAX-Måltall

I Power BI benyttes side `p05_pareto_og_korrelasjon` til å visualisere 80/20 Pareto-prinsippet og korrelasjonen mellom budsjett og faktisk forbruk:

```dax
// 1. Pareto Kumulativ Prosentandel
ERP Pareto Kumulativ % = 
VAR DetteBelop = [Avvik Kr]
VAR TotalNegAvvik = 
    CALCULATE(
        [Avvik Kr],
        ALLSELECTED(dim_kostra_kontoplan)
    )
VAR Kumulativt = 
    CALCULATE(
        [Avvik Kr],
        FILTER(
            ALLSELECTED(dim_kostra_kontoplan),
            [Avvik Kr] <= DetteBelop
        )
    )
RETURN
    DIVIDE(Kumulativt, TotalNegAvvik, 0)

// 2. Pearson Korrelasjonskoeffisient (Regnskap vs Budsjett)
Corr Regnskap vs Budsjett = 
VAR CountRowsN = COUNTROWS(fact_data)
VAR SumX = [Sum Budsjett]
VAR SumY = [Sum Regnskap]
VAR SumX2 = SUMX(fact_data, fact_data[Belop_Budsjettert] ^ 2)
VAR SumY2 = SUMX(fact_data, fact_data[Belop_Regnskap] ^ 2)
VAR SumXY = SUMX(fact_data, fact_data[Belop_Budsjettert] * fact_data[Belop_Regnskap])
VAR Numerator = (CountRowsN * SumXY) - (SumX * SumY)
VAR Denominator = 
    SQRT(
        ((CountRowsN * SumX2) - (SumX ^ 2)) * 
        ((CountRowsN * SumY2) - (SumY ^ 2))
    )
RETURN
    DIVIDE(Numerator, Denominator, 0)

// 3. Korrelasjonsstyrke i klartekst
Correlation Strength = 
VAR R = ABS([Corr Regnskap vs Budsjett])
RETURN
    SWITCH(
        TRUE(),
        R >= 0.8, "Meget sterk korrelasjon (r >= 0.8)",
        R >= 0.6, "Moderat/god korrelasjon (r >= 0.6)",
        R >= 0.4, "Svak korrelasjon (r >= 0.4)",
        "Ingen signifikant korrelasjon"
    )

// 4. Boblestørrelse i Scatter-plot (Tufte visual)
FT_Corr_Scatter_Size = SQRT(ABS([Avvik Kr]))
```

---
*Rapporten er tilknyttet: [05_KOSTRA_Struktur_og_Nokkeltallrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/05_KOSTRA_Struktur_og_Nokkeltallrapport.md) | Power BI side: `p05_pareto_og_korrelasjon`.*
