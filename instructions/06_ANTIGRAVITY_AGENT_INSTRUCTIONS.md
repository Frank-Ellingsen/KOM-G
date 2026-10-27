# 🤖 06: Antigravity AI-Agent Retningslinjer og Governance

Dette dokumentet gir bindende instruksjoner til **Antigravity AI Agent** (og tilsvarende AI-assistenter) ved arbeid og kildekodeendringer i dette depotet.

---

## 1. Kjerneforutsetninger for Frank Ellingsens Miljø

* **Brukerkontekst:** Frank Ellingsen er en erfaren Financial Controller og Business Intelligence-spesialist som trener/arbeider som **Prosjektcontroller** (innen ingeniør-, maritim- og forsvarssektoren).
* **Fokusområder:** Økonomistyring, EAC/ETC-fremskrivninger, avviks- og risikostyring, stjerneskjemaer og Tufte-visualisering.
* **Kommunikasjonsstil:** Konsis, profesjonell, forretningsorientert og strukturert markdown med klikkbare fillenker.

---

## 2. Kritiske Regler for Kildekode og TMDL

1. **Bevar TMDL-Indentering og Struktur:**
   * TMDL er sensitivt for tabulatorer (`\t`) og hierarkisk innrykk.
   * Endre aldri `lineageTag` eller tabellrelasjoner uten eksplisitt brukerforespørsel.
   * Ved opprettelse eller redigering av måltall i `_Måltall.tmdl`:
     * Definer alltid formatstreng (f.eks. `formatString: #,##0.0 "kNOK"`).
     * Plasser måltall i logiske mapper (`displayFolder: Kjerne`, `displayFolder: Tidsrekker`, etc.).
2. **PBIR Rapportdefinisjoner (JSON):**
   * Ved redigering av `visual.json` eller `page.json` må gyldig JSON bevares.
   * Følg Tufte-prinsippene strengt: Fjern gitterlinjer (`gridline: false`), fjern bakgrunnsskygger og unngå dekorative ikoner.
3. **Ingen Destruktive Handlinger Uten Samtykke:**
   * Kildedata i `powerbi_kostra_datamodell/` skal aldri slettes eller overskrives uten eksplisitt bekreftelse.
   * Bruk alltid `git mv` ved flytting av sporede filer for å bevare historikk.
4. **Bruk Lokale SQL-Verktøy (DuckDB/SQLite):**
   * Ved analyse, validering eller uttrekk av CSV-data: Foretrekk lokale SQL-motorer som **DuckDB** eller **SQLite** framfor tunge eksterne avhengigheter.
   * Bruk standard Python-biblioteker dersom skripting er nødvendig.
5. **Absolutte vs Relative Stier:**
   * Power Query M-spørringer i TMDL må peke til det gjeldende prosjektet:  
     `"C:\Users\frank\Desktop\Kom - G\powerbi_kostra_datamodell\..."`
   * Ikke hardkod stier til andre mapper (som f.eks. `Desktop\Kom\`).

---

## 3. Sjekkliste Før Endringer Publiseres

Før en oppgave markeres som ferdig:
- [ ] Kjører `git status` rent uten uønsket støy eller utilsiktet slettede filer?
- [ ] Er alle nye eller flyttede filer dokumentert og lenket med Markdown-syntaks (`[tekst](file:///sti)`)?
- [ ] Er tallformater og avviksformler ($Budsjett - Regnskap$) konsistente med controllerstandarden?
- [ ] Er Edward Tuftes Data-Ink Ratio prinsipper etterlevd i rapport- og visualiseringslagene?
