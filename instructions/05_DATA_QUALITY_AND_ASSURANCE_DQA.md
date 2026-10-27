# 🔍 05: Datakvalitet, Revisjon og DQA-Rutiner

Dette dokumentet beskriver revisjons- og kontrollmekanismene i **Data Quality & Assurance (DQA)** rapporten for **KomKostra**.

---

## 1. Hvorfor DQA er Kritisk i Kommunal Økonomistyring

Kommunal regnskapsrapportering til SSB (KOSTRA) og kontrollutvalget krever 100 % revisjonsspor og konsistens. Feil i nøkler eller uteglemte datafiler vil direkte forvrenge budsjettavvik og politiske beslutningsunderlag.

DQA-modulen i rapporten er strukturert i 4 kontrollområder:

```text
DQA Kontrollsystem
├── 1. Dekning & Kompletthet      -> Er alle måneder og sektorer innlest?
├── 2. Nøkkel- og Relasjonsavstemming -> Finnes det ukjente kontoer eller funksjoner?
├── 3. Fil- og Ingestion-kontroll  -> Er det duplikate filer eller uventede kilder?
└── 4. Anomali- og Konsistenskontroll -> Er det fortegnsfeil eller ekstreme hopp?
```

---

## 2. De 4 Kontrollsidene i DQA-Rapporten

### Side 1: Deknings- og Kompletthetsmatrise (Coverage Matrix)
* **Formål:** Sikre at hverken regnskap eller budsjett mangler for noen av sektorene eller månedene.
* **Oppsett:**
  * Rader: `dim_kostra_funksjon[Tjenesteomrade_Navn]` $\rightarrow$ `fact_data[Sektor]`
  * Kolonner: `dim_date[Ar_Maned]`
  * Verdi: `[QA Dekningsstatus Indikator]`
* **Tolkning:**
  * 🟢 **OK:** Både regnskap og budsjett er til stede.
  * 🟡 **Kun Regnskap:** Budsjett mangler (kan indikere ufordelt ramme).
  * 🔵 **Kun Budsjett:** Regnskap mangler (kan indikere manglende månedspostering).
  * 🔴 **Mangler Data:** Hverken regnskap eller budsjett funnet.

### Side 2: Integritets- og Nøkkelavstemming (Orphan Keys)
* **Formål:** Avdekke posteringer som ikke lar seg koble til standard kontoplan eller funksjonsstruktur.
* **Nøkkelmåltall:**
  * `[QA Umappede Kontokoder Antall]`
  * `[QA Umappede Funksjoner Antall]`
  * `[QA Umappede Ansvar Antall]`
* **Terskel:** Skal alltid være **`0`**. Hvis verdien er $>0$, må dimensjonstabellen oppdateres umiddelbart.

### Side 3: Fil- og Ingestion-kontroll (Metadata Ingestion)
* **Formål:** Sporbarhet fra råfil til rapport.
* **Felter:** `fact_data[Source.Name]`, innlesingstidspunkt, radantall per fil og filnavnsvalidering (format: `YYYY_MM_fact_<sektor>.csv`).

### Side 4: Konsistens- og Avvikssjekk (Outliers & Anomalies)
* **Formål:** Fange opp feilposteringer, som f.eks.:
  * Negative regnskapsbeløp der det forventes utgift (bortsett fra refusjoner under art 1690/1700).
  * Drastiske månedsendringer (>300 % MoM-økning uten budsjettendring).
  * Ubudsjetterte poster i KOSTRA-funksjoner som ikke tilhører sektorens kjerneoppgaver.

---

## 3. Revisjonsavstemming mot SSB KOSTRA-Forskriften

Ved årsoppgjør og tertialrapportering skal tallene avstemmes mot:
1. **SSB KOSTRA Kontoplan:** Følg retningslinjene i [`docs/references/veileder-til-kontoplanen-i-kostra-for-2026.pdf`](file:///C:/Users/frank/Desktop/Kom%20-%20G/docs/references/).
2. **Budsjett- og regnskapsforskriften:** Kontroller at overføringer mellom drifts- og investeringsregnskap er eliminert fra driftsfaktatabellene.
3. **Internkontrollreglementet i Kristiansand kommune:** Sjekk at alle vesentlige avvik (> 100 kNOK på enkeltansvar) er ledsaget av forklarende kommentar i rapporten.
