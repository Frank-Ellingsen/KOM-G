# 01 - Antigravity: Control Cockpit, Status- og Prognoserapport

Dette dokumentet gir den komplette, presise spesifikasjonen for **Control Cockpit**, **Statusrapport** og **Prognoserapport (EOY Forecast)** i Power BI, 100 % tilpasset datamodellen i **`pbi-rep-project.pbip`**.

Dokumentet dekker:
- Komplett DAX-kode for alle måltall (tilpasset tabellene `fact_data`, `dim_date`, `dim_ansvar`, `dim_kostra_kontoplan` og `dim_kostra_funksjon`).
- Betinget RAG-formatering iht. **Edward Tuftes** prinsipper for datavisualisering (dempede toner, farger kun som aksent ved reelle avvik).
- Dynamiske tekstbokser (Selection Display) for tittel og status.
- Layout- og gridspesifikasjon (16:9, 1920x1080) for de tre kjernesidene i styringsrapporten.

---

## 1. Måltallsarkitektur & Komplett DAX-bibliotek

For optimal ytelse, ryddighet og gjenbrukbarhet er alle måltall samlet i den dedikerte måltallstabellen **`_Måltall`**, strukturert i undermapper.

### A. Basismåltall (Kjerne - Display Folder: `01. Kjerne`)

```dax
// 1. Sum Regnskap
Sum Regnskap = 
SUM ( 'fact_data'[Regnskap] )

// 2. Sum Budsjett
Sum Budsjett = 
SUM ( 'fact_data'[Budsjett] )

// 3. Årsbudsjett (Uavhengig av månedlig filter)
Årsbudsjett = 
CALCULATE (
    [Sum Budsjett],
    ALL ( 'dim_date' ),
    VALUES ( 'dim_date'[Ar] )
)

// 4. Avvik Kr (Positivt = Mindreforbruk, Negativt = Merforbruk / Overskridelse)
Avvik Kr = 
[Sum Budsjett] - [Sum Regnskap]

// 5. Forbruk %
Forbruk % = 
DIVIDE ( [Sum Regnskap], [Sum Budsjett], 0 )

// 6. Avvik %
Avvik % = 
DIVIDE ( [Avvik Kr], [Sum Budsjett], 0 )
```

---

### B. Time Intelligence & Akkumulerte Måltall (Display Folder: `02. MoM & Trend` og `03. YTD`)

```dax
// 7. Regnskap Forrige Måned (PM)
Regnskap PM = 
CALCULATE (
    [Sum Regnskap],
    DATEADD ( 'dim_date'[Dato], -1, MONTH )
)

// 8. Budsjett Forrige Måned (PM)
Budsjett PM = 
CALCULATE (
    [Sum Budsjett],
    DATEADD ( 'dim_date'[Dato], -1, MONTH )
)

// 9. Måned-over-Måned Endring Kr
Regnskap MoM Endring Kr = 
IF (
    NOT ISBLANK ( [Regnskap PM] ),
    [Sum Regnskap] - [Regnskap PM]
)

// 10. Måned-over-Måned Endring %
Regnskap MoM Endring % = 
DIVIDE ( [Regnskap MoM Endring Kr], [Regnskap PM], 0 )

// 11. 3-Måneders Glidende Gjennomsnitt (Sesongutjevning)
Regnskap 3M Moving Average = 
AVERAGEX (
    DATESINPERIOD (
        'dim_date'[Dato],
        LASTDATE ( 'dim_date'[Dato] ),
        -3,
        MONTH
    ),
    [Sum Regnskap]
)

// 12. Regnskap Hittil i År (YTD)
Regnskap YTD = 
TOTALYTD ( [Sum Regnskap], 'dim_date'[Dato] )

// 13. Budsjett Hittil i År (YTD)
Budsjett YTD = 
TOTALYTD ( [Sum Budsjett], 'dim_date'[Dato] )

// 14. Avvik Hittil i År (YTD)
Avvik YTD Kr = 
[Budsjett YTD] - [Regnskap YTD]

// 15. Avvik YTD %
Avvik YTD % = 
DIVIDE ( [Avvik YTD Kr], [Budsjett YTD], 0 )
```

---

### C. Prognose & End-of-Year (EOY) Estimat (Display Folder: `04. Prognose & EOY`)

```dax
// 16. Budsjett Resten av Året (Gjenstående måneder)
Budsjett Resten av Året = 
CALCULATE (
    [Sum Budsjett],
    DATESBETWEEN (
        'dim_date'[Dato],
        MAX ( 'dim_date'[Dato] ) + 1,
        ENDOFYEAR ( 'dim_date'[Dato] )
    )
)

// 17. EOY Lineært Estimat (Påløpt YTD + Opprinnelig gjenstående budsjett)
EOY Estimat Lineær = 
[Regnskap YTD] + [Budsjett Resten av Året]

// 18. EOY Estimert Årsavvik Kr (Årsbudsjett - EOY Estimat)
EOY Estimert Avvik Kr = 
[Årsbudsjett] - [EOY Estimat Lineær]

// 19. EOY Estimert Årsavvik %
EOY Estimert Avvik % = 
DIVIDE ( [EOY Estimert Avvik Kr], [Årsbudsjett], 0 )

// 20. Bullet Target 80% (Nedre buffersone)
Bullet Target 80% = 
[Budsjett YTD] * 0.80

// 21. Bullet Target 110% (Øvre faresone)
Bullet Target 110% = 
[Budsjett YTD] * 1.10
```

---

## 2. Betinget RAG-formatering (Tufte-kompatibel dempet palett)

I henhold til Edward Tuftes prinsipper skal ikke dashboardet oversvømmes av skrikende farger. Bakgrunner holdes nøytrale, tabell-rutenett fjernes, og farger reserveres til å fremheve kritiske avvik:

* **Mørk rød (`#D13438`)**: Merforbruk / Budsjettsprekk > 5 %
* **Dempet ravgul (`#FFB900`)**: Mindre overforbruk (0 til 5 %)
* **Skogsgrønn (`#107C41`)**: I rute / Mindreforbruk (0 til 5 %)
* **Stålblå (`#0078D4`)**: Betydelig mindreforbruk (> 5 %)

```dax
// 22. RAG Fargekode (HEX)
RAG Farge Avvik = 
VAR _AvvikPct = [Avvik YTD %]
RETURN
    SWITCH (
        TRUE (),
        _AvvikPct < -0.05, "#D13438", // Rød: Merforbruk > 5%
        _AvvikPct < 0.00,  "#FFB900", // Gul: Mindre overforbruk (0-5%)
        _AvvikPct >= 0.05, "#0078D4", // Blå: Betydelig underforbruk (> 5%)
        "#107C41"                    // Grønn: I rute / Mindreforbruk
    )

// 23. RAG Ikon Avvik (Unicode)
RAG Ikon Avvik = 
VAR _AvvikPct = [Avvik YTD %]
RETURN
    SWITCH (
        TRUE (),
        _AvvikPct < -0.05, "🔴",
        _AvvikPct < 0.00,  "🟡",
        _AvvikPct >= 0.05, "🔵",
        "🟢"
    )

// 24. Status Indikator Tekst
Status Indikator = 
VAR _AvvikPct = [Avvik YTD %]
RETURN
    SWITCH (
        TRUE (),
        _AvvikPct < -0.05, "🔴 Vesentlig merforbruk (>5%)",
        _AvvikPct < 0.00,  "🟡 Mindre merforbruk (0-5%)",
        _AvvikPct >= 0.05, "🔵 Betydelig mindreforbruk (>5%)",
        "🟢 I rute / Mindreforbruk"
    )

// 25. Avvik Bar Farge (for Diverging Bars)
Avvik Bar Farge = 
IF ( [Avvik Kr] < 0, "#D13438", "#107C41" )
```

---

## 3. Dynamiske Tekstbokser (Selection Display via DAX)

Brukere og ledelse ser til enhver tid hvilke filtre og utsnitt som er aktive direkte i overskriften:

```dax
// 26. Valgt År
Txt Valgt År = 
SELECTEDVALUE ( 'dim_date'[Ar], "Alle År (2024)" )

// 27. Valgt Måned
Txt Valgt Måned = 
IF (
    ISFILTERED ( 'dim_date'[Maned_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_date'[Maned_Navn] ), 'dim_date'[Maned_Navn], ", " ),
    "Alle Måneder (Jan - Aug)"
)

// 28. Valgt Område
Txt Valgt Område = 
IF (
    ISFILTERED ( 'dim_ansvar'[Omrade_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_ansvar'[Omrade_Navn] ), 'dim_ansvar'[Omrade_Navn], ", " ),
    "Alle Områder / Konsern"
)

// 29. Valgt Ansvar
Txt Valgt Ansvar = 
IF (
    ISFILTERED ( 'dim_ansvar'[Enhet_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_ansvar'[Enhet_Navn] ), 'dim_ansvar'[Enhet_Navn], ", " ),
    "Alle Ansvarsenheter"
)

// 30. Master Selection Header
Txt Master Selection Header = 
"KOSTRA Rapport | År: " & [Txt Valgt År] &
" | Periode: " & [Txt Valgt Måned] &
" | Område: " & [Txt Valgt Område] &
" | Enhet: " & [Txt Valgt Ansvar] &
" | Status: " & [Status Indikator]
```

---

## 4. Best Practice Dashboard Layout & Rapportspesifikasjoner

Layouten er optimalisert for 16:9 format (1920 x 1080 piksler).

### A. Control Cockpit (Styringsdashbord for Ledelsen)
* **Topplinje (Header Area - Høyde 110 px):**
  * Tittel: **KOSTRA Control Cockpit** (Segoe UI Semibold, 24 pt)
  * Dynamisk infoboks: `[Txt Master Selection Header]` (11 pt regular, nøytral grå `#EDEBE9`)
  * Global Slicer Bar: År (`dim_date[Ar]`), Måned (`dim_date[Maned_Navn]`), Område (`dim_ansvar[Omrade_Navn]`), Ansvar (`dim_ansvar[Enhet_Navn]`).
* **KPI-rekke (4 Card Visuals - Høyde 140 px):**
  1. **Regnskap YTD:** `[Regnskap YTD]` (32 pt bold), sekundærtekst `[Regnskap MoM Endring %]` vs forrige måned.
  2. **Budsjett YTD:** `[Budsjett YTD]` (32 pt bold), godkjent ramme.
  3. **Avvik YTD:** `[Avvik YTD Kr]` (32 pt bold), betinget fontfarge med `[RAG Farge Avvik]`.
  4. **Forbruk & Status:** `[Forbruk %]` med undertittel `[Status Indikator]` og ikon `[RAG Ikon Avvik]`.
* **Hovedområde (Grid layout 2x2 - Høyde 740 px):**
  * **Oppe Venstre (Avviksflyt):** Waterfall Chart:
    * Kategori: Start = `[Budsjett YTD]`, Trinn = Avvik per KOSTRA-hovedkategori (`dim_kostra_kontoplan[Hovedkategori_Navn]`), Slutt = `[Regnskap YTD]`.
  * **Oppe Høyre (Måloppnåelse):** Bullet Chart / Bar-in-Bar:
    * X-akse: `dim_date[Maned_Navn]`.
    * Faktisk verdi: `[Sum Regnskap]`.
    * Mållinje: `[Sum Budsjett]`.
    * Bakgrunnsbånd: `[Bullet Target 80%]` og `[Bullet Target 110%]`.
  * **Nede Venstre (Drivere Enheter):** Lollipop / Diverging Bar Chart:
    * Kategori: `dim_ansvar[Enhet_Navn]` (Topp 5).
    * Verdi: `[Merforbruk Kr]`.
    * Sortering: Synkende.
  * **Nede Høyre (Drivere Kontoer):** Lollipop / Horizontal Bar Chart:
    * Kategori: `dim_kostra_kontoplan[Konto_Kode_Navn]` (Topp 5).
    * Verdi: `[Merforbruk Kr]`.
    * Sortering: Synkende.

### B. Statusrapport (Månedlig Regnskapsoppfølging)
* **Fokus:** Sammenligning av månedlige avvik og historisk utvikling.
* **Visuelle elementer:**
  * **Månedlig Avviksmatrise:** `dim_ansvar[Ansvar_Navn]` på rader, `dim_date[Maned_Navn]` på kolonner. Verdier: `[Sum Regnskap]`, `[Sum Budsjett]`, `[Avvik Kr]`. Betinget bakgrunnsfarge på `[Avvik Kr]` styrt av `[RAG Farge Avvik]`. Fjerning av vertikale tabellinjer (Tufte).
  * **Trendlinje:** Stepped line chart som sammenligner månedlige faktiske utgifter `[Sum Regnskap]` mot månedlig budsjettramme `[Sum Budsjett]` over `dim_date[Maned_Navn]`.

### C. Prognoserapport (EOY Forecast & Hva-hvis Scenarier)
* **Fokus:** Hvor ender kommunen ved årets slutt, og hvilke kutt/omdisponeringer balanserer regnskapet?
* **Visuelle elementer:**
  * **Run-rate modellering:** Linjediagram med `dim_date[Maned_Navn]` som viser faktisk regnskap Jan–Aug, og framskrivning Sep–Des med `[EOY Estimat Lineær]` vs `[Regnskap 3M Moving Average]`.
  * **Sektoravvik Prognose:** Bar chart over `dim_ansvar[Omrade_Navn]` med `[EOY Estimert Avvik Kr]`.
  * **What-If Kuttpanel:** Kort og stolper som viser effekten av `[Simulert Kutt Hoveddrivere Kr]`, `[Simulert Frigjort Mindreforbruk Kr]` og netto simulert resultat `[Simulert EOY Avvik Etter Tiltak Kr]`.
