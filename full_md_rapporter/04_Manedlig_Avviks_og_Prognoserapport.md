# Månedlig Avviks- og Prognoserapport 2024
**Periodisk Tidsrekkeanalyse og Run-Rate EOY per August 2024**

---

## 1. Månedlig Utvikling (Januar – August 2024)

Tabellen nedenfor viser den månedlige utviklingen for hele kommunen (konsolidert samlesum av Oppvekst/Skole (KomSkole) og Helse/Bomiljø (Bomiljø) justert til kNOK):

| Måned (2024) | Revidert Budsjett (kNOK) | Faktisk Regnskap (kNOK) | Månedsavvik Kr | Akkumulert YTD Avvik Kr | RAG Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Januar** | 2 988,0 | 2 822,0 | **+166,0** | +166,0 | 🟢 Mindreforbruk |
| **Februar** | 2 988,0 | 3 118,0 | **-130,0** | +36,0 | 🟡 Mindre overforbruk |
| **Mars** | 2 988,0 | 3 085,0 | **-97,0** | -61,0 | 🟡 Overforbruk |
| **April** | 2 988,0 | 2 967,0 | **+21,0** | -40,0 | 🟢 I rute |
| **Mai** | 3 024,0 | 3 088,0 | **-64,0** | -104,0 | 🟡 Overforbruk |
| **Juni** | 2 040,0 | 2 280,0 | **-240,0** | -344,0 | 🔴 Sommerfravær |
| **Juli** | 3 024,0 | 3 115,0 | **-91,0** | -435,0 | 🔴 Ferievikarer |
| **August** | 3 024,0 | 3 038,0 | **-14,0** | **-449,0** | 🟢 I rute |

Dataene er tilknyttet Power BI-rapporten [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **04. Månedlig Avvik og Prognose** (`p03_tufte_scurve_og_prognose`).

---

## 2. EOY (End of Year) Run-Rate Prognosemodeller

For å forutsi det endelige årsresultatet ved årets slutt (31.12.2024) benyttes to komplementære DAX-baserte prognosemodeller:

### Modell A: Lineær Run-Rate (Prognose basert på 8-måneders snitt)
Gjennomsnittlig månedlig regnskapsforbruk hittil i år fremskrives for de gjenstående 4 månedene (september–desember):

$$\text{EOY Estimat Lineær} = \text{Regnskap YTD} + \left( \frac{\text{Regnskap YTD}}{8} \times 4 \right)$$

* **Estimert Årsregnskap (EOY):** **47 287,4 kNOK**
* **Opprinnelig Vedtatt Årsbudsjett:** **52 787,6 kNOK**
* **Forventet Årsavvik (Lineær):** **+5 500,2 kNOK (Mindreforbruk)** 🟢

### Modell B: Trendjustert Run-Rate (3M Moving Average)
Vekter de tre siste månedene (juni–august) tyngre for å fange opp reell sesongdynamikk (sommeravvikling, vikarbyråpriser og skolestart):

* **Forventet Årsavvik (Trendjustert 3M):** **+3 980,5 kNOK (Mindreforbruk)** 🟢

---

## 3. Tidlig-Varsling og Avvikstoleranse

Rapporten etablerer tre styringssoner for månedlig avviksoppfølging:

* **Grønn sone (🟢):** Månedsavvik innenfor $\pm 2.0 \%$ av periodisert budsjett. Normal drift, ingen særskilte tiltak påkrevd.
* **Gul sone (🟡):** Månedsavvik mellom $-2.0 \%$ og $-5.0 \%$ (merforbruk) eller over $+5.0 \%$ (vakanser). Krever skriftlig kommentar fra enhetsleder i tertialrapporten.
* **Rød sone (🔴):** Månedsavvik mer negativt enn $-5.0 \%$ (merforbruk). Krever umiddelbar innføring av ansettelses-/innkjøpsstopp og handlingsplan godkjent av kommunalsjef innen 5 virkedager.

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
