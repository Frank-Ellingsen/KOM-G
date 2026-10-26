# 05 - Antigravity: Slicers, Dynamiske Tekstbokser & Layout Best Practices

Dette dokumentet gir den komplette oppskriften på å konfigurere **Slicers**, **Dynamiske Tekstbokser (Selection Display)** og **Grid-basert Layout** i Power BI for prosjektet **`pbi-rep-project.pbip`**.

---

## 1. Oppsett av Slicers i Power BI

For en optimal brukeropplevelse benyttes et konsistent sett med slicere plassert i den dedikerte filterlinjen rett under toppbanneret:

| Slicer Tittel | Kilde-felt i Datamodellen | Slicer Style | Utvalgslogikk |
|---|---|---|---|
| **År** | `dim_date[Ar]` | **Tile (Fliser)** | Enkeltvalg (Single-select, standard 2024) |
| **Måned** | `dim_date[Maned_Navn]` | **Dropdown** | Flerutvalg (Vis "Velg alle" / Select All) |
| **Område** | `dim_ansvar[Omrade_Navn]` | **Dropdown** | Flerutvalg (Vis "Velg alle") |
| **Ansvar / Enhet** | `dim_ansvar[Enhet_Navn]` | **Hierarchical Dropdown** | Flerutvalg (Hierarki: `Omrade_Navn` -> `Enhet_Navn`) |
| **KOSTRA Funksjon** | `dim_kostra_funksjon[Funksjon_Kode_Navn]` | **Dropdown med søk** | Flerutvalg med søkefelt aktivert |
| **Konto / Art** | `dim_kostra_kontoplan[Konto_Kode_Navn]` | **Dropdown med søk** | Flerutvalg med søkefelt aktivert |

---

## 2. DAX for Dynamiske Tekstbokser (Selection Display)

For at ledelsen og saksbehandlere umiddelbart skal se hvilke filtervalg som ligger til grunn for tallene, benyttes dynamiske tekstbokser koblet til følgende DAX-måltall i display folder **`07. Dynamisk Tekst`**:

### A. Tekstboks for Valgt Måned og År
```dax
Txt Valgt Måned = 
IF (
    ISFILTERED ( 'dim_date'[Maned_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_date'[Maned_Navn] ), 'dim_date'[Maned_Navn], ", " ),
    "Alle Måneder (Jan - Aug)"
)

Txt Valgt År = 
SELECTEDVALUE ( 'dim_date'[Ar], "Alle År (2024)" )
```

### B. Tekstboks for Valgt Område og Ansvar
```dax
Txt Valgt Område = 
IF (
    ISFILTERED ( 'dim_ansvar'[Omrade_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_ansvar'[Omrade_Navn] ), 'dim_ansvar'[Omrade_Navn], ", " ),
    "Alle Områder / Konsern"
)

Txt Valgt Ansvar = 
IF (
    ISFILTERED ( 'dim_ansvar'[Enhet_Navn] ),
    CONCATENATEX ( VALUES ( 'dim_ansvar'[Enhet_Navn] ), 'dim_ansvar'[Enhet_Navn], ", " ),
    "Alle Ansvarsenheter"
)
```

### C. Master Selection Header Box (Kombinert tittelbanner)
```dax
Txt Master Selection Header = 
"KOSTRA Rapport | År: " & [Txt Valgt År] &
" | Periode: " & [Txt Valgt Måned] &
" | Område: " & [Txt Valgt Område] &
" | Enhet: " & [Txt Valgt Ansvar] &
" | Status: " & [Status Indikator]
```

---

## 3. Synkronisering og Nullstilling (Sync Slicers & Reset Button)

1. **Synkronisering på tvers av sider (Sync Slicers):**
   * I Power BI Desktop: Velg fanen **View** -> **Sync slicers**.
   * Marker hver enkelt slicer (År, Måned, Område, Ansvar).
   * Huk av for både **Sync** (de to roterende pilene) og **Visible** (øyet) for alle rapportsidene (*Control Cockpit*, *Statusrapport*, *Prognoserapport*).
   * Dette sikrer at et valg gjort i *Control Cockpit* umiddelbart reflekteres når brukeren klikker seg videre til *Status* eller *Prognose*.
2. **Nullstillingsknapp (Reset Filters):**
   * Still alle slicere i sin standardtilstand (f.eks. År = 2024, ingen filtrering på Måned/Område).
   * Åpne **Bookmarks**-panelet og legg til et nytt bokmerke med navn: `ResetFiltersBookmark`.
   * Høyreklikk på bokmerket og sett:
     * **Data**: På (Checked)
     * **Display**: Av (Unchecked)
     * **Current Page**: Av (Unchecked)
   * Sett inn en knapp øverst til høyre i toppbanneret (**Insert -> Button -> Reset**).
   * Under **Format button -> Action**:
     * **Type**: `Bookmark`
     * **Bookmark**: `ResetFiltersBookmark`
     * **Tooltip**: "Klikk for å nullstille alle filtre"

---

## 4. Edward Tufte Layout Grid & UX Retningslinjer

Rapporten er utformet etter Edward Tuftes prinsipper for **høy datablekk-andel (Data-Ink Ratio)**:

1. **Skjermformat:** 16:9 widescreen (1920 x 1080 px).
2. **Top Banner (Høyde: 110 px):**
   * Venstre: Rapportsidetittel (Segoe UI Semibold, 24 pt, farge `#323130`).
   * Midten: Dynamisk infoboks med `[Txt Master Selection Header]` (11 pt, bakgrunnsplate `#F3F2F1`, hjørneradius 4 px).
   * Høyre: `Reset Filters`-knapp.
3. **Filterlinje (Høyde: 60 px):**
   * Kompakt horisontal rekke med slicere rett under banneret.
4. **KPI Strip (Høyde: 140 px):**
   * 4 standardiserte KPI-kort:
     * Verditekst: 32 pt bold.
     * Etikett under verdi: 11 pt regular, grå tekst (`#605E5C`).
     * RAG-farge brukes kun på avvikskortet (`[Avvik YTD Kr]`), ikke på nøytrale budsjettall.
5. **Main Canvas Grid (Høyde: 740 px):**
   * 2x2 eller 3x2 symmetrisk rutenett med 12 px mellomrom.
6. **Tuftes datavisualiseringsregler:**
   * **Ingen vertikale rutenettlinjer:** I matriser og tabeller fjernes alle vertikale skillelinjer. Kun lette horisontale linjer under overskrifter tillates.
   * **Ingen bakgrunnsskygger (Drop shadows):** Alle skyggeeffekter og tunge rammer er slått av for maksimal renhet.
   * **Direkte merking:** På tidsserielinjer brukes direkte merking på endepunktene i stedet for separate fargeforklaringer.
   * **Dempet fargepalett:** Nøytral bakgrunn (`#FFFFFF`), koksgrå tekst (`#201F1E`), og farger reservert utelukkende for reelle avvik (`#D13438` for overforbruk og `#107C41` for mindreforbruk).
   * **Justering:** Tekstkolonner er alltid venstrejustert, mens tall og valuta er høyrejustert med faste desimaler.
