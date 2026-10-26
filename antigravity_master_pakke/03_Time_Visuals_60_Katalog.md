# 03 - Antigravity: Time-Visuals 60 Katalog & DAX-Implementering

Dette dokumentet gir den mest omfattende katalogen over **alle 60 tidsserie-visualiseringseksempler** fra **Time-Visuals.pdf** tilpasset KOSTRA-datamodellen i **`pbi-rep-project.pbip`**.

Alle tabell- og måltallsreferanser er synkronisert med `fact_data`, `dim_date`, `dim_ansvar`, `dim_kostra_kontoplan` og måltallstabellen `_Måltall`.

---

## Oversikt over Time-Visuals Kategoriene (1 til 60)

| ID | Visual Variant | Beskrivelse | KOSTRA Anvendelse i Power BI |
|---|---|---|---|
| **01** | Line Chart - Standard | Enkel sammenhengende linje | Månedlig regnskapsutvikling (`[Sum Regnskap]` over `dim_date[Maned_Navn]`) |
| **02** | Line Chart - Stepped | Trappetrinnsformet linje | Månedlige budsjetthopp og vedtatte rammeendringer (`[Sum Budsjett]`) |
| **03** | Line Chart - Dashed / Dotted | Stiplede / punktede linjer | Sammenligning av framskrevet prognose (`[EOY Estimat Lineær]`) vs faktisk |
| **04** | Line Chart - Curved / Spline | Myke kurver | Sesongutjevnet forbrukstrend |
| **05** | Line Chart - Thick Focus | Fremhevet tykk linje | Inneværende år farget mørkeblå (`#0078D4`) mot historiske tynne grå linjer |
| **06** | Line Chart - Highlighted Point | Fremhevede målepunkter | Markere topp-måneder for vikarkjøp (`[Kostnad Vikarer Kr]`) |
| **07** | Line Chart - Continuous vs Budget | To linjer med fylt avvik | Faktisk regnskap vs månedlig budsjettramme |
| **08** | Line Chart - Multi-Series | Flere linjer i samme diagram | Sammenligne 5 skoler eller omsorgssentre over tid |
| **09** | Line Chart - Small Multiples | Panel med minidiagrammer | Eget lite linjediagram per kommunalt område (`dim_ansvar[Omrade_Navn]`) |
| **10** | Line Chart - Sparklines | Ultra-kompakte linjer | Sparklines inne i KOSTRA-matriser for regnskapsutvikling over 8 måneder |
| **11** | Moving Average (3M / 6M) | Glidende gjennomsnitt | `[Regnskap 3M Moving Average]` for å fjerne månedlig støy |
| **12** | Cumulative Line (YTD) | Akkumulert stigning | `[Regnskap YTD]` akkumulert fra Jan til Des |
| **13** | Dual Axis Line | Dobbel Y-akse | Totalutgift (kr) på primærakse vs Overtidsandel (`[Kostnad Overtid Kr]`) på sekundærakse |
| **14** | Area Chart - Standard | Fylt areal under linjen | Totale kommunale driftsutgifter over tid |
| **15** | Area Chart - Stacked | Stablet areal | Månedlig sammensetning av lønn, vikarer og driftsutgifter |
| **16** | Area Chart - 100% Stacked | Relativ prosentvis fordeling | Prosentvis utvikling i lønnsandel vs driftsandel per måned |
| **17** | Area Chart - Overlapping | Halvgjennomsiktig areal | Sammenligning av Budsjett vs Regnskap med semi-transparent overlegg |
| **18** | Area Chart - Banded / Range | Usikkerhetsbånd | Min/Maks varians i månedlig forbruk |
| **19** | Area Chart - Streamgraph | Bølgende sentrert areal | Visualisere dynamisk ressursforskyvning mellom sektorer |
| **20** | Column Chart - Standard | Vertikale stolper | Månedlig regnskapsoppfølging (Jan-Aug) |
| **21** | Column Chart - Clustered | Grupperte stolper | Regnskap vs Budsjett side-om-side per måned |
| **22** | Column Chart - Stacked | Stablede stolper | Månedlige utgifter fordelt på KOSTRA-hovedkategorier |
| **23** | Column Chart - 100% Stacked | Prosentvis stablet | Månedlig andel faste lønninger vs variable vikarer/overtid |
| **24** | Column Chart - Waterfall | Endringsstolper | Månedlig nettoendring i avvik (`[Avvik Kr]`) |
| **25** | Column Chart - Diverging | Stolper over/under nullinjen | Positivt/negativt månedlig budsjettavvik med `[Avvik Bar Farge]` |
| **26** | Column Chart - Variable Width | Varierende stolpebredde | Dager i måneden kombinert med månedskostnad |
| **27** | Column Chart - Highlighted Max/Min | Fremhevet topp/bunn | Automatisk rød farge på måneden med høyest overforbruk |
| **28** | Column Chart - Broken Axis | Avbrutt akse | Håndtere store engangsposter eller ekstraordinære refusjoner |
| **29** | Column Chart - Span / Floating | Flytende stolper (Min-Maks) | Høyeste og laveste månedlige kostnad per ansvarsenhet |
| **30** | Column Chart - Lollipop | Tynne streker med kuler | Plasseffektiv visualisering av månedlig avvik |
| **31** | Bar Chart - Ordered Horizontal | Sorterte horisontale stolper | Rangering av enheter etter avvik i valgt måned |
| **32** | Bar-in-Bar Chart | Smal stolpe inni tykk stolpe | Regnskapsstolpe oppå en bredere grå budsjettstolpe |
| **33** | Bullet Chart | Stolpe med mållinje og soner | `[Regnskap YTD]` mot `[Budsjett YTD]` med 80% og 110% bakgrunnssoner |
| **34** | Heatmap - Calendar Grid | Kalenderrutenett | Viser vikarforbruk eller overtid per dag/uke |
| **35** | Heatmap - Matrix Grid | Matrise fargekodet etter verdi | Måneder (kolonner) vs Enheter (rader) farget etter `[RAG Farge Avvik]` |
| **36** | Horizon Chart | Komprimert tidslinje med lag | Overvåke 40 enheter samtidig på minimal plass |
| **37** | Index Chart (Base = 100) | Indeksert utvikling | Kostnadsvekst indeksert mot Jan 2024 (`[Regnskap Base 100]`) |
| **38** | Cycle Plot / Seasonal Chart | Månedsmønster over flere år | Sammenligne sesongeffekter måned for måned |
| **39** | Seasonal Subseries | Delserier per sesong | Avdekke sommerferie- og skolestartseffekter |
| **40** | Slope Graph | Tobegrenset linje (t1 til t2) | Endring i budsjettavvik fra Jan 2024 til Aug 2024 |
| **41** | Dumbbell / Connected Dot Plot | Prikker koblet med linje | Endring i budsjett vs regnskap per enhet |
| **42** | Polar / Radar Time Chart | Sirkulær tidslinje | Sesongmessige svingninger gjennom årets 12 måneder |
| **43** | Spiral Chart | Spiralformet tidslinje | Flerårige sykliske trender i vikarforbruk |
| **44** | Time Bubble Chart | Bobler langs tidslinje | Månedlige hendelser hvor boblestørrelse = `[Merforbruk Kr]` |
| **45** | Timeline / Milestone Chart | Tidslinje med milepæler | Politisk budsjettvedtak, tertialrapporter og omdisponeringer |
| **46** | Gantt Chart | Varighetslinjer | Prosjektvarighet og fremdrift for kommunale investeringer |
| **47** | Candlestick / OHLC | Åpning, Høy, Lav, Slutt | Variabilitet i ukentlig vikarbruk per måned |
| **48** | Step-Ribbon Chart | Båndkoblet tidslinje | Endring i sektorenes andel av totalforbruket |
| **49** | Before-After Slope | Før-Og-Etter sammenligning | Avvik før og etter gjennomførte kutt-tiltak (`[Simulert EOY Avvik Etter Tiltak Kr]`) |
| **50** | Target vs Actual Gauge | Måler med tidsforløp | % tidsforløp i året (66.7 % per aug) vs `[Forbruk %]` |
| **51** | Threshold Line Chart | Grenseverdilinje | Månedlig regnskap mot kritisk rammetak |
| **52** | Forecast / Confidence Band | Framskrivning med bånd | EOY-prognose med statistisk konfidensintervall |
| **53** | Multi-Scale Time Chart | Flere tidslinje-skalaer | Både månedsnivå og YTD-akkumulert i samme visning |
| **54** | Sparkline Matrix Table | Tabell med integrerte minidiagrammer | KOSTRA-tabell med sparklines per enhet |
| **55** | Time-Series Scatter | Punktgraf over tid | Sjekke uteliggere i månedlige posteringer |
| **56** | Anomaly Detection Chart | AI-basert avviksdeteksjon | Innebygd Power BI AI-deteksjon av unormale månedlige avvik |
| **57** | Cumulative Waterfall | Akkumulert trappegraf | Bygge opp YTD-regnskap fra Jan til Aug |
| **58** | Variance Bridge Chart | Avviksbro over tid | Forklare hvorfor årsresultatet avviker fra opprinnelig budsjett |
| **59** | Flow Waterfall (Sankey-Time) | Tidsrettet endringsflyt | Flyt av midler og overføringer mellom måneder og poster |
| **60** | Executive Scorecard View | Kombinert toppledervisning | Kritiske KPI-er, tidslinje, prognose og RAG-status samlet |

---

## DAX-Måltall for Sentrale Time-Visuals Eksempler

### 1. Bullet Chart (#33)
```dax
// Faktisk verdi (Bar)
Regnskap YTD = 
TOTALYTD ( [Sum Regnskap], 'dim_date'[Dato] )

// Målverdi (Target Line)
Budsjett YTD = 
TOTALYTD ( [Sum Budsjett], 'dim_date'[Dato] )

// Nedre buffersone (80% av budsjett)
Bullet Target 80% = 
[Budsjett YTD] * 0.80

// Øvre faresone (110% av budsjett)
Bullet Target 110% = 
[Budsjett YTD] * 1.10
```

### 2. Index Chart - Base 100 (#37)
```dax
Regnskap Base 100 = 
VAR _Base =
    CALCULATE (
        [Sum Regnskap],
        'dim_date'[Maned_Nummer] = 1,
        ALL ( 'dim_date'[Maned_Navn], 'dim_date'[month], 'dim_date'[Maned_Nummer], 'dim_date'[Dato] )
    )
RETURN
    IF ( 
        NOT ISBLANK ( [Sum Regnskap] ) && _Base > 0, 
        DIVIDE ( [Sum Regnskap], _Base, 1 ) * 100 
    )
```

### 3. Slope Graph (#40 & #49)
```dax
// Avvik i første periode (Januar)
Avvik Periode Start = 
CALCULATE (
    [Avvik Kr],
    FIRSTDATE ( 'dim_date'[Dato] )
)

// Avvik i siste aktive periode (August)
Avvik Periode Slutt = 
CALCULATE (
    [Avvik Kr],
    LASTDATE ( 'dim_date'[Dato] )
)
```

### 4. Sparkline Matrix Generator (#10 & #54)
I Power BI:
1. Opprett en **Matrix**-visualisering.
2. Legg `dim_ansvar[Enhet_Navn]` på rader.
3. Legg `[Sum Regnskap]` og `[Avvik YTD Kr]` i verdier.
4. Høyreklikk på feltet `[Sum Regnskap]` i visualpanelet og velg **Add a sparkline**.
5. Sett **Y-akse:** `[Sum Regnskap]` og **X-akse:** `dim_date[Maned_Nummer]`.
