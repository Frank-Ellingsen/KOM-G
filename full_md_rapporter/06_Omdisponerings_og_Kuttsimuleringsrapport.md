# What-If Scenario- og Balanserapport
**Omdisponering og Kuttsimulering for EOY 0-Balanse**

---

## 1. Problemstilling og Formål

Skolesektoren (Oppvekst og Utdanning) har per 31. august 2024 et akkumulert merforbruk på **-944,0 kNOK**, med en prognostisert årssluttoverskridelse på **-1 416,0 kNOK** dersom ingen tiltak iverksettes. Samtidig har helse- og omsorgssektoren (Bomiljø) et akkumulert mindreforbruk på **+4 610,8 kNOK** (prognostisert til over **+6,9 mill. kr** ved årsslutt) på grunn av vakanser.

Formålet med denne rapporten er å simulere hvordan kommunen – ved hjelp av målrettede kutt i hovedkostnadsdriverne (vikarer og overtid) kombinert med en administrativ rammemessig omdisponering – kan oppnå **fullstendig 0-balanse (0,- kr i avvik) for skolesektoren ved årets slutt (EOY)**.

Rapporten er direkte implementert i Power BI-prosjektet [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **06. What-If Scenario og Balanse** (`p06_scenario_simulering`).

---

## 2. Tre Scenarier for EOY Resultat

For å gi politisk og administrativ ledelse et solid beslutningsgrunnlag er det modellert tre distinkte handlingsalternativer:

### Scenario A: Status Quo (Ingen operative eller budsjettmessige tiltak)
* **Beskrivelse:** Driften fortsetter som i de første 8 månedene uten innstramminger i vikarbruk eller omdisponeringer.
* **Prognose Skole EOY:** **-1 416,0 kNOK** i merforbruk.
* **Prognose Helse EOY:** **+6 916,2 kNOK** i mindreforbruk.
* **Konsolidert Kommuneoverskudd:** **+5 500,2 kNOK**.
* **Vurdering (❌ Frarådes):** Selv om kommunen samlet går i pluss, etterlater dette et uakseptabelt budsjettbrudd i skolesektoren som undergraver budsjettansvaret til rektorene.

### Scenario B: Rent Driftstiltak (50 % kutt i overtid og korttidsvikarer)
* **Beskrivelse:** Det innføres streng attestasjonskontroll og 50 % reduksjon i innleie av vikarer og overtid i månedene september–desember. Dette gir en isolert besparing på **+777,5 kNOK** i skolen for reståret.
* **Prognose Skole EOY:** **-638,5 kNOK** i gjenstående merforbruk.
* **Konsolidert Kommuneoverskudd:** **+5 805,7 kNOK**.
* **Vurdering (⚠️ Delvis godkjent):** Tiltaket er nødvendig, men strekker ikke til alene. Skolesektoren ender likevel året med et udekket underskudd på over 0,6 mill. kr.

### Scenario C: Kombinert Løsning (50 % kutt + Administrativ Omdisponering)
* **Beskrivelse:** Skolesektoren gjennomfører 50 % kutt i variable personalkostnader (+777,5 kNOK). Samtidig vedtar formannskapet/bystyret en administrativ omdisponering på **638,5 kNOK** fra Helse og Mestring til Oppvekst og Utdanning i forbindelse med 2. tertialrapport.
* **Prognose Skole EOY:** **Nøyaktig 0,0 kNOK (Fullstendig 0-balanse)**! 🟢
* **Prognose Helse EOY:** **+5 167,2 kNOK** i gjenværende mindreforbruk (solid buffer).
* **Konsolidert Kommuneoverskudd:** **+5 167,2 kNOK**.
* **Vurdering (🟢 ANBEFALES):** Den eneste løsningen som sikrer full økonomisk balanse for begge sektorer og opprettholder budsjettdisiplin uten oppsigelser eller tjenestekutt.

---

## 3. Matrise for Beslutningsstøtte (Bystyre / Formannskap)

Tabellen oppsummerer de tre scenariene og deres konsekvenser for kommuneregnskapet 2024:

| Handlingsalternativ | Tiltak i Skolesektor | Omdisponering fra Helse | Sluttresultat Skole | Sluttresultat Kommune Total | Anbefaling |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Scenario A** | Ingen endring (0 %) | 0 kr | -1 416,0 kNOK | +5 500,2 kNOK | ❌ Frarådes |
| **Scenario B** | 50 % kutt overtid/vikar | 0 kr | -638,5 kNOK | +5 805,7 kNOK | ⚠️ Delvis godkjent |
| **Scenario C** | 50 % kutt overtid/vikar | +638,5 kNOK | **0,0 kNOK** | **+5 167,2 kNOK** | **🟢 ANBEFALES** |

---

## 4. DAX-Formler for What-If Simulering i Power BI

I Power BI-modellen drives simuleringen av to interaktive glidebrytere (*What-If Parameters*):
1. **`'Kutt_Hoveddrivere_Pct'[Kutt_Hoveddrivere_Pct Value]`** (0 % til 100 %, standard 10 %)
2. **`'Omdisponering_Pct'[Omdisponering_Pct Value]`** (0 % til 100 %, standard 50 %)

Følgende DAX-måltall i tabell `_Måltall` beregner simuleringseffektene i sanntid:

```dax
// 1. Beregnet innsparing ved prosentvis kutt i hovedkostnadsdrivere
Simulert Kutt Hoveddrivere Kr = 
VAR KuttPct = 'Kutt_Hoveddrivere_Pct'[Kutt_Hoveddrivere_Pct Value]
VAR HoveddrivereBelop = 
    CALCULATE(
        [Sum Regnskap],
        dim_kostra_kontoplan[Kontokode_6Siffer] IN {"102000", "102013", "104000", "127040"}
    )
RETURN
    HoveddrivereBelop * KuttPct

// 2. Frigjort ramme ved omdisponering fra mindreforbrukssektorer
Simulert Frigjort Mindreforbruk Kr = 
VAR OmdispPct = 'Omdisponering_Pct'[Omdisponering_Pct Value]
VAR TotaltMindreforbruk = 
    CALCULATE(
        [Avvik Kr],
        FILTER(
            ALL(dim_ansvar),
            [Avvik Kr] > 0
        )
    )
RETURN
    TotaltMindreforbruk * OmdispPct

// 3. Totale kompenserende tiltak
Simulert Totale Tiltak Kr = 
[Simulert Kutt Hoveddrivere Kr] + [Simulert Frigjort Mindreforbruk Kr]

// 4. Simulert EOY Sluttavvik etter gjennomførte tiltak
Simulert EOY Avvik Etter Tiltak Kr = 
[EOY Estimert Avvik Kr] + [Simulert Totale Tiltak Kr]

// 5. Automatisk Statusindikator for Simuleringspanelet
Simulert EOY Status Indikator = 
VAR NyttAvvik = [Simulert EOY Avvik Etter Tiltak Kr]
RETURN
    SWITCH(
        TRUE(),
        NyttAvvik >= 0, "🟢 Balanse / Overskudd oppnådd (" & FORMAT(NyttAvvik, "+#,##0 kr") & ")",
        NyttAvvik >= -200000, "🟡 Nær 0-balanse (Gjenstående: " & FORMAT(NyttAvvik, "#,##0 kr") & ")",
        "🔴 Fortsatt underskudd (Gjenstående: " & FORMAT(NyttAvvik, "#,##0 kr") & ")"
    )
```

---
*Rapporten er tilknyttet: [06_Omdisponerings_og_Kuttsimuleringsrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/06_Omdisponerings_og_Kuttsimuleringsrapport.md) | Power BI side: `p06_scenario_simulering`.*
