# KOSTRA Rapportpakke – Komplett Dokumentasjon for Økonomistyring 2024

Dette er den komplette rapportpakken for **Kristiansand kommune / KOSTRA Chart of Accounts**, utarbeidet for kommunedirektøren, formannskapet, bystyret, kommunalsjefene og enhetslederne.

Rapportpakken inneholder 6 spesialiserte **Markdown-rapporter (.md)** som dekker hele spekteret fra overordnet politisk ledelsesrapportering til detaljerte sektorrapporter, månedsutvikling, KOSTRA-strukturanalyse og What-If simuleringsmodeller for kutt og omdisponering. 

Alle rapportene er 100 % synkronisert med Power BI-prosjektet [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip) og datamodellen i `_Måltall`.

---

## 📁 Innhold i Rapportpakken og Kobling til Power BI

| Rapportfil | Rapporttittel | Power BI Side & Mappe | Målgruppe | Hovedfokus |
| :--- | :--- | :--- | :--- | :--- |
| [01_Hovedrapport_Kommuneokonomi_2024.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/01_Hovedrapport_Kommuneokonomi_2024.md) | **Hovedrapport for Økonomi og Virksomhetsstyring 2024** | `p01_executive_summary`<br>*(01. Hovedrapport (Kommuneøkonomi 2024))* | Kommunedirektør, Formannskap, Bystyre | Konsolidert økonomisk status, samlet avvik (+3,67 mill. kr), overordnet risikobilde og strategiske anbefalinger. |
| [02_Sektorrapport_Oppvekst_og_Utdanning.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/02_Sektorrapport_Oppvekst_og_Utdanning.md) | **Sektorrapport: Oppvekst og Utdanning** | `p02_trend_og_tidsserie`<br>*(02. Sektor: Oppvekst og Utdanning)* | Kommunalsjef Oppvekst, Rektorer, Økonomirådgivere | Dypdykk i skolesektoren (`KomSkole`), funksjon 2020/2140/2210, årsaker til merforbruk på overtid og vikarer, 3-punkts tiltaksplan. |
| [03_Sektorrapport_Helse_og_Mestring.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/03_Sektorrapport_Helse_og_Mestring.md) | **Sektorrapport: Helse og Mestring / Bomiljø** | `p04_avvik_og_drivere`<br>*(03. Sektor: Helse og Mestring)* | Kommunalsjef Helse, Enhetsledere Omsorg/Sone | Dypdykk i omsorgssektoren (`Bomiljø`), analyse av mindreforbruk (+4,61 mill. kr) på fastlønn/pensjon pga. vakanser, vikarbyråkjøp og omdisponeringsrom. |
| [04_Manedlig_Avviks_og_Prognoserapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/04_Manedlig_Avviks_og_Prognoserapport.md) | **Månedlig Avviks- og Prognoserapport** | `p03_tufte_scurve_og_prognose`<br>*(04. Månedlig Avvik og Prognose)* | Økonomiavdelingen, Controllerteam | Periodisk utvikling (Jan–Aug 2024), S-kurver, 3M Moving Average, EOY Run-Rate prognoser (+5,5 mill. kr) og tidligvarslingstoleranser. |
| [05_KOSTRA_Struktur_og_Nokkeltallrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/05_KOSTRA_Struktur_og_Nokkeltallrapport.md) | **KOSTRA Struktur- og Nøkkeltallrapport** | `p05_pareto_og_korrelasjon`<br>*(05. KOSTRA Struktur og Nøkkeltall)* | Statlig rapportering, Økonomiplanteam | Kobling mellom statlig KOSTRA-funksjon/art og intern ansvarsstruktur, enhetskostnader, personellandeler og korrelasjonsanalyse. |
| [06_Omdisponerings_og_Kuttsimuleringsrapport.md](file:///c:/Users/frank/Desktop/Kom/full_md_rapporter/06_Omdisponerings_og_Kuttsimuleringsrapport.md) | **What-If Scenario- og Balanserapport** | `p06_scenario_simulering`<br>*(06. What-If Scenario og Balanse)* | Kommunedirektørens ledergruppe, Finansutvalg | Tre modellerte scenarier (A: Status Quo, B: 50% Kutt, C: Kutt + Omdisponering) for å oppnå 0-balanse ved årets slutt. |

---

## 📊 Nøkkeltallsammendrag per 31.08.2024

* **Konsolidert Kommuneøkonomi Totalt:**
  * **Budsjett YTD:** 35 191,7 kNOK (35,19 mill. kr)
  * **Regnskap YTD:** 31 524,9 kNOK (31,52 mill. kr)
  * **Netto Driftsavvik:** **+3 666,8 kNOK (+3,67 mill. kr Mindreforbruk / 89,58 % forbruk)** 🟢
* **Helse og Mestring (Ansvar Bomiljø):**
  * **Budsjett YTD:** 17 233,7 kNOK
  * **Regnskap YTD:** 12 622,9 kNOK
  * **Avvik (Budsjett - Regnskap):** **+4 610,8 kNOK (+26,75 % Mindreforbruk)** 🟢
* **Oppvekst og Utdanning (Ansvar KomSkole):**
  * **Budsjett YTD:** 17 958,0 kNOK
  * **Regnskap YTD:** 18 902,0 kNOK
  * **Avvik (Budsjett - Regnskap):** **-944,0 kNOK (-5,25 % Merforbruk)** 🔴

---

## 💡 Hovedkonklusjoner & Strategisk Retning

1. **Strukturell ubalanse mellom sektorer:** Skolesektoren har et reelt merforbruk på personalsiden drevet av faste lønninger (-1 414 kNOK), ubudsjetterte korttidsvikarer (-381 kNOK), ordinære vikarer (-272 kNOK) og overtid (-230 kNOK). Helse og omsorg har derimot et utilsiktet mindreforbruk på +4,61 mill. kr pga. vakanser på sykepleier- og vernepleierstillinger.
2. **Kompenserende tiltakspakke (Scenario C):** Gjennom et målrettet 50 % kutt i overtid og korttidsvikarer i skolesektoren (+777,5 kNOK i årsslutteffekt) kombinert med en formell administrativ omdisponering av **638,5 kNOK** fra Helse og Mestring, bringes skolesektoren i **nøyaktig 0-balanse (0,- kr i avvik)** ved årets slutt.
3. **Power BI Integrasjon:** Alle rapportene er fullt implementert i [pbi-rep-project.pbip](file:///c:/Users/frank/Desktop/Kom/pbi-rep-project.pbip), konfigurert i henhold til Edward Tuftes standarder for høy datablekk-faktor, og automatiseres via C#-skriptet [tabular_editor_dax_script.md](file:///c:/Users/frank/Desktop/Kom/tabular_editor_dax_script.md).

---
*Rapportpakken er generert for Kristiansand kommune – KOSTRA Chart of Accounts.*
