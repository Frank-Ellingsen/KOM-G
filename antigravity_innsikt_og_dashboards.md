# Antigravity Dashboard- og DAX-Blueprint for KOSTRA Økonomistyring

## Executive Summary & Formål
Dette dokumentet er en uttømmende guide for å bygge et **virksomhetsovergripende beslutningsstøttesystem** i Power BI for kommunal økonomistyring (KOSTRA). 

Ved å kombinere **FT Visual Vocabulary** (Financial Times' klassifisering av visualiseringstyper) og **60 Ways to Visualize Time**, transformeres rå regnskaps- og budsjettdata til dynamisk innsikt for ledere, kommunedirektører og økonomer.

Systemet dekker:
1. **Status & Kontroll:** Sanntids overvåking av forbruk og avvik i henhold til kommunelovens krav.
2. **Prognose (EOY Forecast):** Både lineære og trendjusterte estimater ved årets slutt.
3. **Trend- og Tidsserieanalyse:** Avdekking av sesongmønstre, akselererende kostnader og månedsendringer.
4. **Driver- og Avviksanalyse:** Identifisering av de få kontoene og ansvarsstedene (80/20-prinsippet) som driver overforbruket.
5. **Kutt- og Omdisponeringssimulering (What-If Scenario):** Dynamisk visualisering av hvordan målrettede kutt i hoveddrivere og omdisponering av mindreforbruk på andre konti bringer kommunen i balanse ved årets slutt.

---

## Part 1: Visual Vocabulary & Time-Visuals kartlagt til KOSTRA

Ved å ta utgangspunkt i de vedlagte visualiseringsguidene (**FT Visual Vocabulary** og **60 Ways to Visualize Time**), kartlegger vi hvilke diagramtyper som gir best beslutningsstøtte for de ulike økonomiske problemstillingene:

```
+--------------------------------------------------------------------------------------------------+
|                                    FT VISUAL VOCABULARY & TIME                                   |
+------------------------------+----------------------------------+--------------------------------+
| Visual Kategori              | Diagramtype (Guide Ref.)         | KOSTRA Bruksområde / Innsikt   |
+------------------------------+----------------------------------+--------------------------------+
| 1. Change over Time / Trend  | Stepped Line / Moving Average    | Viser om månedskostnader       |
|                              | (#07, #11, #18 i Time-Visuals)   | stabiliserer seg eller eskalerer|
+------------------------------+----------------------------------+--------------------------------+
| 2. Deviation / Avvik         | Waterfall Chart / Bullet Chart   | Forklarer broen fra Budsjett   |
|                              | (#33, #59 i Time-Visuals)        | til Regnskap per Ansvar/Konto  |
+------------------------------+----------------------------------+--------------------------------+
| 3. Ranking / Drivere         | Ordered Bar / Lollipop Chart     | Rangerer de største rødlyskontoene|
|                              | (#31 i Time-Visuals)             | og avviksdriverne              |
+------------------------------+----------------------------------+--------------------------------+
| 4. Part-to-Whole             | Treemap / Stacked % Bar Chart    | Viser lønn vs. drift andel av  |
|                              | (#28 i Time-Visuals)             | totalkostnaden per funksjon    |
+------------------------------+----------------------------------+--------------------------------+
| 5. Comparison / Baseline     | Slope Graph / Cycle Plot         | Sammenligner månedlige endringer|
|                              | (#38, #40, #41 i Time-Visuals)   | og endring fra periode t1 til t2|
+------------------------------+----------------------------------+--------------------------------+
| 6. What-If & Scenario        | Connected Dot Plot / Area Range  | Visualiserer nåværende prognose|
|                              | (#49, #50 i Time-Visuals)        | vs. tiltakseffekt og ny balanse|
+------------------------------+----------------------------------+--------------------------------+
```

---

## Part 2: Uttømmende DAX-Bibliotek (Kjerne, Trend, EOY & Scenario)

Alle måltall forutsetter at **`Avvik = Budsjett - Regnskap`** (Positivt = Mindreforbruk/Gunstig, Negativt = Overforbruk/Ugunstig).

```dax
// ==========================================
// 1. BASISMÅLTALL (KJERNE)
// ==========================================

[Sum Regnskap] = 
SUM ( 'fact_regnskap'[Regnskap] )

[Sum Budsjett] = 
SUM ( 'fact_regnskap'[Budsjett] )

[Årsbudsjett] = 
CALCULATE (
    [Sum Budsjett],
    ALL ( 'dim_date' ),
    VALUES ( 'dim_date'[Ar] )
)

[Avvik Kr] = 
[Sum Budsjett] - [Sum Regnskap]

[Avvik %] = 
DIVIDE ( [Avvik Kr], [Sum Budsjett], 0 )

[Forbruk %] = 
DIVIDE ( [Sum Regnskap], [Sum Budsjett], 0 )


// ==========================================
// 2. TIME INTELLIGENCE & TRENDER (MoM & YTD)
// ==========================================

[Regnskap YTD] = 
TOTALYTD ( [Sum Regnskap], 'dim_date'[Dato] )

[Budsjett YTD] = 
TOTALYTD ( [Sum Budsjett], 'dim_date'[Dato] )

[Avvik YTD Kr] = 
[Budsjett YTD] - [Regnskap YTD]

[Avvik YTD %] = 
DIVIDE ( [Avvik YTD Kr], [Budsjett YTD], 0 )

[Regnskap PM] = 
CALCULATE (
    [Sum Regnskap],
    DATEADD ( 'dim_date'[Dato], -1, MONTH )
)

[Regnskap MoM Endring Kr] = 
IF (
    NOT ISBLANK ( [Regnskap PM] ),
    [Sum Regnskap] - [Regnskap PM]
)

[Regnskap MoM Endring %] = 
DIVIDE ( [Regnskap MoM Endring Kr], [Regnskap PM], 0 )

[Regnskap 3M Moving Average] = 
DAVERAGEX (
    DATESINPERIOD ( 'dim_date'[Dato], MAX ( 'dim_date'[Dato] ), -3, MONTH ),
    [Sum Regnskap]
)


// ==========================================
// 3. PROGNOSE & EOY (YEAR-END ESTIMATES)
// ==========================================

[Måneder Fullført] = 
MAX ( 'dim_date'[Maned_Nummer] )

[Måneder Gjenstår] = 
12 - [Måneder Fullført]

[Budsjett Resten av Året] = 
CALCULATE (
    [Sum Budsjett],
    DATESBETWEEN (
        'dim_date'[Dato],
        MAX ( 'dim_date'[Dato] ) + 1,
        ENDOFYEAR ( 'dim_date'[Dato] )
    )
)

// Lineær Run-Rate Prognose (Faktisk YTD + Opprinnelig budsjett ut året)
[EOY Estimat Lineær] = 
[Regnskap YTD] + [Budsjett Resten av Året]

// Trendjustert Run-Rate (Faktisk YTD + Siste 3 måneders snitt * gjenstående måneder)
[EOY Estimat Trendjustert] = 
VAR _SnittSiste3M = 
    CALCULATE (
        AVERAGEX (
            VALUES ( 'dim_date'[Ar_Maned] ),
            [Sum Regnskap]
        ),
        DATESINPERIOD ( 'dim_date'[Dato], MAX ( 'dim_date'[Dato] ), -3, MONTH )
    )
RETURN
    [Regnskap YTD] + ( _SnittSiste3M * [Måneder Gjenstår] )

[EOY Estimert Avvik Kr] = 
[Årsbudsjett] - [EOY Estimat Lineær]

[EOY Estimert Avvik %] = 
DIVIDE ( [EOY Estimert Avvik Kr], [Årsbudsjett], 0 )


// ==========================================
// 4. TOP DRIVERS & AVVIKSIDENTIFISERING
// ==========================================

// Identifiserer kun overforbruk på kontonivå
[Overforbruk Kr] = 
IF ( [Avvik YTD Kr] < 0, ABS ( [Avvik YTD Kr] ), 0 )

// Identifiserer mindreforbruk / innsparingspotensial
[Mindreforbruk Kr] = 
IF ( [Avvik YTD Kr] > 0, [Avvik YTD Kr], 0 )

[Pct Bidrag til Totalt Overforbruk] = 
VAR _TotaltOverforbruk = 
    CALCULATE (
        [Overforbruk Kr],
        ALLSELECTED ( 'dim_ansvar' ),
        ALLSELECTED ( 'dim_kostra_kontoplan' ),
        ALLSELECTED ( 'dim_kostra_funksjon' )
    )
RETURN
    DIVIDE ( [Overforbruk Kr], _TotaltOverforbruk, 0 )

[Rangering Overforbruk] = 
IF (
    HASONEVALUE ( 'dim_kostra_kontoplan'[Kontokode_6Siffer] ) || 
    HASONEVALUE ( 'dim_ansvar'[Ansvar_Kode] ),
    RANKX (
        ALLSELECTED (),
        [Overforbruk Kr],
        ,
        DESC,
        Dense
    )
)


// ==========================================
// 5. KUTT- OG OMDISPONERINGSSIMULERING (WHAT-IF)
// ==========================================
// Forutsetter What-If parameters i Power BI:
//  - 'Kutt_Hoveddrivere_Pct'[Kutt_Hoveddrivere_Pct Value] (f.eks. 0.10 for 10% kutt)
//  - 'Omdisponering_Pct'[Omdisponering_Pct Value] (f.eks. 0.50 for 50% omdisponering)

[Simulert Kutt Hoveddrivere Kr] = 
VAR _KuttSats = SELECTEDVALUE ( 'Kutt_Hoveddrivere_Pct'[Kutt_Hoveddrivere_Pct Value], 0 )
VAR _EstimertMånedligOverforbruk = DIVIDE ( [Overforbruk Kr], [Måneder Fullført], 0 )
RETURN
    _EstimertMånedligOverforbruk * [Måneder Gjenstår] * _KuttSats

[Simulert Frigjort Mindreforbruk Kr] = 
VAR _OmdisponeringsSats = SELECTEDVALUE ( 'Omdisponering_Pct'[Omdisponering_Pct Value], 0 )
VAR _EstimertMånedligMindreforbruk = DIVIDE ( [Mindreforbruk Kr], [Måneder Fullført], 0 )
RETURN
    _EstimertMånedligMindreforbruk * [Måneder Gjenstår] * _OmdisponeringsSats

[Simulert Totale Tiltak Kr] = 
[Simulert Kutt Hoveddrivere Kr] + [Simulert Frigjort Mindreforbruk Kr]

[Simulert EOY Avvik Etter Tiltak Kr] = 
[EOY Estimert Avvik Kr] + [Simulert Totale Tiltak Kr]

[Simulert EOY Status Indikator] = 
VAR _NyttAvvik = [Simulert EOY Avvik Etter Tiltak Kr]
RETURN
    SWITCH (
        TRUE (),
        _NyttAvvik >= 0, "🟢 I Balanse / Overskudd (" & FORMAT ( _NyttAvvik, "#,##0 kr" ) & ")",
        _NyttAvvik >= -100000, "🟡 Nær Balanse (" & FORMAT ( _NyttAvvik, "#,##0 kr" ) & ")",
        "🔴 Fortsatt Underskudd (" & FORMAT ( _NyttAvvik, "#,##0 kr" ) & ")"
    )
```

---

## Part 3: Dashboard-Arkitektur & Visualiseringsplan

Slik bygges de fire kjernedashbordene i Power BI for maksimal innsikt og beslutningsstøtte:

```
+--------------------------------------------------------------------------------------------------+
| DASHBOARD 1: EXECUTIVE SUMMARY & OVERORDNET STATUS                                              |
+--------------------------------------------------------------------------------------------------+
| [ KPI Card: EOY Estimat ]   [ KPI Card: EOY Avvik Kr ]   [ KPI Card: RAG Status Indikator ]       |
+--------------------------------------------------------------------------------------------------+
| Visual 1: Waterfall Chart (FT #59 / Time #59)                                                   |
| - Viser broen fra Opprinnelig Årsbudsjett -> Avvik Hittil -> End Of Year Estimat                 |
|                                                                                                  |
| Visual 2: Matrix med Betinget Formatering (RAG)                                                  |
| - Rader: Område_Kode_Navn -> Ansvar_Kode_Navn                                                   |
| - Kolonner: Regnskap YTD, Budsjett YTD, Avvik YTD Kr, Avvik YTD %, EOY Estimat, Status           |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| DASHBOARD 2: TREND- OG TIDSSERIEANALYSE (TIME-VISUALS)                                           |
+--------------------------------------------------------------------------------------------------+
| Visual 1: Continuous Line + Stepped Line Chart (Time #02, #07, #18)                              |
| - X-akse: Start of Month                                                                         |
| - Y-akse: Sum Regnskap, Sum Budsjett, 3M Moving Average                                          |
| - Formål: Viser om kostnadsutviklingen flater ut eller skyter fart.                              |
|                                                                                                  |
| Visual 2: Cycle Plot / Month-over-Month Slope Graph (Time #38, #40)                              |
| - Sammenligner utviklingen i hver enkelt måned på tvers av enheter/skoler/sykehjem.              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| DASHBOARD 3: AVVIKS- OG DRIVERANALYSE (TOP DRIVERS)                                              |
+--------------------------------------------------------------------------------------------------+
| Visual 1: Ordered Bar Chart / Lollipop Chart (FT Ranking / Time #31)                             |
| - Viser Top 10 Kontoer og Top 10 Ansvarssteder med størst overforbruk (Røde stolper).           |
|                                                                                                  |
| Visual 2: Pareto Diagram (Treemap / Cumulative % Line)                                           |
| - Viser at f.eks. 3 kontoer (Overtid 101031, Vikarer 102011, Konsulent 127040) står for 80% av   |
|   det totale overforbruket i kommunen.                                                           |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| DASHBOARD 4: KUTT- OG OMDISPONERINGSSIMULERING (WHAT-IF SCENARIO)                                |
+--------------------------------------------------------------------------------------------------+
| [ Slicer/Skyveknapp: % Kutt Hoveddrivere (0-30%) ]  [ Slicer: % Omdisponering Mindreforbruk ]    |
+--------------------------------------------------------------------------------------------------+
| Visual 1: Connected Dot Plot / Bullet Chart (Time #33, #49)                                      |
| - Viser nåværende EOY Estimat (Grå prikk) vs. Simulert EOY Estimat etter tiltak (Grønn/Rød).     |
|                                                                                                  |
| Visual 2: Waterfall / Bridge Chart for Tiltakseffekt                                            |
| - Start: Opprinnelig EOY Underskudd (-X kr)                                                      |
| - Bar 1: + Kutt på Top 3 Overforbrukskontoer (Lønn/Overtid/Vikar)                               |
| - Bar 2: + Frigjort midler ved omdisponering fra mindreforbrukskontoer (Drift/Utstyr)            |
| - Slutt: Ny Estimert EOY Balanse (0 kr = I Balanse)                                             |
+--------------------------------------------------------------------------------------------------+
```

---

## Part 4: Omdisponering og Balansegang EOY (Scenario Forklart)

En av de største utfordringene i kommunal økonomistyring er at **enkelte konti/enheter sprekker kraftig (f.eks. overtid og vikarer i helse eller skole)**, mens **andre konti har mindreforbruk (f.eks. ubenyttede driftsmidler, vakante stillinger eller utsatte investeringer)**.

Ved å bruke What-If måltallene i Dashboard 4 får ledelsen et **interaktivt simuleringsverktøy**:

1. **Identifisere "Røde Drivere":** DAX-måltallet `[Overforbruk Kr]` trekker ut de spesifikke kontoene og enhetene som overskrider budsjettet.
2. **Simulere Kutt-tiltak:** Ved å justere skyveknappen for `% Kutt Hoveddrivere` (f.eks. 15% reduksjon i vikar- og overtidstimer ut året), beregner `[Simulert Kutt Hoveddrivere Kr]` nøyaktig hvor mange kroner dette sparer inn.
3. **Simulere Omdisponering:** Ved å justere skyveknappen for `% Omdisponering Mindreforbruk` (f.eks. 50% inndragning av mindreforbruk på driftskontoer), beregner `[Simulert Frigjort Mindreforbruk Kr]` hvor mye kapital som kan flyttes for å dekke inn overforbruket.
4. **Balanseeffekt (EOY Rebalancing):** Waterfall-diagrammet viser visuelt hvordan kombinasjonen av kutt på rødlinjer og omdisponering fra grønnlinjer bringer den totale kommunekassen fra **rødt underskudd til EOY i balanse**.

---

## Oppsummering av Leveransen

Alle filer og måltall er nå harmonisert i datamodellen. Du har tilgang til følgende dokumenter i Studio-panelet:
* **`README.md`**: Overordnet systemdokumentasjon.
* **`dax_startpakke_kostra_v3.md`**: Standard DAX-måltall for basistall og YTD.
* **`dax_avansert_og_rls.md`**: RAG-farger, Field Parameters, Calculation Groups og RLS.
* **`antigravity_innsikt_og_dashboards.md`** *(Dette dokumentet)*: FT Visual Vocabulary, Time Visuals, EOY Forecast og What-If Scenario for kutt/omdisponering.
