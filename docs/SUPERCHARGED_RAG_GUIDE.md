# Supercharged RAG Architecture Guide 🚀

Dette dokumentet beskriver utvidelsen av **RAG-motoren (Retrieval-Augmented Generation)** for `localblob`-dokumentene i **Antigravity KOSTRA AI Workbench**.

---

## 🏗️ 1. Arkitektur for Hybrid & Paragrafbevisst RAG

```text
[ localblob PDF-er ] ──(Paragraf Chunking)──► [ Metadata Extractor ]
                                                      │
                                                      ▼
[ Bruker-spørring ] ──► [ Hybrid Search: BM25 + Vector RRF ] ──► [ Local Filter UI ]
                                                      │
                                                      ▼
                                       [ Gemini Flash Orchestrator ]
                                                      │
                                                      ▼
                                       [ DuckDB Immutable Audit Log ]
```

---

## 🔑 2. De 5 Superkreftene i den Utvidede RAG-motoren

### 1. Paragraf- og Kapittel-oppdeling (Paragraph-Aware Chunking)
I stedet for å kappe teksten midt i en lovtekst per 500 ord, deler `rag_engine.py` opp PDF-ene etter **juridiske paragrafgrenser (`§`)**, kapittelkoder og delmål.

### 2. Rike Kommunale Metadata
Hver tekstbit berikes automatisk med metadata:
* `dok_type`: Lov, Kommunal Strategi, Innkjøpsregelverk (DFØ) eller Rapporteringsforskrift (SSB).
* `paragraf`: Eksakt paragrafhenvisning (f.eks. `§ 16-1` eller `§ 25-1`).
* `kontokode`: KOSTRA kontokode (f.eks. `102013 Vikarutgifter`).
* `terskelverdi`: Finansielle beløpsgrenser (f.eks. `1 300 000 NOK`).

### 3. Hybrid Søk (BM25 + Reciprocal Rank Fusion)
Kombinerer semantisk vektorsøk med leksikalsk BM25-søk. Dette sikrer at eksakte kontokoder (`102013`), paragrafer (`§ 16-1`) og beløp fanges opp med **100 % presisjon**, uten at modeller "mister" tall i vektordimensjoner.

### 4. Kilde-filtrering i Streamlit UI
I sidepanelet i `app.py` kan saksbehandler velge å begrense RAG-søket til spesifikke dokumenttyper (f.eks. *Kun Kommuneloven* eller *Kun Anskaffelsesstrategien*).

### 5. Uforanderlig Audit-logging
Alle oppslag i `localblob` og tilhørende AI-genererte tiltaksplaner føres automatisk i DuckDB-tabellen `audit_log` med unike UUID-tidsstempler for innsynsrett og revisjon.

---

## ⚡ 3. Slik starter du den utvidede Workbench-en:

```powershell
# Kjører oppdatering og startet hele stacken
.\run.ps1 -All
```
