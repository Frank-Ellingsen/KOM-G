# Kobling av Power BI Desktop-Innsikt med Excel 🔄📊

Når du kun har **Power BI Desktop** (og ikke Power BI Service med skyfunksjonen *"Analyze in Excel"*), finnes det **fire svært effektive metoder** for å koble innsikten fra Power BI sammen med utdypende ad-hoc analysene og ML i Excel.

---

## Oversikt over de 4 Koblingsmetodene

| Metode | Beskrivelse | Nytteverdi | Krever Sky/Service? |
| :--- | :--- | :--- | :--- |
| **Metode 1: Lokal SSAS PivotTable** | Koble Excel direkte til den lokale databasen som kjører inne i Power BI Desktop | Best for interaktiv Pivot-analyse av DAX-måltall | ❌ Nei (100% Lokal) |
| **Metode 2: Felles DuckDB Datalag** | Både Power BI og Excel leser fra `kostra.duckdb` | Best for struktur, stabilitet og Python in Excel ML | ❌ Nei (100% Lokal) |
| **Metode 3: DAX Studio / DAX Query Export** | Eksportere filtrerte avvikstabeller via DAX Query | Best for å hente ut spesifikke "Problem-dataset" | ❌ Nei (Gratis verktøy) |
| **Metode 4: Power BI Summarize/Copy Table** | Kopiere oppsummeringstabeller direkte fra Power BI UI | Raskeste ad-hoc sjekk for enkeltkontoer | ❌ Nei (Innebygd) |

---

## Metode 1: Direkte Kobling fra Excel til Power BI Desktop (Lokal PivotTable) 🚀

Når Power BI Desktop er åpen på PC-en din, kjører den en fullversjon av **Microsoft Analysis Services (SSAS Tabular)** på en lokal port. Du kan koble Excel direkte til denne porten!

### Steg-for-steg oppsett:

1. **Finn den lokale porten til Power BI Desktop:**
   * Åpne **Power BI Desktop** med KOSTRA-rapporten din.
   * Åpne **CMD / PowerShell** og skriv:
     ```powershell
     netstat -ano | findstr 57908   # Eller bruk DAX Studio til å se portnummeret nederst til høyre (f.eks. localhost:51234)
     ```
   *(Alternativt ser du portnummeret direkte i DAX Studio nederst i høyre hjørne!)*

2. **Koble Excel til Power BI Desktop:**
   * Åpne **Excel**.
   * Gå til fanen **Data** $\rightarrow$ **Get Data** $\rightarrow$ **From Database** $\rightarrow$ **From Analysis Services (MSOLAP)**.
   * **Server name:** Skriv `localhost:<portnummer>` (f.eks. `localhost:51234`).
   * Logg inn med **Windows Authentication** (Current User).
   * Velg datamodellen din og klikk **Finish**.

3. **Resultat:**
   * Du har nå en ekte **Excel PivotTable** som er koblet direkte til Power BI Desktop-modellen din! Du kan bruke alle DAX-måltallene dine (`[Avvik Kr]`, `[Early Warning Status]`, `[Projisert EOY]`) direkte i Excel.

---

## Metode 2: Felles DuckDB / CSV Datalag (Anbefalt for ML) 🐍

Siden du ønsker å kjøre **Python in Excel** og **ML-modellering**, er det ofte best å la Python i Excel hente rådataene direkte fra **DuckDB**:

```
                  ┌───────────────────────────────┐
                  │    Felles Datalag / Database  │
                  │   (data/database/kostra.duckdb)│
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│    Power BI Desktop     │                       │     Excel (Python)      │
│ • Visuelt Dashboard     │                       │ • ML-Tidsserieprognoser │
│ • Interaktiv Filtrering │                       │ • Driver-analyse        │
│ • Early Warning DAX     │                       │ • Framsikt-simulering   │
└─────────────────────────┘                       └─────────────────────────┘
```

### Hvordan innsikten flyter fra Power BI til Excel:

1. **Identifiser avviket i Power BI:**  
   Du ser i Power BI Desktop at **Oppvekst (Område 2)** har et rødmerket avvik på **-944 kNOK** på funksjon **2020 (Grunnskole)** og art **1020 (Vikarer)**.

2. **Åpne Excel-modellen for dypdykk:**  
   I Excel-arbeidsboken din har du en Python-celle som stiller spørring til DuckDB spisset mot nettop dette utsnittet:

   ```python
   # Python i Excel cell
   import duckdb

   # Direkte kobling til prosjektets lokale DuckDB (generert via src/db_manager.py):
   con = duckdb.connect("C:/Users/frank/Desktop/Kom - G/data/database/kostra.duckdb")

   # Hent detaljerte linjer for funksjon 2020 (Grunnskole) og art 1020 (Vikarer)
   df_vikar = con.query("""
       SELECT 
           f.Dato, 
           k.Kontonavn, 
           f.Regnskap AS Regnskap_NOK, 
           f.Budsjett AS Budsjett_NOK, 
           (f.Budsjett - f.Regnskap) AS Avvik_NOK
       FROM fact_data f
       JOIN dim_kostra_kontoplan k ON CAST(f.Kontokode_6Siffer AS VARCHAR) = CAST(k.Kontokode_6Siffer AS VARCHAR)
       WHERE f.KOSTRA_Funksjonsgruppe_Kode = '2020' AND k.KOSTRA_Art_4Siffer = '1020'
       ORDER BY f.Dato ASC
   """).df()

   df_vikar
   ```

3. **Kjør ML-Prognose i Excel:**  
   Bruk `scikit-learn` eller `statsmodels` i Excel til å beregne om dette vikarabviket er sesongbetinget (f.eks. eksamensavvikling i mai) eller om det er en varig trend som vil forverre årsresultatet.

---

## Metode 3: DAX Studio Export (For lynraske datadumper)

Dersom du vil eksportere et sammensatt tabellutsnitt fra Power BI Desktop til Excel:

1. Åpne **DAX Studio** (gratis verktøy) og koble til din åpne Power BI Desktop-fil.
2. Skriv en enkel DAX-spørring for å hente ut problemkontoene:
   ```dax
   EVALUATE
   FILTER(
       SUMMARIZECOLUMNS(
           'dim_ansvar'[Omrade_Navn],
           'dim_kostra_funksjon'[Funksjonsgruppe_Kode_Navn],
           'dim_kostra_kontoplan'[Konto_Kode_Navn],
           "Budsjett", [Budsjett],
           "Regnskap", [Regnskap],
           "Avvik", [Avvik Kr]
       ),
       [Avvik] < -50000
   )
   ```
3. Sett **Output** = `Excel` i DAX Studio og trykk **Run (F5)**.
4. DAX Studio åpner automatisk en ferdig Excel-fil med nøyaktig de dataene og måltallene du trenger for videre ML-analyse!

---

## Oppsummerende Arbeidsflyt for Økonomiteamet

1. **Power BI Desktop:** Brukes for overordnet **Early Warning**, styringsdashbord og oppdaging av hvilke sektorer/ansvar som har rød status.
2. **Excel + Python:** Brukes for å **dypdykke i årsakene**, kjøre ML-sesongprognoser på utvalgte avvikskontoer, og simulere budsjettjusteringer for Framsikt.
3. **Streamlit AI App:** Brukes for å sjekke om de foreslåtte tiltakene fra Excel er **juridisk og avtaleverksmessig lovlige** jf. *Anskaffelsesstrategien* og *Kommuneloven*.
