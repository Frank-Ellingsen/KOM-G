# KOSTRA Database & Excel Arkitekturspesifikasjon 🗄️📊

Dette dokumentet beskriver den anbefalte databasestrukturen (**DuckDB**) og Excel-arkitekturen (**Python in Excel / Power Query**) for **Antigravity KOSTRA AI Workbench**.

---

## 1. Mappe- og Datalagstruktur

For at både **Power BI Desktop**, **DuckDB**, **Python in Excel** og **Streamlit AI-appen** skal arbeide mot de samme tallene uten duplisering, benyttes en felles datastruktur:

```text
Kom - G/
├── powerbi_kostra_datamodell/
│   ├── faktatabeller/                   # Månedlige CSV-faktatabeller per sektor
│   │   ├── 2024_01_fact_komskole.csv ... 2024_08_fact_komskole.csv
│   │   └── 2024_01_fact_bomiljo.csv  ... 2024_08_fact_bomiljo.csv
│   └── dimensjoner/                     # Dimensjonstabeller
│       ├── dim_kostra_kontoplan.csv
│       ├── dim_kostra_funksjon.csv
│       ├── dim_ansvar.csv
│       └── dim_date.csv
├── data/
│   └── database/
│       └── kostra.duckdb                # Analytisk DuckDB OLAP-database (bygget via src/db_manager.py)
├── src/
│   └── db_manager.py                    # Automatisert bygging og Excel-eksport
├── excel/
│   ├── KOSTRA_ML_AdHoc_Analyse.xlsx     # Arbeidsbok med Python in Excel & ML
│   └── templates/
├── pbi-rep-project.pbip                 # Power BI Desktop prosjekt
└── docs/
    ├── POWERBI_TO_EXCEL_INTEGRATION.md
    └── DATABASE_AND_EXCEL_STRUCTURE.md
```

---

## 2. DuckDB Databaseskjema (Schema)

DuckDB fungerer som et ultrahurtig analytisk datavarehus (OLAP) på din lokale maskin. Tabellene bygges opp som et **stjerneskjema (Star Schema)**:

### A. Fakkatabeller (`fact_regnskap`)
Samler alle transaksjoner fra de ulike KOSTRA-sektorene (`fact_komskole`, `fact_bomiljo`, osv.) i én konsolidert tabell:

```sql
CREATE TABLE fact_regnskap AS
SELECT 
    strptime(date, '%m/%d/%Y')::DATE AS Dato,
    YEAR(strptime(date, '%m/%d/%Y')) AS Ar,
    MONTH(strptime(date, '%m/%d/%Y')) AS Maned_Nummer,
    LPAD(Funksjon::VARCHAR, 4, '0') AS Funksjon_Kode,
    LPAD(Kontokode_6Siffer::VARCHAR, 6, '0') AS Konto_6Siffer,
    Budsjett::DOUBLE AS Budsjett_NOK,
    Regnskap::DOUBLE AS Regnskap_NOK,
    (Budsjett - Regnskap)::DOUBLE AS Avvik_NOK
FROM 'data/raw_csv/fact_komskole.csv';
```

### B. Dimensjonstabeller (`dim_kontoplan`, `dim_funksjon`, `dim_ansvar`)

```sql
-- Dimensjon Kontoplan
CREATE TABLE dim_kontoplan AS
SELECT 
    LPAD(Kontokode_6Siffer::VARCHAR, 6, '0') AS Konto_6Siffer,
    Kontonavn,
    Konto_Kode_Navn,
    LPAD(KOSTRA_Art_4Siffer::VARCHAR, 4, '0') AS Art_4Siffer,
    KOSTRA_Art_Navn,
    Hovedgruppe_Navn,
    Hovedkategori_Navn
FROM 'data/raw_csv/dim_kostra_kontoplan.csv';

-- Dimensjon Funksjon
CREATE TABLE dim_funksjon AS
SELECT 
    LPAD(Funksjon::VARCHAR, 4, '0') AS Funksjon_Kode,
    Funksjon_Navn,
    Funksjonsgruppe_Navn,
    Hovedfunksjon_Navn
FROM 'data/raw_csv/dim_kostra_funksjon.csv';
```

---

## 3. Excel-Arkitektur & Python in Excel Workflow

I stedet for tunge VBA-makroer eller manuelle klipp-og-lim operasjoner, opprettes arbeidsboken **`KOSTRA_ML_AdHoc_Analyse.xlsx`** med fire dedikerte faner:

### Fane 1: `01_Data_Connector` (Power Query / DuckDB Integration)
* **Kilde:** Kobler direkte til `data/database/kostra.duckdb` via ODBC eller Python.
* **Innhold:** Oppdaterbare tabeller som henter aggregerte avvik per ansvar, funksjon og konto.

### Fane 2: `02_Python_ML_Prognose` (Python in Excel / `PY()`)
Nyttegjør **Python in Excel** (`=PY(...)`) til å kjøre maskinlæring og sesongjusterte EOY-prognoser med `scikit-learn` og `statsmodels`:

```python
# Eksempel på Python in Excel kode i en celle:
import duckdb
import pandas as pd
from sklearn.linear_model import LinearRegression

# 1. Hent data fra DuckDB
con = duckdb.connect("C:/Users/frank/Desktop/Kom - G/data/database/kostra.duckdb")
df = con.query("""
    SELECT 
        EXTRACT(MONTH FROM Dato)::INT AS Maned_Nummer, 
        SUM(Regnskap) AS Regnskap, 
        SUM(Budsjett) AS Budsjett
    FROM fact_data
    GROUP BY EXTRACT(MONTH FROM Dato)
    ORDER BY Maned_Nummer
""").df()

# 2. ML-Sesongprognose / Regresjon
X = df[['Maned_Nummer']]
y = df['Regnskap']

model = LinearRegression()
model.fit(X, y)

# Prediker resten av året (Måned 9-12)
future_months = pd.DataFrame({'Maned_Nummer': list(range(1, 13))})
future_months['Prognose_Regnskap'] = model.predict(future_months[['Maned_Nummer']])

# Returner resultatet til Excel-arket
future_months
```

### Fane 3: `03_Driver_Analyse` (Korrrelasjons- & Årsaksanalyse)
* Beregner hvilke kontoer som har sterkest korrelasjon med totatavviket.
* Visualiserer hvilke utgiftsposter (overtid, vikarer, konsulenter) som driver overskridelsene.

### Fane 4: `04_Framsikt_Simulering` (What-If Modellering)
* Inneholder interaktive Cellesensorer/Parametere der økonomer kan teste innsparingstiltak (f.eks. *"Redusere vikarbyråkjøp med 15%"*) og se den direkte effekten på årsresultatet.

---

## 4. Fordeler med denne strukturen

1. **Én enkelt kilde til sannhet:** Både Power BI, Excel og Streamlit AI-appen leser fra den samme DuckDB-databasen.
2. **Ingen låsing:** Du kan jobbe i Excel uten at Power BI låser filene.
3. **Ekstrem regnekapasitet:** DuckDB håndterer millioner av rader på få millisekunder i Excel.
