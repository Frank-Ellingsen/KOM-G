# 04 - Antigravity: Tekstrapport & Datainnsikt fra KOSTRA-Kildedataene

Dette dokumentet gir en dyptgående finansiell analyse og tekstrapport for **Project Controller / Financial Controller**, basert på de faktiske kildedataene i `powerbi_kostra_datamodell/faktatabeller` (Januar–August 2024 for `KomSkole` og `Bomiljo`) tilpasset **`pbi-rep-project.pbip`**.

---

## 1. Hovedfunn og Årsresultat (Executive Financial Summary)

Basert på de sammenslåtte kildedataene for perioden 01.01.2024–31.08.2024 viser Kristiansand kommunes testdata følgende samlede status:

| Sektor / Område | Total Budsjett (kr) | Total Regnskap (kr) | Netto Avvik (Budsjett - Regnskap) | Status % |
|---|---:|---:|---:|---:|
| **Oppvekst og Utdanning (`KomSkole`)** | 17 958 000 | 18 902 000 | **-944 000** | -5,26 % (Merforbruk) |
| **Helse og Omsorg (`Bomiljo`)** | 11 337 237 | 12 622 851 | **-1 285 614** | -11,34 % (Merforbruk) |
| **Samlet Konsernstatus** | **29 295 237** | **31 524 851** | **-2 229 614** | **-7,61 % (Merforbruk)** |

> [!IMPORTANT]
> **Controller-kommentar:**
> Begge sektorer opplever merforbruk hittil i år. Hovedforklaringen er ikke generell prisstigning, men en kraftig forskyvning fra fastlønn til **ukontrollert vikarbruk og overtid**, samt forsinket føring/innkreving av statlige refusjoner.

---

## 2. Dypdykk i Oppvekst og Utdanning (`KomSkole`): Primære Kostnadsdrivere

Sektoren har et samlet akkumulert merforbruk på **-944 000 kr** (-5,26 %). Analysen av kontoplanen (`dim_kostra_kontoplan`) avdekker fire kritiske drivere:

### A. Primære Overforbrukskontoer i Skolesektoren
1. **Konto `101000` (Fastlønn / Ordinær lønn):**
   * **Budsjett:** 11 810 000 kr | **Regnskap:** 13 224 000 kr | **Avvik:** **-1 414 000 kr**
   * *Innsikt:* Hovedårsaken til avviket er høyere bemanningsfaktor enn forutsatt i tildelt ramme og eventuelt ikke-kompenserte lønnsoppgjør.
2. **Konto `102013` (Vikarer ved korttidsfravær):**
   * **Budsjett:** 101 000 kr | **Regnskap:** 482 000 kr | **Avvik:** **-381 000 kr** (377 % over budsjett!)
   * *Innsikt:* Ekstremt høyt korttidsfravær i grunnskolen som utløser innleie fra første sykedag.
3. **Konto `102000` (Vikarer):**
   * **Budsjett:** 0 kr | **Regnskap:** 272 000 kr | **Avvik:** **-272 000 kr** (100 % ubudsjettert)
   * *Innsikt:* Det er benyttet rammeavtaler på vikarer uten at det lå budsjettmidler på kontoen.
4. **Konto `104000` (Overtid):**
   * **Budsjett:** 19 000 kr | **Regnskap:** 249 000 kr | **Avvik:** **-230 000 kr** (1210 % over budsjett!)
   * *Innsikt:* Overtiden sprenger alle forutsetninger (over 12 ganger budsjett), ofte knyttet til tilsyn, SFO og akutte vikarbehov.
5. **Konto `142900` (Andre driftsutgifter):**
   * **Budsjett:** 0 kr | **Regnskap:** 262 000 kr | **Avvik:** **-262 000 kr** (Ubudsjettert materiellkjøp).

---

## 3. Dypdykk i Helse og Omsorg (`Bomiljo`): Kjøp av Tjenester & Refusjoner

Sektoren Helse & Omsorg har et samlet merforbruk på **-1 285 614 kr** (-11,34 %). Her er bildet preget av store vikarbyråkostnader, delvis motvirket av statlige refusjoner:

### A. Primære Kostnadsdrivere i Helse og Omsorg
1. **Konto `101000` (Fastlønn):**
   * **Budsjett:** 5 731 851 kr | **Regnskap:** 6 206 769 kr | **Avvik:** **-474 919 kr**
2. **Konto `127040` (Konsulenttjenester / Kjøp fra vikarbyrå):**
   * **Budsjett:** 0 kr | **Regnskap:** 382 656 kr | **Avvik:** **-382 656 kr** (100 % ubudsjettert kommersiell innleie)
   * *Innsikt:* Vanskeligheter med å rekruttere sykepleiere/fagarbeidere har tvunget fram kostbare byråløsninger.
3. **Konto `102031` (Vikarer):**
   * **Budsjett:** 0 kr | **Regnskap:** 259 304 kr | **Avvik:** **-259 304 kr**
4. **Konto `104000` (Overtid):**
   * **Budsjett:** 0 kr | **Regnskap:** 185 572 kr | **Avvik:** **-185 572 kr**

### B. Positivt Motregnede Poster (Refusjoner & Tilskudd)
1. **Konto `171005` (Refusjon sykepenger fra NAV):** 979 000 kr regnskapsført.
2. **Konto `171000` (Refusjoner fra staten):** 671 000 kr regnskapsført.
3. **Konto `172900` (Kompensasjon):** 266 000 kr regnskapsført.
4. **Konto `173000` (Refusjon fra fylkeskommuner):** 250 000 kr regnskapsført.

---

## 4. Omdisponerings- og Kuttstrategi for EOY Balanse (What-If Scenario)

For å sikre at Kristiansand kommune reduserer merforbruket mot årets slutt, implementeres en tre-trinns kontrollmodell:

### Trinn 1: Kutt-tiltak på Vikarer og Overtid (-50%)
* Innføre strengere godkjenningskrav for overtid (`104000`) og vikarbyrå/korttidsvikarer (`102013`, `102000`, `127040`).
* **Beregnet innsparing i Skolesektoren:** 
  * 50 % kutt på Vikarer (`102013` + `102000`: 754 000 kr * 0,50) = **+377 000 kr**
  * 50 % kutt på Overtid (`104000`: 249 000 kr * 0,50) = **+124 500 kr**
  * **Samlet tiltakseffekt Skole:** **+501 500 kr**.

### Trinn 2: Full innkreving av NAV-refusjoner
* Aktiv oppfølging av utestående sykelønnsrefusjoner (`171005`) knyttet til det høye sykefraværet i Oppvekst for å matche de 272 000 kr ført på konto `102000`.

### Trinn 3: Simulering i DAX (What-If)
Ved å kombinere tiltakene kan kommunen redusere merforbruket i skolesektoren fra **-944 000 kr** ned til ca. **-170 000 kr**, som enkelt håndteres innenfor konsernets samlede disposisjonsfond.

---

## 5. DAX-Måltall for Omdisponering og Kutt-Simulering

Disse måltallene ligger i display folder **`08. What-If Simulering`** i `_Måltall`:

```dax
// Simulert kutt på 50% av overtid og vikarkostnader
Simulert Kutt Hoveddrivere Kr = 
CALCULATE (
    [Merforbruk Kr] * 0.50,
    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { "102013", "102000", "104000" }
)

// Frigjøring av 20% fra underforbruk på fastlønn/pensjon
Simulert Frigjort Mindreforbruk Kr = 
CALCULATE (
    [Mindreforbruk Kr] * 0.20,
    'dim_kostra_kontoplan'[Kontokode_6Siffer] IN { "101000", "109000" }
)

// Netto simulert EOY-avvik etter tiltak
Simulert EOY Avvik Etter Tiltak Kr = 
[EOY Estimert Avvik Kr] + [Simulert Kutt Hoveddrivere Kr] + [Simulert Frigjort Mindreforbruk Kr]
```
