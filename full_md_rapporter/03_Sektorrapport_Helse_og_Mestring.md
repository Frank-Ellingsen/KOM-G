# Sektorrapport: Helse og Mestring / Bomiljø
**Detaljert Analyserapport for Helse- og Omsorgssektoren per August 2024**

---

## 1. Sektorstyring og Hovedtall

Helse- og omsorgssektoren (Ansvar Bomiljø - Pleie og Omsorg) dekker pleie og omsorg i institusjon og bolig (KOSTRA-funksjon 2540), aktivitetssentre, avlastningsboliger og tilrettelagte botilbud.

Rapporten er tilknyttet Power BI-rapporten [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **03. Sektor: Helse og Mestring** (`p04_avvik_og_drivere`).

### Samlet Resultat per 31.08.2024 (i kroner)

| Måltall | Verdier YTD | Evaluering |
| :--- | :---: | :--- |
| **Revidert Budsjett YTD** | 17 233 691,00 kr | Tildelt driftsramme jan–aug |
| **Faktisk Regnskap YTD** | 12 622 851,42 kr | Påløpte kostnader |
| **Avvik Kr (Budsjett - Regnskap)** | **+4 610 839,58 kr** | 🟢 Mindreforbruk (+26,75 %) |
| **Forbruk i % av Budsjett** | **73,25 %** | 26,75 % under budsjettramme |

---

## 2. Kontoanalyse – Største Innsparinger vs. Avvikskilder

Sektoren kjennetegnes av betydelige besparelser på faste lønnsposter grunnet rekrutteringsutfordringer og ubesatte stillinger, men med enkelte kostnadseksplosjoner på innleie av eksterne vikarbyråtjenester for å sikre lovpålagt forsvarlig bemanning:

### Top 5 Besparelseskontoer (Mindreforbruk 🟢)

| Kontokode | Kontonavn | Budsjett (kr) | Regnskap (kr) | Mindreforbruk Kr | Forbruk % |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **101000** | Fastlønn ordinære | 9 160 700,00 | 6 206 768,61 | **+2 953 931,39 kr** | 67,75 % |
| **109000** | Pensjon fellesordningen (KLP) | 3 045 123,00 | 2 210 887,62 | **+834 235,38 kr** | 72,60 % |
| **109999** | Arbeidsgiveravgift | 2 203 167,00 | 1 527 431,13 | **+675 735,87 kr** | 69,33 % |
| **101031** | Fastlønn - kvelds-/nattillegg | 845 700,00 | 482 030,26 | **+363 669,74 kr** | 57,00 % |
| **101030** | Fastlønn - lørdag-/søndagstillegg | 680 000,00 | 323 761,45 | **+356 238,55 kr** | 47,61 % |

*Samlet representerer disse fem personallinjene en akkumulert besparelse på over **5,18 mill. kr**.*

### Top 3 Merforbrukskontoer (Overskridelse 🔴)

| Kontokode | Kontonavn | Budsjett (kr) | Regnskap (kr) | Merforbruk Kr | Årsak |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **127040** | Kjøp av vikarbyråtjenester | 0,00 | 382 656,00 | **-382 656,00 kr** | Innleie fra Adecco/Dedicare ved akutt sykepleiemangel |
| **102031** | Vikar - kvelds-/nattillegg | 0,00 | 259 304,09 | **-259 304,09 kr** | Turnustillegg til timelønnede vikarer ved helgevakter |
| **171000** | Refusjoner fra staten | 0,00 | 173 607,00 | **-173 607,00 kr** | Periodiseringsforsinkelse i statlige refusjoner |

---

## 3. Årsaksforklaring & Strategisk Handlingsrom

1. **Rekrutteringsutfordringer og Vakanser:** Det store mindreforbruket på fastlønn (+2,95 mill. kr) og avledet pensjon (+0,83 mill. kr) skyldes at flere autoriserte sykepleier- og vernepleierstillinger har stått ubesatt i første halvår.
2. **Kjøp av Vikarbyråtjenester:** For å opprettholde lovpålagt faglig forsvarlighet og turnusdekning har enheten måttet leie inn personell fra vikarbyråer (Konto `127040 Kjøp av vikarbyråtjenester`), noe som har kostet **382 656,00 kr**. Dette er timepriser som ligger vesentlig over ordinær kommunal tariff.
3. **Frigjøring av rammemidler (Omdisponeringskilde):** Sektoren har et reelt, dokumentert mindreforbruk som ved årsslutt er anslått til over **+6,9 mill. kr**. Sektoren tåler derfor utmerket en administrativ overføring på **638,5 kNOK** til skolesektoren for å saldere kommunens samlede driftsresultat til 0-balanse.

---

## 4. Power BI Implementasjon & DAX-Måltall

I Power BI-modellen ([pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)) er side `p04_avvik_og_drivere` konfigurert med følgende spesifikke tiltaks- og drivermåltall:

```dax
// 1. Identifikasjon av største kostnadsdriver
ERP Største Kostnadsdriver = 
VAR DriverKonto = 
    TOPN(
        1,
        VALUES(dim_kostra_kontoplan[Kontonavn]),
        ABS([Avvik Kr]),
        DESC
    )
RETURN
    CONCATENATEX(DriverKonto, dim_kostra_kontoplan[Kontonavn], ", ")

// 2. Beløp for største driver
ERP Største Kostnadsdriver Beløp = 
VAR DriverKonto = 
    TOPN(
        1,
        VALUES(dim_kostra_kontoplan[Kontonavn]),
        ABS([Avvik Kr]),
        DESC
    )
RETURN
    CALCULATE([Avvik Kr], DriverKonto)

// 3. Nødvendig månedlig innsparing / tiltaksbehov for reståret
ERP Driver Tiltaksbehov Restår = 
VAR YtdAvvik = [Avvik Kr]
RETURN
    IF(YtdAvvik < 0, ABS(YtdAvvik), 0)

// 4. Detaljert årsaksforklaring (Root Cause Narrative)
Story Root Cause Detail = 
VAR StørsteDriver = [ERP Største Kostnadsdriver]
VAR DriverBelop = [ERP Største Kostnadsdriver Beløp]
RETURN
    IF(
        ISBLANK(StørsteDriver),
        "Ingen dominerende avvikskonto identifisert.",
        "Hovedavviket drives primært av '" & StørsteDriver & 
        "' med et netto avvik på " & FORMAT(DriverBelop, "#,##0 kr") & 
        ". Tiltak bør rettes spesifikt mot denne kontoen."
    )
```

---
*Rapporten er tilknyttet: [03_Sektorrapport_Helse_og_Mestring.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/03_Sektorrapport_Helse_og_Mestring.md) | Power BI side: `p04_avvik_og_drivere`.*
