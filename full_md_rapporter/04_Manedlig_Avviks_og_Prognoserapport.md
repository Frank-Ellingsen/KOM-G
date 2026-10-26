# Månedlig Avviks- og Prognoserapport 2024
**Periodisk Tidsrekkeanalyse og Run-Rate EOY per Måned 08 (August 2024)**

---

## 1. Månedlig Utvikling (Januar – August 2024)

Tabellen nedenfor viser den faktiske månedlige utviklingen for hele kommunen basert på datamodellens faktatabell (`fact_data` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)), konsolidert for Oppvekst/Skole (`KomSkole`) og Helse/Bomiljø (`Bomiljø`):

> **Måleenhet:** Alle tall er oppgitt i **tusen kroner (kNOK)** med én desimal.  
> *Avvik formel: $\text{Avvik} = \text{Budsjett} - \text{Regnskap}$. Negativt tall = Merforbruk (rød), Positivt tall = Mindreforbruk (grønn).*

### Tabell 1: Konsolidert Månedsutvikling (kNOK)

| Måned (2024) | Revidert Budsjett (kNOK) | Faktisk Regnskap (kNOK) | Månedsavvik Kr (kNOK) | Akkumulert YTD Avvik (kNOK) | Forbruk % | RAG Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :---: |
| **01. Januar** | 3 648,1 | 3 377,5 | **+270,6** | +270,6 | 92,58 % | 🟢 Mindreforbruk |
| **02. Februar** | 3 655,6 | 4 444,8 | **-789,2** | -518,6 | 121,59 % | 🔴 Merforbruk |
| **03. Mars** | 3 587,1 | 3 903,9 | **-316,9** | -835,4 | 108,83 % | 🔴 Merforbruk |
| **04. April** | 4 602,1 | 4 619,4 | **-17,3** | -852,8 | 100,38 % | 🟢 I rute |
| **05. Mai** | 3 788,9 | 3 976,1 | **-187,2** | -1 040,0 | 104,94 % | 🟡 Merforbruk |
| **06. Juni** | 2 486,4 | 2 882,0 | **-395,6** | -1 435,7 | 115,91 % | 🔴 Merforbruk |
| **07. Juli** | 3 756,9 | 4 200,2 | **-443,3** | -1 879,0 | 111,80 % | 🔴 Ferieavvikling |
| **08. August** | 3 770,1 | 4 120,8 | **-350,7** | **-2 229,6** | 109,30 % | 🔴 Merforbruk |

Dataene er tilknyttet Power BI-rapporten [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **04. Månedlig Avvik og Prognose** (`p03_tufte_scurve_og_prognose`).

---

## 2. EOY (End of Year) Run-Rate Prognosemodeller

For å forutsi det endelige årsresultatet ved årets slutt (31.12.2024) benyttes to komplementære DAX-baserte prognosemodeller:

### Modell A: Lineær Run-Rate (Prognose basert på 8-måneders snitt)
Gjennomsnittlig månedlig regnskapsforbruk hittil i år fremskrives for de gjenstående 4 månedene (september–desember):

$$\text{EOY Estimat Lineær} = \text{Regnskap YTD} + \left( \frac{\text{Regnskap YTD}}{8} \times 4 \right)$$

* **Akkumulert Regnskap YTD (01–08):** **31 524,9 kNOK**
* **Estimert Årsregnskap (EOY Lineær):** **47 287,4 kNOK**
* **Periodisert Årsbudsjett (12 mnd):** **43 942,9 kNOK**
* **Forventet Årsavvik (Lineær):** **-3 344,4 kNOK (Merforbruk)** 🔴

### Modell B: Trendjustert Run-Rate (3M Moving Average)
Vekter de tre siste månedene (juni, juli og august) tyngre for å fange opp reell sesongdynamikk (ferieavvikling, vikarbyråpriser og skolestart):
* **Gjennomsnittlig forbruk siste 3 måneder:** **3 734,3 kNOK/mnd**
* **Estimert Årsregnskap (3M MA):** **46 462,1 kNOK**
* **Forventet Årsavvik (Trendjustert 3M):** **-3 815,7 kNOK (Merforbruk)** 🔴

---

## 3. Tidlig-Varsling og Avvikstoleranse

Rapporten etablerer tre styringssoner for månedlig avviksoppfølging:

* **Grønn sone (🟢):** Månedsavvik innenfor $\pm 2,0 \%$ av periodisert budsjett. Normal drift, ingen særskilte tiltak påkrevd.
* **Gul sone (🟡):** Månedsavvik mellom $-2,0 \%$ og $-5,0 \%$ (merforbruk). Krever skriftlig avvikskommentar fra enhetsleder.
* **Rød sone (🔴):** Månedsavvik overstiger $-5,0 \%$ (merforbruk). Krever umiddelbar innføring av innleie- og ansettelseskontroll samt tiltaksplan for reståret.

I august (Måned 08) var avviket **-9,30 % (🔴 Merforbruk)** konsolidert, med -15,25 % i helse og -5,26 % i oppvekst.

---

## 4. Power BI Implementasjon & DAX-Måltall

Side `p03_tufte_scurve_og_prognose` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) benytter Edward Tuftes prinsipper for tidsserievisualisering (høy datablekk-faktor, ingen vertikale rutenett, direkte merking på S-kurvene):

```dax
// 1. Akkumulert Regnskap S-Curve
FT_Time_Cumulative_Actual = 
VAR MaxActualMonth = 
    CALCULATE(
        MAX(dim_date[month]),
        FILTER(ALL(dim_date), NOT(ISBLANK([Sum Regnskap])) && [Sum Regnskap] <> 0)
    )
VAR CurrentMonth = SELECTEDVALUE(dim_date[month])
RETURN
    IF(
        CurrentMonth <= MaxActualMonth,
        CALCULATE(
            [Sum Regnskap],
            FILTER(ALL(dim_date), dim_date[month] <= CurrentMonth)
        ),
        BLANK()
    )

// 2. Akkumulert Budsjett S-Curve
FT_Time_Cumulative_Budget = 
VAR CurrentMonth = SELECTEDVALUE(dim_date[month])
RETURN
    CALCULATE(
        [Sum Budsjett],
        FILTER(ALL(dim_date), dim_date[month] <= CurrentMonth)
    )

// 3. 3-Måneders Glidende Gjennomsnitt (3M Moving Average)
Regnskap 3M Moving Average = 
VAR CurrentMonth = SELECTEDVALUE(dim_date[month])
RETURN
    IF(
        ISBLANK([Sum Regnskap]),
        BLANK(),
        CALCULATE(
            AVERAGEX(
                VALUES(dim_date[month]),
                [Sum Regnskap]
            ),
            FILTER(
                ALL(dim_date),
                dim_date[month] >= CurrentMonth - 2 &&
                dim_date[month] <= CurrentMonth
            )
        )
    )

// 4. EOY Estimert Årsregnskap (Lineær fremskrivning)
EOY Estimat Lineær = 
VAR YtdRegnskap = [Sum Regnskap]
VAR MonthsPassed = 
    CALCULATE(
        DISTINCTCOUNT(dim_date[month]),
        FILTER(ALL(dim_date), NOT(ISBLANK([Sum Regnskap])) && [Sum Regnskap] <> 0)
    )
VAR MonthlyRunRate = DIVIDE(YtdRegnskap, MonthsPassed, 0)
VAR RemainingMonths = 12 - MonthsPassed
RETURN
    YtdRegnskap + (MonthlyRunRate * RemainingMonths)

// 5. Forventet Årsavvik EOY
EOY Estimert Avvik Kr = [Årsbudsjett] - [EOY Estimat Lineær]

// 6. Automatisk Prognosekommentar
Story Forecast Narrative = 
VAR AvvEOY = [EOY Estimert Avvik Kr]
VAR EOYEst = [EOY Estimat Lineær]
RETURN
    "Basert på 8 måneders run-rate estimeres årsregnskapet til " & 
    FORMAT(EOYEst, "#,##0 kr") & ", som gir et forventet årsavvik på " & 
    FORMAT(AvvEOY, "+#,##0 kr;-#,##0 kr;0 kr") & " mot vedtatt årsbudsjett."
```

---
*Rapporten er tilknyttet: [04_Manedlig_Avviks_og_Prognoserapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/04_Manedlig_Avviks_og_Prognoserapport.md) | Power BI side: `p03_tufte_scurve_og_prognose`.*
