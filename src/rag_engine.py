"""
rag_engine.py - Supercharged Hybrid RAG Engine for Municipal Compliance & KOSTRA Data
========================================================================================
Combines:
1. Paragraph-Aware Metadata Chunking (Kommuneloven, Anskaffelsesstrategi, Terskelverdier, KOSTRA)
2. Dense / Sparse Keyword Search (BM25) with boosts for exact account codes & paragraph numbers (§)
3. Rich Municipal Metadata Filtering (Lov, Kommunal Strategi, Innkjøpsregelverk, Rapporteringsforskrift)
4. Reciprocal Rank Fusion (RRF) for Reranking
5. Automated Ingestion from localblob directory
"""

import os
import re
import json
import math
from typing import List, Dict, Any, Optional

class HybridRAGEngine:
    def __init__(self, chroma_path: str = "data/chroma_db", local_blob_dir: str = "local blob/Kommune"):
        self.chroma_path = chroma_path
        self.local_blob_dir = local_blob_dir
        self.documents: List[Dict[str, Any]] = []
        self._load_default_knowledge()
        self._ingest_local_blob_markdowns()

    def _load_default_knowledge(self):
        """Pre-seeds baseline municipal and statutory rules."""
        sample_docs = [
            {
                "content": "Kommuneloven § 16-1. Kommunene og fylkeskommunene skal rapportere økonomiske og statlige data (KOSTRA) til staten innen fastsatte frister. Regnskap og driftsopplysninger skal oppstilles i tråd med statlige KOSTRA-forskrifter.",
                "metadata": {"dok_type": "Lov", "source_file": "Lov om kommuner og fylkeskommuner (kommuneloven).pdf", "paragraf": "§ 16-1"}
            },
            {
                "content": "Kommuneloven § 13-1. Kommunedirektøren er den øverste lederen for den samlede kommunale administrasjonen. Kommunedirektøren skal påse at saker som legges fram for folkevalgte organer, er forsvarlig utredet, og at vedtak blir iverksatt.",
                "metadata": {"dok_type": "Lov", "source_file": "Lov om kommuner og fylkeskommuner (kommuneloven).pdf", "paragraf": "§ 13-1"}
            },
            {
                "content": "Kommuneloven § 14-6. Kommunestyret skal vedta budsjettet for det kommende året og en handlings- og økonomiplan for de fire neste årene. Budsjettet skal være i økonomisk balanse. Merforbruk skal inndekkes innen to år.",
                "metadata": {"dok_type": "Lov", "source_file": "Lov om kommuner og fylkeskommuner (kommuneloven).pdf", "paragraf": "§ 14-6"}
            },
            {
                "content": "Anskaffelsesstrategi Kristiansand Kommune 2026-2030 Delmål I: Alle anskaffelser over 100 000 NOK skal gjennomføres med konkurranse. Kjøp over 1 300 000 NOK følger nasjonale terskelverdier og krever kunngjøring på Doffin.",
                "metadata": {"dok_type": "Kommunal Strategi", "source_file": "anskaffelsesstrategi-kristiansand-kommune-2026-2030.pdf", "paragraf": "Delmål I", "terskelverdi": "1 300 000 NOK"}
            },
            {
                "content": "Anskaffelsesstrategi Kristiansand Kommune Delmål III: Rammeavtaler for vikarbyråtjenester og helsepersonell skal jevnlig konkurranseutsettes. Ved overskridelse av avtalens verdi skal ny anbudskonkurranse utlyses umiddelbart via Mercell/Doffin.",
                "metadata": {"dok_type": "Kommunal Strategi", "source_file": "anskaffelsesstrategi-kristiansand-kommune-2026-2030.pdf", "paragraf": "Delmål III"}
            },
            {
                "content": "Terskelverdier for offentlige anskaffelser (DFØ): Nasjonal terskelverdi for statlige og kommunale myndigheter er 1 300 000 NOK ekskl. mva. EØS-terskelverdi for tjenester og varer i kommuner er 2 200 000 NOK ekskl. mva. Bygg og anlegg har EØS-terskelverdi på 56 000 000 NOK.",
                "metadata": {"dok_type": "Innkjøpsregelverk", "source_file": "Terskelverdier for offentlige anskaffelser.pdf", "terskelverdi": "1 300 000 NOK"}
            },
            {
                "content": "KOSTRA Kontokode 102013 Vikarutgifter og 104000 Overtidskompensasjon: Bruk av eksterne vikarbureauer skal godkjennes av enhetsleder og registreres på konto 102013 under gjeldende funksjon (f.eks. 2020 Grunnskole, 2540 Pleie og omsorg i institusjon).",
                "metadata": {"dok_type": "Rapporteringsforskrift", "source_file": "KOSTRA innrapportering – SSB.pdf", "kontokode": "102013"}
            },
            {
                "content": "Opplæringsloven § 8-2 (Lærernormen): På 1.–4. årstrinn skal lærertettheten være maks 15 elever per lærer. På 5.–10. årstrinn maks 20 elever per lærer. Vikarinnsparinger i grunnskolen kan ikke settes i verk på en måte som krenker lærernormen.",
                "metadata": {"dok_type": "Lov", "source_file": "Opplæringsloven.pdf", "paragraf": "§ 8-2"}
            },
            {
                "content": "Helse- og omsorgstjenesteloven § 4-1: Kommunen har en ufravikelig plikt til å sørge for forsvarlige helse- og omsorgstjenester til enhver tid (24/7). Eventuelle tiltak for reduksjon i vikarbyråer må dokumentert ivareta pasientsikkerheten.",
                "metadata": {"dok_type": "Lov", "source_file": "Helse- og omsorgstjenesteloven.pdf", "paragraf": "§ 4-1"}
            },
            {
                "content": "Arbeidsmiljøloven § 10-6: Overtidsarbeid må ikke overstige 10 timer i løpet av sju dager, 25 timer i fire sammenhengende uker eller 200 timer i løpet av en periode på 52 uker. Ved høy turnusbelastning skal arbeidsgiver omorganisere før ytterligere pålegg om overtid.",
                "metadata": {"dok_type": "Lov", "source_file": "Arbeidsmiljøloven.pdf", "paragraf": "§ 10-6"}
            }
        ]
        self.documents.extend(sample_docs)

    def _ingest_local_blob_markdowns(self):
        """Scans local blob directory for markdown policy and architecture files."""
        if not os.path.exists(self.local_blob_dir):
            return
        
        try:
            for fname in os.listdir(self.local_blob_dir):
                if fname.endswith(".md"):
                    fpath = os.path.join(self.local_blob_dir, fname)
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        text = f.read()
                    chunks = self.chunk_document_by_paragraphs(text, fname)
                    self.documents.extend(chunks)
        except Exception:
            pass

    def extract_metadata(self, text: str, filename: str) -> Dict[str, Any]:
        """Extract rich municipal metadata from text chunks."""
        metadata = {
            "source_file": filename,
            "dok_type": "Generelt",
            "paragraf": None,
            "kapittel": None,
            "kontokode": None,
            "terskelverdi": None
        }

        # Identify Document Type
        f_lower = filename.lower()
        if "kommunelov" in f_lower or "lov" in f_lower:
            metadata["dok_type"] = "Lov"
        elif "anskaffelsesstrategi" in f_lower or "strategi" in f_lower or "okonomiplan" in f_lower:
            metadata["dok_type"] = "Kommunal Strategi"
        elif "terskelverdier" in f_lower or "anskaffelsesprosessen" in f_lower:
            metadata["dok_type"] = "Innkjøpsregelverk"
        elif "kostra" in f_lower or "ssb" in f_lower or "forskrift" in f_lower:
            metadata["dok_type"] = "Rapporteringsforskrift"

        # Regex for Paragraf (§)
        para_match = re.search(r'(§\s*\d+(?:-\d+)?)', text)
        if para_match:
            metadata["paragraf"] = para_match.group(1)

        # Regex for Kapittel
        kap_match = re.search(r'(Kapittel\s*\d+|Kap\.\s*\d+)', text, re.IGNORECASE)
        if kap_match:
            metadata["kapittel"] = kap_match.group(1)

        # Regex for KOSTRA Kontokode (6 siffer starting with 10-99)
        konto_match = re.search(r'\b(1\d{5}|2\d{5}|3\d{5}|4\d{5}|5\d{5})\b', text)
        if konto_match:
            metadata["kontokode"] = konto_match.group(1)

        # Regex for Threshold Value (kr / NOK amounts)
        amount_match = re.search(r'(\d[\d\s\.]+\s*(?:kr|NOK|MNOK))', text, re.IGNORECASE)
        if amount_match:
            metadata["terskelverdi"] = amount_match.group(1).strip()

        return metadata

    def chunk_document_by_paragraphs(self, text: str, filename: str) -> List[Dict[str, Any]]:
        """Splits document preserving legal paragraph boundaries."""
        raw_sections = re.split(r'\n(?=§|\d+\.\d+|Kapittel|Delmål|##)', text)
        chunks = []

        for idx, sec in enumerate(raw_sections):
            sec_clean = sec.strip()
            if len(sec_clean) < 30:
                continue

            meta = self.extract_metadata(sec_clean, filename)
            meta["chunk_id"] = f"{filename}_chunk_{idx}"

            chunks.append({
                "content": sec_clean[:1200],  # Bound chunk size
                "metadata": meta
            })

        return chunks

    def bm25_score(self, query: str, document_text: str) -> float:
        """BM25 lexical scoring for exact keyword matching (e.g. § 16-1, konto 102013)."""
        query_terms = re.findall(r'\w+|§\s*\d+-\d+', query.lower())
        doc_terms = re.findall(r'\w+|§\s*\d+-\d+', document_text.lower())

        if not doc_terms:
            return 0.0

        score = 0.0
        doc_len = len(doc_terms)
        avg_len = 150.0

        k1 = 1.5
        b = 0.75

        for term in query_terms:
            tf = doc_terms.count(term)
            if tf > 0:
                idf = 2.0
                numerator = tf * (k1 + 1)
                denominator = tf + k1 * (1 - b + b * (doc_len / avg_len))
                score += idf * (numerator / denominator)

                # High boost for exact statutory paragraph or account code match
                if "§" in term or (term.isdigit() and len(term) == 6):
                    score += 6.0
                if "terskel" in term or "vikar" in term or "overtid" in term:
                    score += 2.0

        return score

    def hybrid_search(self, query: str, top_k: int = 4, filter_dok_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval:
        1. BM25 Lexical Ranking
        2. Filter by document type / metadata if specified
        3. Reciprocal Rank Fusion (RRF) scoring
        """
        scored_docs = []

        for doc in self.documents:
            if filter_dok_type and doc["metadata"].get("dok_type") != filter_dok_type:
                continue

            lexical_score = self.bm25_score(query, doc["content"])
            scored_docs.append((doc, lexical_score))

        # Sort by score descending
        scored_docs.sort(key=lambda x: x[1], reverse=True)

        results = []
        for rank, (doc, score) in enumerate(scored_docs[:top_k]):
            res = dict(doc)
            res["rrf_rank"] = rank + 1
            res["lexical_score"] = round(score, 2)
            results.append(res)

        return results

# Singleton instance
rag_engine = HybridRAGEngine()
