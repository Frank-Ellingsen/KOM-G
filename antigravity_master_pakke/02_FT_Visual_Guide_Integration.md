# 02 - Antigravity: FT-Visual Guide Integrasjonsrapport

Dette dokumentet kartlegger alle de **9 kjernefunksjonelle temaene** fra **Financial Times (FT) Visual Guide** og spesifiserer nøyaktig hvordan hvert visualiseringsmønster implementeres i Power BI på datamodellen i **`pbi-rep-project.pbip`**.

Tabellreferanser følger modellens standard: `fact_data`, `dim_date`, `dim_ansvar`, `dim_kostra_kontoplan` og `dim_kostra_funksjon`.

---

## Tema 1: Deviation (Avviksanalyser)
**Formål:** Vise avvik mellom faktiske regnskapstall og budsjetterte rammer, samt fremheve positivt/negativt avvik.

### Visualetyper & KOSTRA-anvendelse:
1. **Diverging Bar Chart (Avvik per Ansvar / Enhet):**
   * **Y-Akse (Rader):** `dim_ansvar[Enhet_Navn]`
   * **X-Akse (Verdi):** `[Avvik Kr]`
   * **Betinget Formatering (Søylefarge):** `[Avvik Bar Farge]` (Mørkegrønn `#107C41` for mindreforbruk, mørkerød `#D13438` for merforbruk).
2. **Clustered Bar med Avvikslinje (Bar-in-Bar / Bullet Chart):**
   * **Kategori (Y-Akse):** `dim_date[Maned_Navn]` eller `dim_ansvar[Omrade_Navn]`
   * **Hovedstolpe (Bar):** `[Sum Regnskap]`
   * **Mållinje (Target line):** `[Sum Budsjett]`

### Komplett DAX for Deviation:
```dax
Avvik Kr = 
[Sum Budsjett] - [Sum Regnskap]

Avvik % = 
DIVIDE ( [Avvik Kr], [Sum Budsjett], 0 )

Avvik Bar Farge = 
IF ( [Avvik Kr] < 0, "#D13438", "#107C41" )
```

---

## Tema 2: Correlation (Korrelasjonsanalyser)
**Formål:** Undersøke om det er systematisk sammenheng mellom kostnadstyper (f.eks. om høyt overforbruk på vikarer henger sammen med høyt overtidsforbruk).

### Visualetyper & KOSTRA-anvendelse:
1. **Scatter Plot (Overtid vs. Vikarbruk per Enhet):**
   * **X-Akse:** `[Kostnad Overtid Kr]`
   * **Y-Akse:** `[Kostnad Vikarer Kr]`
   * **Detaljer (Bobler):** `dim_ansvar[Enhet_Navn]`
   * **Boblestørrelse:** `[Sum Regnskap]`
   * **Forklaring (Legend):** `dim_ansvar[Omrade_Navn]`
2. **Connected Scatter Plot (Utvikling over tid):**
   * Viser bevegelsen i overtid vs vikarer måned for måned ved å legge `dim_date[Maned_Navn]` i Play Axis / Detail.

### Komplett DAX for Correlation:
```dax
Kostnad Vikarer Kr = 
CALCULATE (
    [Sum Regnskap],
    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { "102000", "102013", "127040" }
)

Kostnad Overtid Kr = 
CALCULATE (
    [Sum Regnskap],
    'dim_kostra_kontoplan'[Kontokode_6Siffer] = "104000"
)
```

---

## Tema 3: Ranking (Rangeringsanalyser)
**Formål:** Rangere enheter, funksjoner eller kontoer fra største til minste kostnadsdriver for å prioritere kutt og oppfølging.

### Visualetyper & KOSTRA-anvendelse:
1. **Ordered Bar Chart / Lollipop Chart:**
   * **Kategori:** `dim_kostra_kontoplan[Konto_Kode_Navn]`
   * **Verdi:** `[Merforbruk Kr]`
   * **Sortering:** Synkende på `[Merforbruk Kr]`, filtrert på Topp 5 / Topp 10.
2. **Slope Graph (Endring i rangering over 2 perioder):**
   * Viser hvilke enheter som har forverret eller forbedret sitt avvik fra starten av perioden (Jan) til siste måned (Aug).

### Komplett DAX for Ranking:
```dax
Merforbruk Kr = 
VAR _Avvik = [Avvik Kr]
RETURN
    IF ( _Avvik < 0, ABS ( _Avvik ), 0 )

Rangering Merforbruk = 
IF (
    [Merforbruk Kr] > 0,
    RANKX (
        ALLSELECTED ( 'dim_kostra_kontoplan'[Konto_Kode_Navn] ),
        [Merforbruk Kr],
        ,
        DESC,
        Dense
    )
)
```

---

## Tema 4: Distribution (Fordelingsanalyser)
**Formål:** Vise fordelingen og spredningen i avvik eller utgifter på tvers av mange enheter (f.eks. alle skoler eller alle omsorgssentre).

### Visualetyper & KOSTRA-anvendelse:
1. **Box Plot / Whisker Plot (Spredning i budsjettavvik per sektor):**
   * **Kategori:** `dim_ansvar[Omrade_Navn]`
   * **Verdi / Påløpt:** `[Avvik Kr]` per `dim_ansvar[Enhet_Navn]`
   * Viser median, kvartiler og uteliggere (f.eks. enkeltskoler med ekstrem vikarbruk).
2. **Histogram (Antall enheter fordelt på avviksintervaller):**
   * X-akse: Intervaller (<-500k, -500k til 0, 0 til +500k, >+500k).
   * Y-akse: Antall unike enheter (`DISTINCTCOUNT(dim_ansvar[Ansvar_Kode])`).

### Komplett DAX for Distribution:
```dax
Antall Enheter med Merforbruk = 
CALCULATE (
    DISTINCTCOUNT ( 'dim_ansvar'[Ansvar_Kode] ),
    FILTER ( 'dim_ansvar', [Avvik Kr] < 0 )
)
```

---

## Tema 5: Change over Time (Tidsutvikling)
**Formål:** Vise tidsmessig utvikling i regnskap, budsjett og trend.

### Visualetyper & KOSTRA-anvendelse:
1. **Stepped Line Chart:** Viser trappetrinnsendringer i regnskap `[Sum Regnskap]` og månedlige budsjetter `[Sum Budsjett]` over `dim_date[Maned_Navn]`.
2. **Area Chart (Akkumulert forbruk):** Viser oppbyggingen av utgiftene måned for måned med `[Regnskap YTD]`.

### Komplett DAX for Change over Time:
```dax
Regnskap YTD = 
TOTALYTD ( [Sum Regnskap], 'dim_date'[Dato] )

Budsjett YTD = 
TOTALYTD ( [Sum Budsjett], 'dim_date'[Dato] )
```

---

## Tema 6: Magnitude (Størrelsessammenligning)
**Formål:** Sammenligne absolutte summer på tvers av sektorer og områder.

### Visualetyper & KOSTRA-anvendelse:
1. **Clustered Column Chart (Sektorforbruk):**
   * **X-Akse:** `dim_ansvar[Omrade_Navn]`
   * **Verdier:** `[Sum Budsjett]` og `[Sum Regnskap]` side om side.
2. **Paired Bar Chart:** Sammenligner lønnsrelaterte utgifter mot driftsutgifter per område.

---

## Tema 7: Part-to-Whole (Del av helhet)
**Formål:** Illustrere hvor stor andel enkeltkonti eller sektorer utgjør av den totale budsjettrammen.

### Visualetyper & KOSTRA-anvendelse:
1. **Treemap (Hierarkisk fordeling av utgifter):**
   * **Gruppe:** `dim_kostra_kontoplan[Hovedgruppe_Navn]` -> `dim_kostra_kontoplan[Kontonavn]`
   * **Verdistørrelse:** `[Sum Regnskap]`
2. **Waterfall Chart (Sammensetning av totalsum):**
   * Viser hvordan Start-budsjett justeres med avvik på Lønn, Vikarer, Drift og Refusjoner for å nå faktisk regnskap.

### Komplett DAX for Part-to-Whole:
```dax
Pct Bidrag til Total Regnskap = 
VAR _TotalRegnskap = 
    CALCULATE (
        [Sum Regnskap],
        ALLSELECTED ( 'dim_ansvar' ),
        ALLSELECTED ( 'dim_kostra_kontoplan' ),
        ALLSELECTED ( 'dim_kostra_funksjon' )
    )
RETURN
    DIVIDE ( [Sum Regnskap], _TotalRegnskap, 0 )
```

---

## Tema 8: Spatial (Geografiske visninger)
**Formål:** Vise geografisk fordeling av kommunale kostnader per sone i Kristiansand kommune.

### Visualetyper & KOSTRA-anvendelse:
1. **Shape Map / Bubble Map:**
   * **Sted / Område:** Kristiansand soner (`dim_ansvar[Enhet_Navn]` – f.eks. *Hjemmetjenesten Sone Nord*, *Sone Sør*, *Vågsbygd*, *Grim*, *Lund*).
   * **Boblestørrelse:** `[Sum Regnskap]`
   * **Fargemetning:** `[Avvik %]` (Mørkerød ved merforbruk, grønn ved mindreforbruk).

---

## Tema 9: Flow (Flyt & Ressursfordeling)
**Formål:** Kartlegge midlenes flyt fra sektor via funksjonsgruppe til sluttkonto.

### Visualetyper & KOSTRA-anvendelse:
1. **Sankey Diagram:**
   * **Kilde (Source):** `dim_ansvar[Omrade_Navn]` (F.eks. *Oppvekst og Utdanning*)
   * **Mellomledd (Step):** `dim_kostra_funksjon[KOSTRA_Funksjonsgruppe_Navn]` (F.eks. *2020 Grunnskole*)
   * **Mål (Destination):** `dim_kostra_kontoplan[Hovedkategori_Navn]` (F.eks. *Lønnsutgifter*)
   * **Vekt (Weight):** `[Sum Regnskap]`
