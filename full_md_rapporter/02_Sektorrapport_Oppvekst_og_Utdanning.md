# Sektorrapport: Oppvekst og Utdanning
**Detaljert Analyserapport for Skolesektoren per Måned 08 (August 2024)**

---

## 1. Sektorstyring og Hovedtall

Skolesektoren (Ansvar `KomSkole` - Grunnskole) omfatter ordinær grunnskoleundervisning (Funksjon 2020), SFO (Funksjon 2140), PPT (Funksjon 2210), voksenopplæring (Funksjon 2130) og spesialpedagogikk (Funksjon 2230).

Rapporten bygger på faktiske data fra `fact_data` i datamodellen ([pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)), tilknyttet side **02. Sektor: Oppvekst og Utdanning** (`p02_trend_og_tidsserie`).

> **Måleenhet:** Alle tall er oppgitt i **tusen kroner (kNOK)** med én desimal.

### Tabell 1: Driftsresultat Måned 08 (August 2024 isolert)

| Måltall | Verdier Måned 08 (kNOK) | Evaluering |
| :--- | ---: | :--- |
| **Revidert Budsjett Måned 08** | 2 245,0 kNOK | Månedens tildelte ramme |
| **Faktisk Regnskap Måned 08** | 2 363,0 kNOK | Påløpte kostnader |
| **Avvik Kr (Budsjett - Regnskap)** | **-118,1 kNOK** | 🔴 Merforbruk (-5,26 %) |
| **Forbruk i % av Budsjett** | **105,26 %** | 5,26 % over månedsramme |

### Tabell 2: Akkumulert Driftsresultat YTD (Måneder 01–08)

| Måltall | Verdier YTD (kNOK) | Evaluering |
| :--- | ---: | :--- |
| **Revidert Budsjett YTD** | 17 958,0 kNOK | Ramme for jan–aug |
| **Faktisk Regnskap YTD** | 18 902,0 kNOK | Påløpte kostnader hittil |
| **Avvik Kr YTD (Budsjett - Regnskap)** | **-944,0 kNOK** | 🔴 Merforbruk (-5,26 %) |
| **Forbruk i % av Budsjett** | **105,26 %** | 5,26 % over ramme |

---

## 2. Driveranalyse per KOSTRA-Funksjon i Måned 08 (August)

Fordeling av regnskap og budsjett per KOSTRA-funksjon i siste avsluttede måned (kNOK):

| Funksjon | Funksjonsnavn | Budsjett (kNOK) | Regnskap (kNOK) | Avvik Kr (kNOK) | Forbruk % | Status |
| :---: | :--- | ---: | ---: | ---: | ---: | :---: |
| **2020** | Grunnskoleundervisning | 1 702,8 | 1 809,2 | **-106,4** | 106,25 % | 🔴 Merforbruk |
| **2140** | Skolefritidsordning (SFO) | 311,9 | 345,2 | **-33,3** | 110,67 % | 🔴 Merforbruk |
| **2210** | PPT og pedagogisk oppfølging | 101,7 | 122,9 | **-21,3** | 120,90 % | 🔴 Merforbruk |
| **2150** | Skoleskyss / Leirskole | 0,0 | 4,0 | **-4,0** | Ubudsjettert | 🔴 Merforbruk |
| **2130** | Voksenopplæring | 64,1 | 61,4 | **+2,7** | 95,82 % | 🟢 Mindreforbruk |
| **2230** | Spesialpedagogiske tiltak | 64,5 | 58,7 | **+5,8** | 90,95 % | 🟢 Mindreforbruk |
| **2040** | Statlige refusjoner | 0,0 | -38,4 | **+38,4** | Merinntekt | 🟢 Mindreforbruk |

---

## 3. Topp Kostnadsdrivere i Måned 08 (August 2024)

Avvik per KOSTRA-artskonto i august måned:

| Kontokode | Kontonavn | Budsjett (kNOK) | Regnskap (kNOK) | Avvik Kr (kNOK) | Forbruk % | Kommentar |
| :---: | :--- | ---: | ---: | ---: | ---: | :--- |
| **101000** | Fastlønn ordinære | 1 476,3 | 1 653,0 | **-176,7** | 111,97 % | Lønnsglidning og grunnbemanning ved skolestart |
| **102013** | Vikarer ved korttidsfravær | 12,7 | 61,9 | **-49,2** | 488,99 % | Akutt vikarbehov ved semesterstart |
| **104000** | Overtid | 9,4 | 52,4 | **-43,0** | 557,79 % | Planleggingsdager og ekstraarbeid |
| **102000** | Vikarer ordinære | 16,7 | 49,3 | **-32,7** | 296,04 % | Langtidspermisjoner |
| **142900** | Mva-kompensasjon driftsutgifter | 11,7 | 25,6 | **-13,9** | 219,30 % | Periodisering |
| **2040/1710** | Refusjoner | 0,0 | -38,4 | **+38,4** | - | Innbetalte statlige refusjoner |

---

## 4. Konkret Tiltaksplan for Skolesektoren

For å begrense merforbruket fram mot 31.12.2024 iverksettes:
1. **50 % Reduksjon i Vikarer og Overtid:** Gjennomgang av vikarbehov ved fravær under 3 dager. Målsetting: innsparing på **+305,5 kNOK** i reståret.
2. **Fremskyndet refusjonskrav fra NAV:** Sikre digital innsending for sykelønnsrefusjon (`171000`) for å realisere anslagsvis **+150,0 kNOK**.
3. **Månedlig oppfølging i Power BI:** Ukentlig kontroll på enhetsledernivå med automatisk varsling i `p02_trend_og_tidsserie`.

---

## 5. Power BI Implementasjon & DAX-Måltall

```dax
// Måned-over-måned regnskapsendring
Regnskap MoM Endring Kr = 
VAR CurrentMonth = SELECTEDVALUE(dim_date[month])
VAR CurrentVal = [Sum Regnskap]
VAR PrevVal = 
    CALCULATE(
        [Sum Regnskap],
        dim_date[month] = CurrentMonth - 1
    )
RETURN 
    IF(ISBLANK(PrevVal), BLANK(), CurrentVal - PrevVal)

// Rangering av overforbrukskontoer
Rangering Overforbruk = 
IF(
    [Avvik Kr] < 0,
    RANKX(
        ALLSELECTED(dim_kostra_kontoplan[Kontonavn]),
        [Avvik Kr],
        ,
        ASC,
        Dense
    ),
    BLANK()
)
```

---
*Rapporten er tilknyttet: [02_Sektorrapport_Oppvekst_og_Utdanning.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/02_Sektorrapport_Oppvekst_og_Utdanning.md) | Power BI side: `p02_trend_og_tidsserie`.*
