# C# Script for Tabular Editor: Automatisk Generering av KOSTRA DAX-Måltall (Tilpasset pbi-rep-project.pbip)

Dette dokumentet inneholder et skreddersydd **C# (.cs) automatiseringsskript for Tabular Editor 2 og Tabular Editor 3**, 100 % tilpasset og validert mot Power BI-prosjektet **`pbi-rep-project.pbip`**.

Skriptet automatiserer opprettelsen og oppdateringen av hele det profesjonelle DAX-biblioteket for KOSTRA-datamodellen, inkludert:

- Opprettelse av måltallstabellen `_Måltall` med automatisk skjuling av dummy-kolonne (slik at tabellen vises som en ren måltallsbeholder med kalkulator-ikon øverst i feltlisten).
- Strukturering i 8 ryddige undermapper (**Display Folders**).
- Korrekte tabell- og kolonnereferanser mot faktatabellen **`fact_data`** (`fact_data[Regnskap]` og `fact_data[Budsjett]`).
- Konsistente dimensjonsreferanser (`dim_date`, `dim_ansvar`, `dim_kostra_kontoplan`, `dim_kostra_funksjon`).
- Eksakt avvikslogikk: **`Avvik Kr = [Sum Budsjett] - [Sum Regnskap]`** (Positivt = Mindreforbruk, Negativt = Merforbruk / Overskridelse).
- RAG-fargekoder og statusikoner basert på **Edward Tuftes** prinsipper for datavisualisering (dempede farger, rød/gul aksentuering kun ved avvik).
- What-If simuleringsmåltall for kutt i overtid/vikarer og intern omdisponering.
- Spesialmåltall for Financial Times (FT) Visual Guide og Time-Visuals 60 (Bullet Chart soner, Index Base 100, Vikar-/Overtidsspesifisering).

---

## 🚀 Slik kjører du skriptet i Tabular Editor:

1. Åpne **Power BI Desktop** med `pbi-rep-project.pbip`.
2. Gå til menybåndet **External Tools** (Eksterne verktøy) og klikk på **Tabular Editor** (TE2 eller TE3).
3. I Tabular Editor: Velg fanen **Advanced Scripting** (nederst til venstre i TE2, eller via `C# Script`-fanen i TE3).
4. Lim inn C#-koden nedenfor.
5. Klikk på **Play / Run (F5)**.
6. Velg **File -> Save (Ctrl+S)** i Tabular Editor for å lagre endringene direkte tilbake til Power BI Desktop.
7. Gå tilbake til Power BI Desktop – alle 41 måltall er nå opprettet, formatert og klare til bruk!

> [!NOTE]
> **Allerede integrert i TMDL:** Dette måltallsbiblioteket er også generert direkte som native TMDL i [`pbi-rep-project.SemanticModel/definition/tables/_Måltall.tmdl`](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.SemanticModel/definition/tables/_Måltall.tmdl). Når du åpner `pbi-rep-project.pbip`, er måltallene tilgjengelige umiddelbart uten manuell kjøring.

---

## 💻 C# Skript (.cs) for Tabular Editor

```csharp
// ==============================================================================
// TABULAR EDITOR C# AUTOMATION SCRIPT FOR KOSTRA POWER BI PROJECT (pbip)
// Tilpasset fact_data, dim_date, dim_ansvar, dim_kostra_kontoplan, dim_kostra_funksjon
// ==============================================================================

// 1. SIKRE AT MÅLTALLSTABELLEN FINNES
Table measureTable;
if (!Model.Tables.Contains("_Måltall"))
{
    measureTable = Model.AddTable("_Måltall");
    measureTable.Description = "Sentral samlebeholder for alle KOSTRA-måltall i datamodellen.";
}
else
{
    measureTable = Model.Tables["_Måltall"];
}

// Hjelpefunksjon for å legge til eller oppdatere måltall
Action<string, string, string, string, string> AddOrUpdateMeasure = (name, expression, folder, formatString, description) =>
{
    Measure m;
    if (!measureTable.Measures.Contains(name))
    {
        m = measureTable.AddMeasure(name, expression);
    }
    else
    {
        m = measureTable.Measures[name];
        m.Expression = expression;
    }
    m.DisplayFolder = folder;
    if (!string.IsNullOrEmpty(formatString)) m.FormatString = formatString;
    if (!string.IsNullOrEmpty(description)) m.Description = description;
};

// ==============================================================================
// 01. KJERNE & BASISMÅLTALL
// ==============================================================================
AddOrUpdateMeasure(
    "Sum Regnskap",
    "SUM ( 'fact_data'[Regnskap] )",
    "01. Kjerne",
    "#,##0 NOK",
    "Totalt regnskapsført beløp (reelle utgifter/inntekter)."
);

AddOrUpdateMeasure(
    "Sum Budsjett",
    "SUM ( 'fact_data'[Budsjett] )",
    "01. Kjerne",
    "#,##0 NOK",
    "Totalt budsjettert beløp."
);

AddOrUpdateMeasure(
    "Årsbudsjett",
    "CALCULATE (\n    [Sum Budsjett],\n    ALL ( 'dim_date' ),\n    VALUES ( 'dim_date'[Ar] )\n)",
    "01. Kjerne",
    "#,##0 NOK",
    "Fullt årsbudsjett uavhengig av månedlig datofiltrering."
);

AddOrUpdateMeasure(
    "Avvik Kr",
    "[Sum Budsjett] - [Sum Regnskap]",
    "01. Kjerne",
    "#,##0 NOK",
    "Avvik i kroner = Budsjett - Regnskap. Positivt = Mindreforbruk, Negativt = Merforbruk."
);

AddOrUpdateMeasure(
    "Forbruk %",
    "DIVIDE ( [Sum Regnskap], [Sum Budsjett], 0 )",
    "01. Kjerne",
    "0.0 %",
    "Prosentvis regnskapsforbruk i forhold til budsjett."
);

AddOrUpdateMeasure(
    "Avvik %",
    "DIVIDE ( [Avvik Kr], [Sum Budsjett], 0 )",
    "01. Kjerne",
    "0.0 %",
    "Prosentvis avvik i forhold til budsjett."
);


// ==============================================================================
// 02. MÅNED-OVER-MÅNED (MoM) & TREND
// ==============================================================================
AddOrUpdateMeasure(
    "Regnskap PM",
    "CALCULATE (\n    [Sum Regnskap],\n    DATEADD ( 'dim_date'[Dato], -1, MONTH )\n)",
    "02. MoM & Trend",
    "#,##0 NOK",
    "Regnskap for forrige kalendermåned (Previous Month)."
);

AddOrUpdateMeasure(
    "Budsjett PM",
    "CALCULATE (\n    [Sum Budsjett],\n    DATEADD ( 'dim_date'[Dato], -1, MONTH )\n)",
    "02. MoM & Trend",
    "#,##0 NOK",
    "Budsjett for forrige kalendermåned."
);

AddOrUpdateMeasure(
    "Regnskap MoM Endring Kr",
    "IF (\n    NOT ISBLANK ( [Regnskap PM] ),\n    [Sum Regnskap] - [Regnskap PM]\n)",
    "02. MoM & Trend",
    "#,##0 NOK",
    "Endring i regnskap i kroner sammenlignet med forrige måned."
);

AddOrUpdateMeasure(
    "Regnskap MoM Endring %",
    "DIVIDE ( [Regnskap MoM Endring Kr], [Regnskap PM], 0 )",
    "02. MoM & Trend",
    "0.0 %",
    "Endring i regnskap i prosent sammenlignet med forrige måned."
);

AddOrUpdateMeasure(
    "Regnskap 3M Moving Average",
    "AVERAGEX (\n    DATESINPERIOD (\n        'dim_date'[Dato],\n        LASTDATE ( 'dim_date'[Dato] ),\n        -3,\n        MONTH\n    ),\n    [Sum Regnskap]\n)",
    "02. MoM & Trend",
    "#,##0 NOK",
    "3-måneders glidende gjennomsnitt av regnskapet for utjevning av sesongsvingninger."
);

AddOrUpdateMeasure(
    "Regnskap Base 100",
    "VAR _Base =\n    CALCULATE (\n        [Sum Regnskap],\n        'dim_date'[Maned_Nummer] = 1,\n        ALL ( 'dim_date'[Maned_Navn], 'dim_date'[month], 'dim_date'[Maned_Nummer], 'dim_date'[Dato] )\n    )\nRETURN\n    IF ( NOT ISBLANK ( [Sum Regnskap] ) && _Base > 0, DIVIDE ( [Sum Regnskap], _Base, 1 ) * 100 )",
    "02. MoM & Trend",
    "0.0",
    "Indeksert regnskapsutvikling med Jan 2024 som basis (Base 100)."
);


// ==============================================================================
// 03. HITTIL I ÅR (YTD - YEAR-TO-DATE)
// ==============================================================================
AddOrUpdateMeasure(
    "Regnskap YTD",
    "TOTALYTD ( [Sum Regnskap], 'dim_date'[Dato] )",
    "03. YTD",
    "#,##0 NOK",
    "Akkumulert regnskap hittil i år."
);

AddOrUpdateMeasure(
    "Budsjett YTD",
    "TOTALYTD ( [Sum Budsjett], 'dim_date'[Dato] )",
    "03. YTD",
    "#,##0 NOK",
    "Akkumulert budsjett hittil i år."
);

AddOrUpdateMeasure(
    "Avvik YTD Kr",
    "[Budsjett YTD] - [Regnskap YTD]",
    "03. YTD",
    "#,##0 NOK",
    "Akkumulert avvik hittil i år = Budsjett YTD - Regnskap YTD."
);

AddOrUpdateMeasure(
    "Avvik YTD %",
    "DIVIDE ( [Avvik YTD Kr], [Budsjett YTD], 0 )",
    "03. YTD",
    "0.0 %",
    "Prosentvis avvik hittil i år."
);


// ==============================================================================
// 04. PROGNOSE & EOY RUN-RATE
// ==============================================================================
AddOrUpdateMeasure(
    "Budsjett Resten av Året",
    "CALCULATE (\n    [Sum Budsjett],\n    DATESBETWEEN (\n        'dim_date'[Dato],\n        MAX ( 'dim_date'[Dato] ) + 1,\n        ENDOFYEAR ( 'dim_date'[Dato] )\n    )\n)",
    "04. Prognose & EOY",
    "#,##0 NOK",
    "Opprinnelig lagt budsjett for gjenstående måneder i inneværende år."
);

AddOrUpdateMeasure(
    "EOY Estimat Lineær",
    "[Regnskap YTD] + [Budsjett Resten av Året]",
    "04. Prognose & EOY",
    "#,##0 NOK",
    "Estimert totalkostnad EOY basert på påløpt YTD pluss opprinnelig budsjett ut året."
);

AddOrUpdateMeasure(
    "EOY Estimert Avvik Kr",
    "[Årsbudsjett] - [EOY Estimat Lineær]",
    "04. Prognose & EOY",
    "#,##0 NOK",
    "Forventet avvik ved årets slutt = Årsbudsjett - EOY Estimat. Positivt = Mindreforbruk."
);

AddOrUpdateMeasure(
    "EOY Estimert Avvik %",
    "DIVIDE ( [EOY Estimert Avvik Kr], [Årsbudsjett], 0 )",
    "04. Prognose & EOY",
    "0.0 %",
    "Forventet avvik i prosent ved årets slutt."
);

AddOrUpdateMeasure(
    "Bullet Target 80%",
    "[Budsjett YTD] * 0.80",
    "04. Prognose & EOY",
    "#,##0 NOK",
    "Nedre terskelbånd for Bullet Chart (80% av budsjett)."
);

AddOrUpdateMeasure(
    "Bullet Target 110%",
    "[Budsjett YTD] * 1.10",
    "04. Prognose & EOY",
    "#,##0 NOK",
    "Øvre faresone for Bullet Chart (110% av budsjett)."
);


// ==============================================================================
// 05. RAG & FORMATERING (TUFTES PRINSIPPER)
// ==============================================================================
AddOrUpdateMeasure(
    "RAG Farge Avvik",
    "VAR _AvvikPct = [Avvik YTD %]\nRETURN\n    SWITCH (\n        TRUE (),\n        _AvvikPct < -0.05, \"#D13438\", // Muted rød: Merforbruk > 5%\n        _AvvikPct < 0.00,  \"#FFB900\", // Muted amber: Mindre merforbruk (0-5%)\n        _AvvikPct >= 0.05, \"#0078D4\", // Stålblå: Betydelig mindreforbruk (> 5%)\n        \"#107C41\"                    // Skogsgrønn: I rute / Mindreforbruk\n    )",
    "05. RAG & Formatering",
    "String",
    "Returnerer HEX-fargekode for betinget formatering i henhold til Edward Tuftes dempede palett."
);

AddOrUpdateMeasure(
    "RAG Ikon Avvik",
    "VAR _AvvikPct = [Avvik YTD %]\nRETURN\n    SWITCH (\n        TRUE (),\n        _AvvikPct < -0.05, \"🔴\",\n        _AvvikPct < 0.00,  \"🟡\",\n        _AvvikPct >= 0.05, \"🔵\",\n        \"🟢\"\n    )",
    "05. RAG & Formatering",
    "String",
    "Returnerer Unicode-ikon for statusvisning i tabeller og kort."
);

AddOrUpdateMeasure(
    "Status Indikator",
    "VAR _AvvikPct = [Avvik YTD %]\nRETURN\n    SWITCH (\n        TRUE (),\n        _AvvikPct < -0.05, \"🔴 Vesentlig merforbruk (>5%)\",\n        _AvvikPct < 0.00,  \"🟡 Mindre merforbruk (0-5%)\",\n        _AvvikPct >= 0.05, \"🔵 Betydelig mindreforbruk (>5%)\",\n        \"🟢 I rute / Mindreforbruk\"\n    )",
    "05. RAG & Formatering",
    "String",
    "Tekstlig beskrivelse av finansiell status."
);

AddOrUpdateMeasure(
    "Avvik Bar Farge",
    "IF ( [Avvik Kr] < 0, \"#D13438\", \"#107C41\" )",
    "05. RAG & Formatering",
    "String",
    "HEX-farge for avvikssøyler (Diverging bar chart)."
);


// ==============================================================================
// 06. DRIVERANALYSE & RANGERINGS-MÅLTALL
// ==============================================================================
AddOrUpdateMeasure(
    "Merforbruk Kr",
    "VAR _Avvik = [Avvik Kr]\nRETURN\n    IF ( _Avvik < 0, ABS ( _Avvik ), 0 )",
    "06. Driveranalyse",
    "#,##0 NOK",
    "Isolerer kun merforbruksbeløp som en positiv absoluttverdi for driveranalyse."
);

AddOrUpdateMeasure(
    "Mindreforbruk Kr",
    "VAR _Avvik = [Avvik Kr]\nRETURN\n    IF ( _Avvik > 0, _Avvik, 0 )",
    "06. Driveranalyse",
    "#,##0 NOK",
    "Isolerer kun mindreforbruksbeløp for mulige omdisponeringer."
);

AddOrUpdateMeasure(
    "Pct Bidrag til Totalt Merforbruk",
    "VAR _TotaltMerforbruk = \n    CALCULATE (\n        [Merforbruk Kr],\n        ALLSELECTED ( 'dim_ansvar' ),\n        ALLSELECTED ( 'dim_kostra_kontoplan' ),\n        ALLSELECTED ( 'dim_kostra_funksjon' )\n    )\nRETURN\n    DIVIDE ( [Merforbruk Kr], _TotaltMerforbruk, 0 )",
    "06. Driveranalyse",
    "0.0 %",
    "Andel av kommunens totale merforbruk som kan tilskrives denne kontoen/enheten."
);

AddOrUpdateMeasure(
    "Pct Bidrag til Total Regnskap",
    "VAR _TotalRegnskap = \n    CALCULATE (\n        [Sum Regnskap],\n        ALLSELECTED ( 'dim_ansvar' ),\n        ALLSELECTED ( 'dim_kostra_kontoplan' ),\n        ALLSELECTED ( 'dim_kostra_funksjon' )\n    )\nRETURN\n    DIVIDE ( [Sum Regnskap], _TotalRegnskap, 0 )",
    "06. Driveranalyse",
    "0.0 %",
    "Andel av totalregnskapet som denne utgiftsposten utgjør."
);

AddOrUpdateMeasure(
    "Rangering Merforbruk",
    "IF (\n    [Merforbruk Kr] > 0,\n    RANKX (\n        ALLSELECTED ( 'dim_kostra_kontoplan'[Konto_Kode_Navn] ),\n        [Merforbruk Kr],\n        ,\n        DESC,\n        Dense\n    )\n)",
    "06. Driveranalyse",
    "0",
    "Rangering av kontoer etter største merforbruk."
);

AddOrUpdateMeasure(
    "Kostnad Vikarer Kr",
    "CALCULATE (\n    [Sum Regnskap],\n    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { \"102000\", \"102013\", \"127040\" }\n)",
    "06. Driveranalyse",
    "#,##0 NOK",
    "Isolerer samlede utgifter til vikarer ved korttidsfravær og vikarbyrå (konto 102000, 102013, 127040)."
);

AddOrUpdateMeasure(
    "Kostnad Overtid Kr",
    "CALCULATE (\n    [Sum Regnskap],\n    'dim_kostra_kontoplan'[Kontokode_6Siffer] = \"104000\"\n)",
    "06. Driveranalyse",
    "#,##0 NOK",
    "Isolerer overtidsutgifter (konto 104000)."
);


// ==============================================================================
// 07. DYNAMISK TEKST & SLICER SELECTION
// ==============================================================================
AddOrUpdateMeasure(
    "Txt Valgt År",
    "SELECTEDVALUE ( 'dim_date'[Ar], \"Alle År (2024)\" )",
    "07. Dynamisk Tekst",
    "String",
    "Viser hvilket år som er valgt i slicer."
);

AddOrUpdateMeasure(
    "Txt Valgt Måned",
    "IF (\n    ISFILTERED ( 'dim_date'[Maned_Navn] ),\n    CONCATENATEX ( VALUES ( 'dim_date'[Maned_Navn] ), 'dim_date'[Maned_Navn], \", \" ),\n    \"Alle Måneder (Jan - Aug)\"\n)",
    "07. Dynamisk Tekst",
    "String",
    "Viser hvilke måneder som er valgt i slicer."
);

AddOrUpdateMeasure(
    "Txt Valgt Område",
    "IF (\n    ISFILTERED ( 'dim_ansvar'[Omrade_Navn] ),\n    CONCATENATEX ( VALUES ( 'dim_ansvar'[Omrade_Navn] ), 'dim_ansvar'[Omrade_Navn], \", \" ),\n    \"Alle Områder / Konsern\"\n)",
    "07. Dynamisk Tekst",
    "String",
    "Viser hvilket kommunalt område som er valgt."
);

AddOrUpdateMeasure(
    "Txt Valgt Ansvar",
    "IF (\n    ISFILTERED ( 'dim_ansvar'[Enhet_Navn] ),\n    CONCATENATEX ( VALUES ( 'dim_ansvar'[Enhet_Navn] ), 'dim_ansvar'[Enhet_Navn], \", \" ),\n    \"Alle Ansvarsenheter\"\n)",
    "07. Dynamisk Tekst",
    "String",
    "Viser hvilken ansvarsenhet som er valgt."
);

AddOrUpdateMeasure(
    "Txt Master Selection Header",
    "\"KOSTRA Rapport | År: \" & [Txt Valgt År] &\n\" | Periode: \" & [Txt Valgt Måned] &\n\" | Område: \" & [Txt Valgt Område] &\n\" | Enhet: \" & [Txt Valgt Ansvar] &\n\" | Status: \" & [Status Indikator]",
    "07. Dynamisk Tekst",
    "String",
    "Dynamisk titteltekstboks for oppdatering av rapportoverskrifter basert på utsnitt."
);


// ==============================================================================
// 08. WHAT-IF SIMULERING & OMDISPONERING
// ==============================================================================
AddOrUpdateMeasure(
    "Simulert Kutt Hoveddrivere Kr",
    "// 50% reduksjon i vikar og overtid (konto 102013, 102000, 104000)\nCALCULATE (\n    [Merforbruk Kr] * 0.50,\n    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { \"102013\", \"102000\", \"104000\" }\n)",
    "08. What-If Simulering",
    "#,##0 NOK",
    "Beregner innsparing ved 50% kutt på kritiske drivlinjer (vikarer og overtid)."
);

AddOrUpdateMeasure(
    "Simulert Frigjort Mindreforbruk Kr",
    "// Frigjør inntil 20% av mindreforbruk på ordinær lønn til omdisponering\nCALCULATE (\n    [Mindreforbruk Kr] * 0.20,\n    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { \"101000\", \"109000\" }\n)",
    "08. What-If Simulering",
    "#,##0 NOK",
    "Beregner frigjorte midler fra underforbruk på fastlønn for omdisponering."
);

AddOrUpdateMeasure(
    "Simulert EOY Avvik Etter Tiltak Kr",
    "[EOY Estimert Avvik Kr] + [Simulert Kutt Hoveddrivere Kr] + [Simulert Frigjort Mindreforbruk Kr]",
    "08. What-If Simulering",
    "#,##0 NOK",
    "Sluttlig simulert EOY-avvik etter gjennomførte kutt og omdisponeringer."
);

// Skjul dummy-kolonne dersom den finnes for å gjøre _Måltall til en ren måltallstabell
if (measureTable.Columns.Contains("Dummy"))
{
    measureTable.Columns["Dummy"].IsHidden = true;
}
if (measureTable.Columns.Contains("Column1"))
{
    measureTable.Columns["Column1"].IsHidden = true;
}
```
