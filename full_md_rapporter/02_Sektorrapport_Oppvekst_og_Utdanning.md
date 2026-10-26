# Sektorrapport: Oppvekst og Utdanning
**Detaljert Analyserapport for Skolesektoren per August 2024**

---

## 1. Sektorstyring og Hovedtall

Skolesektoren (Ansvar KomSkole - 01 Grunnskole) omfatter ordinær grunnskoleundervisning (Funksjon 2020), SFO (Funksjon 2110/2140/2150), PPT (Funksjon 2210) og voksenopplæring (Funksjon 2130).

Rapporten er tilknyttet Power BI-rapporten [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **02. Sektor: Oppvekst og Utdanning** (`p02_trend_og_tidsserie`).

### Samlet Resultat per 31.08.2024 (kNOK)

| Måltall | Verdier YTD | Evaluering |
| :--- | :---: | :--- |
| **Revidert Budsjett YTD** | 17 958,0 kNOK | Tildelt driftsramme jan–aug |
| **Faktisk Regnskap YTD** | 18 902,0 kNOK | Påløpte kostnader |
| **Avvik Kr (Budsjett - Regnskap)** | **-944,0 kNOK** | 🔴 Merforbruk (-5,25 %) |
| **Forbruk i % av Budsjett** | **105,25 %** | 5,25 % over ramme |

---

## 2. Driveranalyse per KOSTRA-Funksjon

Tabellen under viser avviksfordelingen per KOSTRA-funksjon innen skolesektoren:

| Funksjon Kode | Funksjonsnavn | Budsjett (kNOK) | Regnskap (kNOK) | Avvik Kr (Buds - Regn) | Forbruk % | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **2020** | Grunnskoleundervisning | 13 620,0 | 14 473,0 | **-853,0** | 106,26 % | 🔴 Merforbruk |
| **2140** | Skolefritidsordning (SFO) | 2 496,0 | 2 760,0 | **-264,0** | 110,58 % | 🔴 Merforbruk |
| **2210** | PPT og pedagogisk oppfølging | 813,0 | 983,0 | **-170,0** | 120,91 % | 🔴 Merforbruk |
| **2150** | Skoleskyss / Leirskole | 0,0 | 32,0 | **-32,0** | - | 🔴 Ubudsjettert |
| **2130** | Voksenopplæring | 513,0 | 491,0 | **+22,0** | 95,71 % | 🟢 Mindreforbruk |
| **2230** | Spesialpedagogisk tiltak | 516,0 | 469,0 | **+47,0** | 90,89 % | 🟢 Mindreforbruk |
| **2040** | Refusjoner / Statstilskudd | 0,0 | -307,0 | **+307,0** | - | 🟢 Merinntekt |

---

## 3. Top Kostnadsdrivere (Kontoanalyse)

De største kostnadsdriverne som forårsaker merforbruket på -944,0 kNOK i skolesektoren er fordelt på følgende arter (6-sifrede KOSTRA-kontokoder):

### Hoveddrivere Merforbruk (Negative Avvik 🔴)

| Kontokode | Kontonavn | Budsjett (kNOK) | Regnskap (kNOK) | Avvik Kr (kNOK) | Forbruk % | Årsaksforklaring |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **101000** | Fastlønn ordinære | 13 860,0 | 15 274,0 | **-1 414,0** | 110,20 % | Høyere grunnbemanning og lønnsoppgjørsvirkning |
| **102013** | Vikarer ved korttidsfravær | 0,0 | 381,0 | **-381,0** | Ubudsjettert | Ingen opprinnelig avsetning; dekkes fortløpende |
| **102000** | Vikarer ordinære | 200,0 | 472,0 | **-272,0** | 236,00 % | Vikarbruk ved langtidssykefravær og permisjoner |
| **104000** | Overtid | 50,0 | 280,0 | **-230,0** | 560,00 % | Ekstraundervisning, eksamensavvikling og krisetiltak |
| **142900** | Mva-kompensasjon driftsutgifter | 0,0 | 117,0 | **-117,0** | Ubudsjettert | Mva-kompensasjon som kreves refundert post-faktura |

### Kompenserende Merinntekter (Refusjoner 🟢)

| Kontokode | Kontonavn | Budsjett (kNOK) | Regnskap (kNOK) | Avvik Kr (kNOK) | Kommentar |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **171000** | Sykelønnsrefusjon fra NAV | 0,0 | -1 062,0 | **+1 062,0** | Innbetalinger fra NAV som motvirker vikarlønn |
| **171005** | Refusjon foreldrepenger | 0,0 | -307,0 | **+307,0** | Refusjon ved fødsels- og adopsjonspermisjoner |

---

## 4. Konkret Tiltaksplan for Skolesektoren

For å eliminere merforbruket på -944,0 kNOK innen 31.12.2024 iverksettes følgende tre styringstiltak:

1. **50 % Reduksjon i Overtid og Vikarbruk:**  
   Gjennomgang av vikardekning ved korttidsfravær (< 3 dager). Krav om rektorattestasjon før innleie. Målsetting: Innsparing på **+305,5 kNOK** (ved 50 % kutt i restårets overtid/vikarer).
2. **Optimalisering av NAV-refusjonsrutiner (Konto 171000/171005):**  
   Fremskynde digitale innsendelser av sykelønnskrav til NAV for å hente inn anslagsvis **+150,0 kNOK** i forsinkede refusjoner.
3. **Intern administrativ omdisponering fra Helse/Bomiljø:**  
   Søke formannskapet om rammemessig overføring på **+488,5 kNOK** til **+638,5 kNOK** fra ubenyttede lønnsmidler i helsesektoren for å oppnå 0-balanse.

---

## 5. Power BI Implementasjon & DAX-Måltall

I Power BI-modellen ([pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)) drives side `p02_trend_og_tidsserie` av følgende måltall fra `_Måltall`:

```dax
// 1. Måned-over-Måned (MoM) Endring i Regnskap
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

// 2. Rangering av Kontoer etter Største Overforbruk
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

// 3. Prosentvis Bidrag til Samlet Merforbruk
Pct Bidrag til Totalt Overforbruk = 
VAR DetteAvvik = IF([Avvik Kr] < 0, [Avvik Kr], 0)
VAR TotaltOverforbruk = 
    CALCULATE(
        SUMX(
            VALUES(dim_kostra_kontoplan[Kontonavn]),
            VAR Avv = [Avvik Kr]
            RETURN IF(Avv < 0, Avv, 0)
        ),
        ALLSELECTED(dim_kostra_kontoplan)
    )
RETURN 
    DIVIDE(DetteAvvik, TotaltOverforbruk, 0)

// 4. Tidsserie Storytelling Narrative
Story Time Narrative = 
VAR MoM_Kr = [Regnskap MoM Endring Kr]
VAR MoM_Pct = [Regnskap MoM Endring %]
RETURN
    IF(
        ISBLANK(MoM_Kr),
        "Velg en måned for å se månedsendring i regnskapsførsel.",
        "Månedlig regnskapsutvikling viser en endring på " & 
        FORMAT(MoM_Kr, "+#,##0 kr;-#,##0 kr;0 kr") & 
        " (" & FORMAT(MoM_Pct, "+0.0%;-0.0%;0.0%") & ") fra forrige måned."
    )
```

---
*Rapporten er tilknyttet: [02_Sektorrapport_Oppvekst_og_Utdanning.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/02_Sektorrapport_Oppvekst_og_Utdanning.md) | Power BI side: `p02_trend_og_tidsserie`.*
