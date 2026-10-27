# 🧮 03: Finansiell Logikk og DAX-Beregninger

Dette dokumentet definerer reglene for finansiell modellering, avviksberegninger og DAX-måltall i **KomKostra**.

---

## 1. Grunnleggende Finansielle Prinsipper

* **Måleenhet:** Alle økonomiske beløp skal presenteres i **tusen kroner (kNOK)** med én desimal (f.eks. `# ##0.0 "kNOK"` eller `# ##0.0`), med mindre annet eksplisitt er definert.
* **Avvikskonvensjon:**  
  $$\text{Avvik Kr} = \text{Budsjett} - \text{Regnskap}$$
  * **Negativt avvik ($< 0$):** Merforbruk / Kostnadsoverskridelse $\rightarrow$ Markeres med **Rød (🔴)** farge.
  * **Positivt avvik ($> 0$):** Mindreforbruk / Besparelse $\rightarrow$ Markeres med **Grønn (🟢)** farge eller nøytral gråtone.
* **Forbruksprosent:**  
  $$\text{Forbruk \%} = \frac{\text{Regnskap}}{\text{Budsjett}}$$

---

## 2. Struktur på Måltallstabellen (`_Måltall`)

Samtlige 78 måltall er sentralisert i TMDL-filen:  
[`pbi-rep-project.SemanticModel/definition/tables/_Måltall.tmdl`](file:///C:/Users/frank/Desktop/Kom%20-%20G/pbi-rep-project.SemanticModel/definition/tables/_M%C3%A5ltall.tmdl)

### A. Kjernemåltall (Core Measures)
```dax
Regnskap = SUM ( 'fact_data'[Regnskap] )

Budsjett = SUM ( 'fact_data'[Budsjett] )

Avvik Kr = [Budsjett] - [Regnskap]

Forbruk Pct = DIVIDE ( [Regnskap], [Budsjett], BLANK () )
```

### B. Tidsintelligens (Month-over-Month & Year-to-Date)
```dax
Regnskap MoM Kr = 
VAR _ForrigeMnd = CALCULATE ( [Regnskap], DATEADD ( 'dim_date'[Dato], -1, MONTH ) )
RETURN
    IF ( NOT ISBLANK ( _ForrigeMnd ) && NOT ISBLANK ( [Regnskap] ), [Regnskap] - _ForrigeMnd )

Regnskap YTD = 
TOTALYTD ( [Regnskap], 'dim_date'[Dato] )

Budsjett YTD = 
TOTALYTD ( [Budsjett], 'dim_date'[Dato] )

Avvik YTD Kr = [Budsjett YTD] - [Regnskap YTD]
```

### C. Glidende Gjennomsnitt & Utjevning (Moving Averages)
For å filtrere ut sesongsvingninger (f.eks. ferieavvikling i juli eller skolestart i august) benyttes 3-måneders glidende gjennomsnitt:
```dax
Regnskap 3M MA = 
AVERAGEX (
    DATESINPERIOD ( 'dim_date'[Dato], LASTDATE ( 'dim_date'[Dato] ), -3, MONTH ),
    [Regnskap]
)
```

### D. Tufte S-Kurver og Prognoser (EAC / ETC)
* **Akkumulert Faktisk (Actual Cumulative):** Viser realisert kostnadsutvikling fram til siste avsluttede måned.
* **Budsjettbane (Planned S-Curve):** Periodisert budsjett fram til desember.
* **EAC (Estimate at Completion):**  
  $$\text{EAC} = \text{Regnskap YTD} + \text{Gjenværende periodisert budsjett}$$

### E. What-If Scenario og Tiltakssimulering
Modellen inkluderer to uavhengige parameter-tabeller:
1. `Kutt_Hoveddrivere_Pct[Kutt_Hoveddrivere_Pct Value]` (0–100 % kutt i overtid og vikarer).
2. `Omdisponering_Pct[Omdisponering_Pct Value]` (0–100 % omdisponering av frie midler).

```dax
Simulert Regnskap = 
VAR _KuttPct = [Kutt_Hoveddrivere_Pct Value]
VAR _ErDriverKonto = SELECTEDVALUE ( 'dim_kostra_kontoplan'[Kontokode_6Siffer] ) IN { "102000", "102013", "102031", "104000", "127040" }
RETURN
    IF ( _ErDriverKonto, [Regnskap] * (1 - _KuttPct), [Regnskap] )
```

---

## 3. Dynamisk Ledelsesrapportering (Storytelling Measures)

For å støtte politisk og administrativ ledelse genereres narrative forklaringer automatisk via DAX:
* `[Story Executive Summary]`: Oppsummerer samlet avvik, største avvikssektor og anbefalt tiltaksretning.
* `[Story Avvikskommentar]`: Rangerer de 3 største overskridelsene i valgt måned og angir årsaksforklaring.
