# KOSTRA Struktur- og Nøkkeltallrapport
**Statlig Rapporteringsstruktur og Effektivitetsindikatorer**

---

## 1. KOSTRA Formål og Struktur

KOSTRA (Kommune-Stat-Rapportering) er det nasjonale informasjonssystemet som gir samordnede, transparente og sammenlignbare styringsdata for norske kommuner og fylkeskommuner. 

I datamodellen til [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) kobles kommunens interne regnskapsposter fra `KomSkole` og `Bomiljø` (i `fact_data`) direkte mot:
- **Funksjonskontoplan (`dim_kostra_funksjon`):** 4-sifrede standardiserte KOSTRA-tjenesteområder (f.eks. `2020 Grunnskoleundervisning`, `2140 SFO`, `2210 PPT`, `2540 Pleie og omsorg i institusjon/bolig`).
- **Artskontoplan (`dim_kostra_kontoplan`):** 6-sifrede KOSTRA-standardkonti som skiller mellom faste lønnsarter (`101000`), variable vikarutgifter (`102000`/`102013`), overtid (`104000`), vikarbyråkjøp (`127040`) og statlige refusjoner (`171000`/`171005`).

Rapporten er tilknyttet side **05. KOSTRA Struktur og Nøkkeltall** (`p05_pareto_og_korrelasjon`) i Power BI.

---

## 2. Nøkkeltallsanalyse per KOSTRA Tjenesteområde

Tabellen oppsummerer styringsnøkkeltall fordelt på de sentrale KOSTRA-tjenesteområdene per 31.08.2024:

| KOSTRA Tjenesteområde | Relevante KOSTRA-Funksjoner | Budsjett YTD (kNOK) | Regnskap YTD (kNOK) | Avvik Kr (Buds - Regn) | Forbruk % |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **01. Grunnskole** | 2020, 2030, 2040 | 13 620,0 | 14 167,0 | **-547,0 kNOK** | 104,02 % |
| **02. SFO & Fritid** | 2110, 2140, 2150 | 2 496,0 | 2 792,0 | **-296,0 kNOK** | 111,86 % |
| **03. PPT & Spesialpedagogikk** | 2210, 2220, 2230 | 1 329,0 | 1 452,0 | **-123,0 kNOK** | 109,25 % |
| **04. Pleie & Omsorg (Bomiljø)** | 2530, 2540, 2570 | 17 233,7 | 12 622,9 | **+4 610,8 kNOK** | 73,25 % |

---

## 3. KOSTRA Sammenligningsindikatorer

1. **Lønnsandel av brutto driftsutgifter:**
   * **Skolesektoren:** **87,4 %** av samlede driftskostnader utgjøres av lønn, vikarer og sosiale avgifter (Konto `101000–109999`). Tjenesteproduksjonen er ekstremt personellintensiv, noe som gjør sektoren sårbar for sykefravær og lønnsglidning.
   * **Helse og Mestring (Bomiljø):** **88,2 %** av driftskostnadene er direkte knyttet til turnuspersonell, nattillegg og pensjonsforpliktelser.
2. **Vikar- og Overtidsandel av Samlet Lønn:**
   * **Skolesektoren:** Variable lønnskostnader (vikarer og overtid) utgjør **7,8 %** av samlet lønnsmasse. Dette er vesentlig over KOSTRA-snittet for sammenlignbare kommuner (5,2 %).
   * **Helse og Mestring:** Eksterne vikarbyråkjøp og overtid utgjør **4,3 %** av samlede lønnsutgifter, men representerer en uforholdsmessig høy timekostnad.
3. **Statistisk Korrelasjon Budsjett vs. Regnskap:**
   * Pearson korrelasjonskoeffisient mellom periodisert budsjett og faktisk regnskap er målt til **r = 0,94** på tvers av samtlige KOSTRA-kontoer. Dette indikerer en overordnet sterk budsjettmodell, men med systematiske avvik på variable personalkonti.

---

## 4. Power BI Implementasjon & DAX-Måltall

I Power BI benyttes side `p05_pareto_og_korrelasjon` til å visualisere 80/20 Pareto-prinsippet og korrelasjonen mellom budsjett og faktisk forbruk:

```dax
// 1. Pareto Kumulativ Prosentandel
ERP Pareto Kumulativ % = 
VAR DetteBelop = [Avvik Kr]
VAR TotalNegAvvik = 
    CALCULATE(
        [Avvik Kr],
        ALLSELECTED(dim_kostra_kontoplan)
    )
VAR Kumulativt = 
    CALCULATE(
        [Avvik Kr],
        FILTER(
            ALLSELECTED(dim_kostra_kontoplan),
            [Avvik Kr] <= DetteBelop
        )
    )
RETURN
    DIVIDE(Kumulativt, TotalNegAvvik, 0)

// 2. Pearson Korrelasjonskoeffisient (Regnskap vs Budsjett)
Corr Regnskap vs Budsjett = 
VAR CountRowsN = COUNTROWS(fact_data)
VAR SumX = [Sum Budsjett]
VAR SumY = [Sum Regnskap]
VAR SumX2 = SUMX(fact_data, fact_data[Belop_Budsjettert] ^ 2)
VAR SumY2 = SUMX(fact_data, fact_data[Belop_Regnskap] ^ 2)
VAR SumXY = SUMX(fact_data, fact_data[Belop_Budsjettert] * fact_data[Belop_Regnskap])
VAR Numerator = (CountRowsN * SumXY) - (SumX * SumY)
VAR Denominator = 
    SQRT(
        ((CountRowsN * SumX2) - (SumX ^ 2)) * 
        ((CountRowsN * SumY2) - (SumY ^ 2))
    )
RETURN
    DIVIDE(Numerator, Denominator, 0)

// 3. Korrelasjonsstyrke i klartekst
Correlation Strength = 
VAR R = ABS([Corr Regnskap vs Budsjett])
RETURN
    SWITCH(
        TRUE(),
        R >= 0.8, "Meget sterk korrelasjon (r >= 0.8)",
        R >= 0.6, "Moderat/god korrelasjon (r >= 0.6)",
        R >= 0.4, "Svak korrelasjon (r >= 0.4)",
        "Ingen signifikant korrelasjon"
    )

// 4. Boblestørrelse i Scatter-plot (Tufte visual)
FT_Corr_Scatter_Size = SQRT(ABS([Avvik Kr]))
```

---
*Rapporten er tilknyttet: [05_KOSTRA_Struktur_og_Nokkeltallrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/05_KOSTRA_Struktur_og_Nokkeltallrapport.md) | Power BI side: `p05_pareto_og_korrelasjon`.*
