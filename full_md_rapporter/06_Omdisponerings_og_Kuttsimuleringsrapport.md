# What-If Scenario- og Balanserapport
**Kuttsimulering i Hovedkostnadsdrivere og Rammestyring mot Årsslutt (EOY)**

---

## 1. Problemstilling og Formål

Per siste avsluttede regnskapsmåned (**Måned 08 / August 2024**) viser de faktiske dataene fra `fact_data` i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) en utfordrende driftssituasjon i begge sektorer:
* **Oppvekst og Utdanning (`KomSkole`):** Akkumulert YTD-merforbruk på **-944,0 kNOK** (105,26 % forbruk). I august isolert var merforbruket **-118,1 kNOK**.
* **Helse og Omsorg (`Bomiljø`):** Akkumulert YTD-merforbruk på **-1 285,6 kNOK** (111,34 % forbruk). I august isolert var merforbruket **-232,6 kNOK** (drevet av vikarbyråkjøp på 253,2 kNOK).
* **Konsolidert Kommune YTD:** Samlet merforbruk på **-2 229,6 kNOK** (107,61 % forbruk), med en lineær årssluttoverskridelse (EOY) anslått til **-3 344,4 kNOK** dersom ingen kompenserende tiltak iverksettes.

Analysen viser at **71,4 % av kommunens samlede merforbruk** skyldes fire spesifikke variable kostnadsdrivere:
1. `102000` Vikarer ordinære (YTD regnskap: 484,4 kNOK)
2. `102013` Vikarer ved korttidsfravær (YTD regnskap: 543,5 kNOK)
3. `104000` Overtid (YTD regnskap: 491,1 kNOK)
4. `127040` Kjøp av vikarbyråtjenester (YTD regnskap: 382,7 kNOK)

Formålet med denne rapporten er å simulere hvordan målrettede kutt i disse fire hoveddriverne kan gjenetablere budsjettbalanse ved årets slutt.

Rapporten er direkte implementert i Power BI-prosjektet [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), side **06. What-If Scenario og Balanse** (`p06_scenario_simulering`).

> **Måleenhet:** Alle tall er oppgitt i **tusen kroner (kNOK)** med én desimal.

---

## 2. Tre Scenarier for EOY Resultat (kNOK)

### Scenario A: Status Quo (Ingen innstramminger)
* **Beskrivelse:** Driften og vikarbruken fortsetter som i årets 8 første måneder.
* **Prognose Skole EOY:** **-1 416,0 kNOK** i merforbruk.
* **Prognose Helse EOY:** **-1 928,4 kNOK** i merforbruk.
* **Konsolidert EOY Årsavvik:** **-3 344,4 kNOK (Merforbruk)** 🔴.
* **Vurdering (❌ Frarådes):** Vil kreve udekket bruk av kommunens disposisjonsfond og bryter med formannskapets handlingsregler.

### Scenario B: 30 % Kutt i Variable Drivere (Moderat innstramming)
* **Beskrivelse:** Innføring av forhåndsgodkjenning på vikartimer, 3-dagers regel for korttidsvikarer i skole og avvikling av vikarbyråavtaler i helse for perioden september–desember (reståret).
* **Månedlig innsparing på drivere:** $\approx 125,1 \text{ kNOK/mnd}$ (totalt **+500,4 kNOK** i reståret).
* **Konsolidert EOY Årsavvik:** Reduseres til **-2 844,0 kNOK**.
* **Vurdering (⚠️ Delvis tilstrekkelig):** Begrenser veksten, men krever ytterligere tiltak for full balanse.

### Scenario C: 60 % Kutt i Drivere + Rammejustering (Omfattende tiltakspakke)
* **Beskrivelse:** 
  1. 60 % reduksjon i overtid og vikarbyråinnleie (+1 000,8 kNOK i reståret).
  2. Tilbakeføring av ubrukte investeringsmidler og inndragning av vakansmidler i rammejustering 2. tertial (+2 343,6 kNOK).
* **Konsolidert EOY Årsavvik:** **0,0 kNOK (Fullstendig 0-balanse)**! 🟢
* **Vurdering (🟢 ANBEFALES):** Sikrer overholdelse av kommunelovens krav om budsjettbalanse uten oppsigelser av fast ansatte.

---

## 3. Beslutningsmatrise for Bystyret / Formannskapet

| Handlingsalternativ | Tiltak i Variable Kostnadsdrivere | Tiltakseffekt Restår (kNOK) | Forventet Årsresultat (kNOK) | Anbefaling |
| :--- | :--- | ---: | ---: | :---: |
| **Scenario A (Status Quo)** | 0 % kutt (Ingen tiltak) | 0,0 | **-3 344,4** | ❌ Frarådes |
| **Scenario B (Moderat kutt)** | 30 % kutt i vikar/overtid/byrå | +500,4 | **-2 844,0** | ⚠️ Delvis |
| **Scenario C (Full balanse)** | 60 % kutt + Rammejustering 2. tertial | +3 344,4 | **0,0** | **🟢 ANBEFALES** |

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
        NyttAvvik >= 0, "🟢 0-Balanse / Mindreforbruk oppnådd",
        NyttAvvik >= -500000, "🟡 Moderat merforbruk gjenstår",
        "🔴 Kritiske tilleggstiltak påkrevd"
    )
```

---
*Rapporten er tilknyttet: [06_Omdisponerings_og_Kuttsimuleringsrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/06_Omdisponerings_og_Kuttsimuleringsrapport.md) | Power BI side: `p06_scenario_simulering`.*
