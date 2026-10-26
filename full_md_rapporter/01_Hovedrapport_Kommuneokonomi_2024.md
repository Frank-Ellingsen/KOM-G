# Hovedrapport for Økonomi og Virksomhetsstyring 2024
**Kristiansand Kommune – Periodisk Rapport per August 2024**

---

## Executive Summary

Denne hovedrapporten gir kommunedirektøren, formannskapet og bystyret en helhetlig status for kommunens økonomiske drift og budsjettgjennomføring per 31. august 2024. Rapporten bygger på konsoliderte faktadata fra sektorene **Oppvekst og Utdanning** (Ansvar KomSkole - Grunnskole) og **Helse og Mestring** (Ansvar Bomiljø - Pleie og Omsorg), strukturert i henhold til KOSTRA-standarden og kommunens ansvarsstruktur.

Dataene er hentet direkte fra og fullt integrert med Power BI-prosjektet [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **01. Hovedrapport (Kommuneøkonomi 2024)** (`p01_executive_summary`).

### Hovedtall per 31.08.2024 (i kNOK / tusen kroner)

| Sektor | Revidert Budsjett YTD | Faktisk Regnskap YTD | Avvik Kr (Budsjett - Regnskap) | Forbruk % | Status RAG |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Oppvekst og Utdanning (Skole)** | 17 958,0 | 18 902,0 | **-944,0** | 105,25 % | 🔴 Merforbruk |
| **Helse og Mestring (Bomiljø/Omsorg)** | 17 233,7 | 12 622,9 | **+4 610,8** | 73,25 % | 🟢 Mindreforbruk |
| **KONSOLIDERT TOTALT** | **35 191,7** | **31 524,9** | **+3 666,8** | **89,58 %** | 🟢 Totalbalanse |

> **Formel for avvik:** $\text{Avvik Kr} = \text{Budsjett} - \text{Regnskap}$.  
> *Positivt avvik innebærer mindreforbruk (besparing), mens negativt avvik innebærer merforbruk (overskridelse).*

---

## 1. Overordnet Økonomisk Status

Kommunen har samlet sett et **positivt driftsavvik på +3,67 mill. kr (+3 666,8 kNOK)** ved utgangen av august 2024. Bak dette konsoliderte tallet skjuler det seg imidlertid en **betydelig strukturell ubalanse mellom sektorene**:

1. **Skolesektoren (Oppvekst og Utdanning - KomSkole):** Driver med et akkumulert merforbruk på **-944,0 kNOK (-5,25 %)**. Merforbruket skyldes uforholdsmessig høyt vikarforbruk, overtid og korttidsfravær som dekkes inn uten tilstrekkelig budsjettdekning.
2. **Helse og Mestring (Bomiljø):** Viser et akkumulert mindreforbruk på **+4,61 mill. kr (+26,75 %)**. Dette skyldes i hovedsak vakanser og rekrutteringsutfordringer på ordinære fastlønnsstillinger, som gir lavere lønns- og pensjonsutgifter enn budsjettert.

### Visualisering og Dashboard Layout i Power BI
I Power BI-rapporten [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) (Side 1: `p01_executive_summary`) presenteres denne statusen gjennom:
- **Executive Card Row:** Direkte visning av `[Sum Budsjett]`, `[Sum Regnskap]`, `[Avvik Kr]`, og `[Forbruk %]`.
- **Diverging Bar Chart:** Netto avvik per sektor med rød/grønn fargekoding basert på fortegn (`#D13438` for merforbruk, `#107C41` for mindreforbruk).
- **Executive Narrative Box:** Drevet av DAX-måltallet `[Story Executive Summary]`, som automatisk genererer ledelsens månedsnotat.

---

## 2. Hovedrisikoer & Utviklingstrender

* **Risiko 1: Rekrutteringssvikt skaper utilsiktet mindreforbruk i Helse.** Mindreforbruket i Helse og Mestring (+4,61 mill. kr) er ikke et resultat av bevisst effektivisering, men av at kommunen mangler fagpersonell (sykepleiere/vernepleiere). Dette skaper overbelastning på gjenværende stab og svekker tjenestekvaliteten over tid.
* **Risiko 2: Vikar- og overtidsspiral i Skole.** Skolesektoren har et udekket vikar- og overforbruk på personalsiden (-1,41 mill. kr på fastlønn/vikarer) som truer med å spise opp rammene for høsten 2024 dersom det ikke iverksettes umiddelbare styringstiltak.
* **Risiko 3: Mangel på fleksibilitet i budsjettrammene.** Uten formelle omdisponeringsvedtak mellom sektorene kan skolesektoren få et ufortjent merforbruksstempel selv om kommunen som helhet går i solid pluss.

---

## 3. Strategiske Anbefalinger for Kommunedirektøren

1. **Omdisponering av lønnsmidler:** Gjennomføre en formell administrativ omdisponering i tertialrapporten hvor **638,5 kNOK** flyttes fra Helse og Mestring til Oppvekst og Utdanning for å dekke inn uunngåelige vikarutgifter.
2. **Vikar- og overtidsstopp i Skole:** Innføre strengere attestasjonsregler for overtidsbruk (Konto `104000 Overtid`) og korttidsvikarer (Konto `102013 Vikarer ved sykdom/korttidsfravær`).
3. **Månedlig RAG-oppfølging:** Ta i bruk Power BI Control Cockpit med de automatiske DAX-måltallene fra tabell `_Måltall` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) for ukentlig kontroll på enhetsledernivå.

---

## 4. Power BI Implementasjon & DAX-Måltall

Følgende kjerne-måltall fra `_Måltall` i semantisk modell forsyner rapporten:

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

// 6. Dynamisk ledelsesnotat
Story Executive Summary = 
VAR TotAvv = [Avvik Kr]
VAR ForbrPct = [Forbruk %]
VAR SektorTekst = 
    IF(TotAvv >= 0, 
        "Akkumulert regnskap per august viser et samlet mindreforbruk på " & FORMAT(TotAvv, "#,##0 kr") & " (" & FORMAT(ForbrPct, "0.0%") & " forbruk). Kommunens samlede likviditet er robust.",
        "Akkumulert regnskap per august viser et samlet merforbruk på " & FORMAT(ABS(TotAvv), "#,##0 kr") & " (" & FORMAT(ForbrPct, "0.0%") & " forbruk). Det kreves korrigerende tiltak."
    )
RETURN SektorTekst
```

---
*Rapporten er tilknyttet: [01_Hovedrapport_Kommuneokonomi_2024.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/01_Hovedrapport_Kommuneokonomi_2024.md) | Power BI side: `p01_executive_summary`.*
