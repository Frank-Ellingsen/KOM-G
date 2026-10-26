# Hovedrapport for Økonomi og Virksomhetsstyring 2024
**Kristiansand Kommune – Periodisk Månedsrapport per August (Måned 08)**

---

## Executive Summary

Denne hovedrapporten gir kommunedirektøren, formannskapet og bystyret en helhetlig status for kommunens økonomiske drift og budsjettgjennomføring for **siste avsluttede regnskapsmåned (Måned 08 / August 2024)** samt **akkumulert hittil i år (YTD Måneder 01–08)**.

Rapporten bygger utelukkende på konsoliderte faktiske data fra datamodellens faktatabell (`fact_data` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip)), strukturert etter KOSTRA-standarder og kommunens ansvarsstruktur.

Dataene er direkte integrert med side **01. Hovedrapport (Kommuneøkonomi 2024)** (`p01_executive_summary`) i Power BI.

### Hovedtall for Siste Faktiske Måned (Måned 08 / August 2024) (i kNOK)

| Sektor | Revidert Budsjett (kNOK) | Faktisk Regnskap (kNOK) | Avvik Kr (Budsjett - Regnskap) | Forbruk % | Status RAG |
| :--- | ---: | ---: | ---: | ---: | :---: |
| **Oppvekst og Utdanning (Skole)** | 2 245,0 | 2 363,0 | **-118,1** | 105,26 % | 🔴 Merforbruk |
| **Helse og Omsorg (Bomiljø)** | 1 525,2 | 1 757,7 | **-232,6** | 115,25 % | 🔴 Merforbruk |
| **KONSOLIDERT MÅNED 08** | **3 770,1** | **4 120,8** | **-350,7** | **109,30 %** | 🔴 Merforbruk |

### Akkumulert Driftsstatus YTD per Måned 08 (Januar–August 2024) (i kNOK)

| Sektor | Budsjett YTD (kNOK) | Regnskap YTD (kNOK) | Avvik Kr YTD (kNOK) | Forbruk % | Status RAG |
| :--- | ---: | ---: | ---: | ---: | :---: |
| **Oppvekst og Utdanning (Skole)** | 17 958,0 | 18 902,0 | **-944,0** | 105,26 % | 🔴 Merforbruk |
| **Helse og Omsorg (Bomiljø)** | 11 337,2 | 12 622,9 | **-1 285,6** | 111,34 % | 🔴 Merforbruk |
| **KONSOLIDERT TOTALT YTD** | **29 295,2** | **31 524,9** | **-2 229,6** | **107,61 %** | 🔴 Samlet merforbruk |

> **Formel for avvik:** $\text{Avvik Kr} = \text{Budsjett} - \text{Regnskap}$.  
> *Negativt avvik innebærer merforbruk (overskridelse), mens positivt avvik innebærer mindreforbruk (besparing).*

---

## 1. Overordnet Økonomisk Status

I siste avsluttede regnskapsmåned (august 2024) registrerte kommunen et **samlet månedlig merforbruk på -350,7 kNOK (109,30 % forbruk)**. Akkumulert hittil i år (måned 01–08) viser regnskapet et **konsolidert merforbruk på -2 229,6 kNOK (107,61 % forbruk)**.

Begge sektorer opererer med merforbruk, men med ulik underliggende dynamikk:

1. **Helse og Omsorg (Bomiljø):**  
   - Måned 08 viser et merforbruk på **-232,6 kNOK (115,25 %)**.
   - Akkumulert YTD viser et merforbruk på **-1 285,6 kNOK (111,34 %)**.
   - Hovedårsak: Ekstern innleie av personell via vikarbyråer (Konto `127040 Kjøp av vikarbyråtjenester` utgjorde **253,2 kNOK** bare i august) samt ubudsjetterte vikar- og turnustillegg (`102031`).
2. **Oppvekst og Utdanning (KomSkole):**  
   - Måned 08 viser et merforbruk på **-118,1 kNOK (105,26 %)**.
   - Akkumulert YTD viser et merforbruk på **-944,0 kNOK (105,26 %)**.
   - Hovedårsak: Høyere grunnbemanning på fastlønn (`101000 Fastlønn`), korttidsvikarer ved skolestart (`102013`) og overtid (`104000`), delvis motvirket av statlige refusjoner (`2040`).

---

## 2. Topp Kostnadsdrivere i Måned 08 (August 2024)

De største avvikskildene i august måned (i kNOK):

| Kontokode | Kontonavn | Sektor | Budsjett (kNOK) | Regnskap (kNOK) | Avvik (kNOK) | Forbruk % |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: |
| **127040** | Kjøp av vikarbyråtjenester | Helse | 0,0 | 253,2 | **-253,2** | Ubudsjettert |
| **101000** | Fastlønn ordinære | Begge | 2 333,5 | 2 530,3 | **-196,8** | 108,43 % |
| **102013** | Vikarer ved korttidsfravær | Begge | 12,7 | 61,9 | **-49,2** | 488,99 % |
| **102031** | Vikar kvelds-/nattillegg | Helse | 0,0 | 45,9 | **-45,9** | Ubudsjettert |
| **104000** | Overtid | Begge | 9,4 | 52,4 | **-43,0** | 557,79 % |
| **102000** | Vikarer ordinære | Begge | 16,7 | 49,3 | **-32,7** | 296,04 % |

---

## 3. Strategiske Anbefalinger for Kommunedirektøren

1. **Strammere innleiekontroll for vikarbyråer:**  
   Vikarbyråtjenester (Konto `127040`) representerer det største enkeltavviket i august (-253,2 kNOK). Det må etableres strengere rammeavtaler og krav om godkjenning på kommunalsjefnivå før ekstern innleie iverksettes.
2. **Kutt i overtid og korttidsvikarer ved skolestart:**  
   Overtid (`104000`) og korttidsvikarer (`102013`) i skolesektoren må reduseres med 50 % i månedene september–desember gjennom intern omfordeling av undervisningsressurser.
3. **Månedlig oppfølging i Power BI Cockpit:**  
   Ukentlig oppfølging av `_Måltall` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) med tidligvarsling dersom månedlig overforbruk overstiger toleransegrensen på 5,0 %.

---

## 4. Power BI Implementasjon & DAX-Måltall

I Power BI er side `p01_executive_summary` tilknyttet følgende DAX-måltall fra `_Måltall`:

```dax
// 1. Totalregnskap YTD
Sum Regnskap = SUM(fact_data[Belop_Regnskap])

// 2. Totalbudsjett YTD
Sum Budsjett = SUM(fact_data[Belop_Budsjettert])

// 3. Budsjettdisiplin: Positivt = Mindreforbruk, Negativt = Merforbruk
Avvik Kr = [Sum Budsjett] - [Sum Regnskap]

// 4. Forbruk i prosent av budsjettramme
Forbruk % = DIVIDE([Sum Regnskap], [Sum Budsjett], 0)

// 5. Automatisk RAG-indikator
Status RAG Symbol = 
SWITCH(
    TRUE(),
    [Forbruk %] > 1.02, "🔴",
    [Forbruk %] >= 0.98, "🟡",
    "🟢"
)

// 6. Dynamisk ledelsesnotat for Måned 08
Story Executive Summary = 
VAR TotAvv = [Avvik Kr]
VAR ForbrPct = [Forbruk %]
RETURN 
    IF(TotAvv >= 0, 
        "Regnskapet viser et samlet mindreforbruk på " & FORMAT(TotAvv, "#,##0 kr") & " (" & FORMAT(ForbrPct, "0.0%") & " forbruk).",
        "Regnskapet viser et samlet merforbruk på " & FORMAT(ABS(TotAvv), "#,##0 kr") & " (" & FORMAT(ForbrPct, "0.0%") & " forbruk). Hoveddrivere er vikarbyrå og overtid."
    )
```

---
*Rapporten er tilknyttet: [01_Hovedrapport_Kommuneokonomi_2024.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/01_Hovedrapport_Kommuneokonomi_2024.md) | Power BI side: `p01_executive_summary`.*
