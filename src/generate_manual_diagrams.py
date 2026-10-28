"""
Generate crisp, publication-grade SVG/HTML architecture, workflow, data model, and ERD diagrams
rendered to high-DPI PNGs via Playwright for inclusion in KOM-G PDF manuals.
"""

import os
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIAGRAMS_DIR = os.path.join(ROOT_DIR, "docs", "assets", "diagrams")
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Common CSS & Styling adhering to Edward Tufte principles
# -----------------------------------------------------------------------------
BASE_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    -webkit-font-smoothing: antialiased;
}
.diagram-container {
    width: 1040px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin: 0 auto;
}
.diag-header {
    border-bottom: 2px solid #0f172a;
    padding-bottom: 12px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}
.diag-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
    text-transform: uppercase;
}
.diag-subtitle {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
}
.diag-badge {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #0284c7;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 12px 14px;
}
.card-header {
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.card-pill {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    background: #e2e8f0;
    color: #334155;
}
.pill-blue { background: #e0f2fe; color: #0369a1; }
.pill-amber { background: #fef3c7; color: #b45309; }
.pill-green { background: #dcfce7; color: #15803d; }
.pill-slate { background: #f1f5f9; color: #475569; }
"""

# -----------------------------------------------------------------------------
# 1. System Architecture Overview (4-Tier)
# -----------------------------------------------------------------------------
HTML_SYS_ARCH = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{BASE_CSS}
.layers-grid {{
    display: flex;
    flex-direction: column;
    gap: 16px;
}}
.layer-row {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0284c7;
    border-radius: 6px;
    padding: 12px 16px;
}}
.layer-row.layer-ai {{ border-left-color: #8b5cf6; }}
.layer-row.layer-olap {{ border-left-color: #059669; }}
.layer-row.layer-ext {{ border-left-color: #f59e0b; }}
.layer-label {{
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
}}
.items-row {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}}
.item-box {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 5px;
    padding: 10px;
}}
.item-box h4 {{
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
}}
.item-box p {{
    font-size: 9.5px;
    color: #64748b;
    line-height: 1.35;
}}
.item-box .tech-tag {{
    font-size: 8.5px;
    font-family: monospace;
    color: #0284c7;
    margin-top: 6px;
    display: inline-block;
    background: #f0f9ff;
    padding: 1px 4px;
    border-radius: 3px;
}}
.arrow-flow {{
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
    margin: -6px 0;
    font-weight: 700;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="diag-header">
        <div>
            <div class="diag-title">KOM-G Teknisk Systemarkitektur</div>
            <div class="diag-subtitle">Firelags lokal-først arkitektur: Presentasjon, Multi-LLM, DuckDB OLAP & Integrasjoner</div>
        </div>
        <div class="diag-badge">Lokal-Først | Edward Tufte Standard</div>
    </div>

    <div class="layers-grid">
        <!-- Layer 1 -->
        <div class="layer-row">
            <div class="layer-label">
                <span>1. Presentasjons- og Brukerlag (Web Cockpit & Frontends)</span>
                <span class="card-pill pill-blue">Zero-Framework / ES2022</span>
            </div>
            <div class="items-row">
                <div class="item-box">
                    <h4>Executive Web Cockpit</h4>
                    <p>KPI Grid, Slicere, sanntids avviksoversikt og status M01–M08.</p>
                    <span class="tech-tag">index.html (Semantic HTML5)</span>
                </div>
                <div class="item-box">
                    <h4>Tufte S-Kurve Studio</h4>
                    <p>Dynamisk SVG, direkte kurvemerking, Financial Times 01–10 charts.</p>
                    <span class="tech-tag">assets/js/dashboard.js</span>
                </div>
                <div class="item-box">
                    <h4>What-If Simulator</h4>
                    <p>Live simulering av vikarbyråkutt, fastlønn og rekruttering mot EAC.</p>
                    <span class="tech-tag">Client-side calc engine</span>
                </div>
                <div class="item-box">
                    <h4>Streamlit AI Workbench</h4>
                    <p>Interaktiv analytisk flate, KOSTRA-grafer og RAG-saksbehandling.</p>
                    <span class="tech-tag">src/app.py (Port 8501)</span>
                </div>
            </div>
        </div>

        <div class="arrow-flow">▼ Klientside DOM-hendelser, Tilstand & Kontekstinjeksjon ▼</div>

        <!-- Layer 2 -->
        <div class="layer-row layer-ai">
            <div class="layer-label">
                <span>2. Multi-LLM Integrasjonslag & Klientside Sikkerhet</span>
                <span class="card-pill" style="background:#ede9fe; color:#6d28d9;">Hybrid Cloud / Local AI</span>
            </div>
            <div class="items-row">
                <div class="item-box">
                    <h4>AI Konfigurasjonsmotor</h4>
                    <p>Dropdown for leverandørvalg, modell og lokal Base-URL.</p>
                    <span class="tech-tag">localStorage (kostra_ai_settings)</span>
                </div>
                <div class="item-box">
                    <h4>Sky-LLM REST Dispatcher</h4>
                    <p>Direkte API-kall: Gemini 2.5, OpenAI GPT-4o, Claude 3.5, Groq, Mistral.</p>
                    <span class="tech-tag">REST v1beta / completions</span>
                </div>
                <div class="item-box">
                    <h4>Ollama Lokal Inferens</h4>
                    <p>100 % lokal prosessering. Ingen nettverkstrafikk eller datalekkasje.</p>
                    <span class="tech-tag">http://localhost:11434</span>
                </div>
                <div class="item-box">
                    <h4>Innebygd Regelmotor</h4>
                    <p>Deterministisk fallback ved manglende API-nøkkel eller offline-modus.</p>
                    <span class="tech-tag">Rule-based Controller Logic</span>
                </div>
            </div>
        </div>

        <div class="arrow-flow">▼ SQL-spørringer, Analytiske Aggregeringer & Feature-uttrekk ▼</div>

        <!-- Layer 3 -->
        <div class="layer-row layer-olap">
            <div class="layer-label">
                <span>3. Analytisk Datalag & Maskinlæring (OLAP Engine)</span>
                <span class="card-pill pill-green">DuckDB In-Process / Parquet</span>
            </div>
            <div class="items-row">
                <div class="item-box">
                    <h4>DuckDB OLAP Database</h4>
                    <p>827 transaksjonsrader, stjerneskjema og sub-millisekund spørretid.</p>
                    <span class="tech-tag">data/database/kostra.duckdb</span>
                </div>
                <div class="item-box">
                    <h4>Analytiske SQL Views</h4>
                    <p><code>vw_kpi_summary</code>, <code>vw_monthly_scurve</code>, <code>vw_top_drivers</code>.</p>
                    <span class="tech-tag">DuckDB SQL Window Functions</span>
                </div>
                <div class="item-box">
                    <h4>Random Forest ML Pipeline</h4>
                    <p>Månedlig tidsserieprognose (Test R²=0.966, MAE=4.3 kNOK).</p>
                    <span class="tech-tag">models/kostra_forecast_latest.pkl</span>
                </div>
                <div class="item-box">
                    <h4>MLflow Model Registry</h4>
                    <p>Overvåking av model drift (&gt;20 % MAE avvik) og metriker.</p>
                    <span class="tech-tag">http://localhost:5000</span>
                </div>
            </div>
        </div>

        <div class="arrow-flow">▼ Eksport, Rapportering & Samhandling ▼</div>

        <!-- Layer 4 -->
        <div class="layer-row layer-ext">
            <div class="layer-label">
                <span>4. Eksterne Grensesnitt, BI og Arkivintegrasjon</span>
                <span class="card-pill pill-amber">SSB KOSTRA / Power BI TMDL</span>
            </div>
            <div class="items-row">
                <div class="item-box">
                    <h4>Power BI PBIP Prosjekt</h4>
                    <p>25 rapportsider, 78 DAX-måltall i ren tekst TMDL/PBIR format.</p>
                    <span class="tech-tag">pbi-rep-project.pbip</span>
                </div>
                <div class="item-box">
                    <h4>Excel Pivot Analyse</h4>
                    <p>Ferdigstrukturert datagrunnlag for controllere og enhetsledere.</p>
                    <span class="tech-tag">data/excel_ml_input.xlsx</span>
                </div>
                <div class="item-box">
                    <h4>SSB KOSTRA & Agresso</h4>
                    <p>Nasjonal kontoplan, 4-sifrede funksjoner og regnskapsavstemming.</p>
                    <span class="tech-tag">KOSTRA 2024 / Agresso ERP</span>
                </div>
                <div class="item-box">
                    <h4>Public 360 / eInnsyn</h4>
                    <p>Automatisert PDF-notatgenerering for formannskap og revisjon.</p>
                    <span class="tech-tag">ISO PDF/A Dokumenter</span>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

# -----------------------------------------------------------------------------
# 2. Controller Workflow & Monthly Governance Cycle
# -----------------------------------------------------------------------------
HTML_WORKFLOW = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{BASE_CSS}
.workflow-row {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    position: relative;
}}
.step-card {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-top: 4px solid #0f172a;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}}
.step-card.step-1 {{ border-top-color: #0284c7; }}
.step-card.step-2 {{ border-top-color: #059669; }}
.step-card.step-3 {{ border-top-color: #dc2626; }}
.step-card.step-4 {{ border-top-color: #d97706; }}
.step-card.step-5 {{ border-top-color: #8b5cf6; }}
.step-num {{
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}}
.step-title {{
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.25;
}}
.step-desc {{
    font-size: 9.5px;
    color: #475569;
    line-height: 1.4;
    margin-bottom: 10px;
}}
.step-deliverable {{
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 8.5px;
    color: #1e293b;
}}
.step-deliverable strong {{
    display: block;
    color: #0f172a;
    font-size: 9px;
    margin-bottom: 2px;
}}
.footer-note {{
    margin-top: 18px;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #475569;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="diag-header">
        <div>
            <div class="diag-title">Operativ Controller-Workflow & Månedssyklus</div>
            <div class="diag-subtitle">Femtrinns styringsprosess: Fra regnskapsavslutning til What-If tiltak og formannskapsrapportering</div>
        </div>
        <div class="diag-badge">M01–M12 Forvaltningssyklus</div>
    </div>

    <div class="workflow-row">
        <!-- Step 1 -->
        <div class="step-card step-1">
            <div>
                <div class="step-num">Fase 1 · Dag 1–3</div>
                <div class="step-title">Inndata & Avstemming</div>
                <div class="step-desc">
                    Månedsregnskap eksporteres fra Agresso/Unit4. Filer leases inn i DuckDB. Kontroll mot SSB KOSTRA kontoplan.
                </div>
            </div>
            <div class="step-deliverable">
                <strong>Leveranse:</strong>
                <code>fact_data</code> (827 rader)<br>0 avstemmingsdifferanser
            </div>
        </div>

        <!-- Step 2 -->
        <div class="step-card step-2">
            <div>
                <div class="step-num">Fase 2 · Dag 4–5</div>
                <div class="step-title">DuckDB Aggregering</div>
                <div class="step-desc">
                    Generering av Tufte S-kurve, 3M glidende snitt og avviksberegning YTD fordelt på ansvarsområder og KOSTRA-funksjon.
                </div>
            </div>
            <div class="step-deliverable">
                <strong>Leveranse:</strong>
                <code>vw_monthly_scurve</code><br>Avvik Jan–Aug: -2 229,6 k
            </div>
        </div>

        <!-- Step 3 -->
        <div class="step-card step-3">
            <div>
                <div class="step-num">Fase 3 · Dag 6–7</div>
                <div class="step-title">Avviksdeteksjon & Triage</div>
                <div class="step-desc">
                    Tidligvarselpanelet flagger avvik over 5 %. Automatisk isolering av Art 127040 (vikarbyrå) og Art 101000 (fastlønn).
                </div>
            </div>
            <div class="step-deliverable">
                <strong>Leveranse:</strong>
                Røde/Gule risikovarsler<br>Tiltaksforslag per funksjon
            </div>
        </div>

        <!-- Step 4 -->
        <div class="step-card step-4">
            <div>
                <div class="step-num">Fase 4 · Dag 8–9</div>
                <div class="step-title">What-If Simulering</div>
                <div class="step-desc">
                    Controllere tester tiltak i simulatoren: 50 % vikarbyråkutt + ansettelsesstopp gir estimert innsparing på 1 127 kNOK.
                </div>
            </div>
            <div class="step-deliverable">
                <strong>Leveranse:</strong>
                Justert EAC 31.12<br>Dokumenterte tiltakskalkyler
            </div>
        </div>

        <!-- Step 5 -->
        <div class="step-card step-5">
            <div>
                <div class="step-num">Fase 5 · Dag 10</div>
                <div class="step-title">AI Rådgivning & Rapporter</div>
                <div class="step-desc">
                    Multi-LLM genererer saksutredning med lovhjemler. Automatisk kompilering av styringsnotater til Formannskapet.
                </div>
            </div>
            <div class="step-deliverable">
                <strong>Leveranse:</strong>
                Styringsnotat (PDF)<br>Loggført i <code>audit_log</code>
            </div>
        </div>
    </div>

    <div class="footer-note">
        <span><strong>Tidslinje:</strong> Syklusen gjentas månedlig ved tertial- og månedsslutt iht. Kommuneloven § 14-6.</span>
        <span><strong>Kommando:</strong> <code>.\\run.ps1 -All</code> kjører hele pipelinen autonomt.</span>
    </div>
</div>
</body>
</html>"""

# -----------------------------------------------------------------------------
# 3. Multi-LLM AI Routing & Privacy Architecture
# -----------------------------------------------------------------------------
HTML_AI_ROUTING = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{BASE_CSS}
.routing-grid {{
    display: grid;
    grid-template-columns: 280px 40px 1fr 40px 240px;
    align-items: center;
    gap: 0;
}}
.flow-col {{
    display: flex;
    flex-direction: column;
    gap: 10px;
}}
.flow-arrow {{
    text-align: center;
    font-size: 16px;
    color: #94a3b8;
    font-weight: 700;
}}
.node-card {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
}}
.node-card.primary {{
    border-left: 4px solid #0284c7;
}}
.node-card.secure {{
    border-left: 4px solid #059669;
    background: #f0fdf4;
}}
.node-card.cloud {{
    border-left: 4px solid #8b5cf6;
}}
.node-card.offline {{
    border-left: 4px solid #64748b;
}}
.node-card h4 {{
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
}}
.node-card p {{
    font-size: 9px;
    color: #64748b;
    line-height: 1.3;
}}
.node-card code {{
    font-size: 8.5px;
    background: #f1f5f9;
    padding: 1px 3px;
    border-radius: 2px;
    color: #0f172a;
}}
.privacy-banner {{
    margin-top: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    font-size: 9.5px;
}}
.privacy-item strong {{
    display: block;
    color: #0f172a;
    margin-bottom: 2px;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="diag-header">
        <div>
            <div class="diag-title">Multi-LLM Integrasjonsarkitektur & Personvern</div>
            <div class="diag-subtitle">Orkestrering mellom klientside, lokale språkmodeller og sikre sky-REST endepunkter</div>
        </div>
        <div class="diag-badge">Null Datalekkasje | GDPR & Forvaltningsloven</div>
    </div>

    <div class="routing-grid">
        <!-- Col 1: Input & Context -->
        <div class="flow-col">
            <div class="node-card primary">
                <h4>Brukerhenvendelse & Valg</h4>
                <p>Spørsmål i chat-widget eller klikk på "AI Dypdykk" i avvikstabellen.</p>
                <code>dashboard.js : onSend()</code>
            </div>
            <div class="node-card primary">
                <h4>Kontekstgenerator (Syntese)</h4>
                <p>Bygger finansiell situasjonsrapport (M08 YTD, KOSTRA-avvik, lovhjemler).</p>
                <code>buildControllerContext()</code>
            </div>
            <div class="node-card primary">
                <h4>Sikkerhetssanitering</h4>
                <p>Kun aggregerte kNOK-tall inkluderes. Null personopplysninger eller elevdata.</p>
                <code>PII-Free Sanitizer</code>
            </div>
        </div>

        <div class="flow-arrow">►</div>

        <!-- Col 3: Provider Router -->
        <div class="flow-col">
            <div class="node-card secure">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>Ollama (Lokal LLM)</h4>
                    <span class="card-pill pill-green">Anbefalt Forvaltning</span>
                </div>
                <p>100 % lokal prosessering på <code>http://localhost:11434/api/chat</code>. Ingen API-nøkkel påkrevd, null trafikk ut av maskinen.</p>
                <code>Llama 3, Mistral, Qwen</code>
            </div>
            <div class="node-card cloud">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>Sky-LLM REST Gateways</h4>
                    <span class="card-pill" style="background:#ede9fe; color:#6d28d9;">Klientside Nøkkel</span>
                </div>
                <p>Direkte HTTPS kall med brukerens egen API-nøkkel lagret i <code>localStorage</code>:</p>
                <p style="margin-top:2px;">• <b>Gemini:</b> GenerativeLanguage API v1beta<br>• <b>OpenAI/Groq/Mistral/DeepSeek:</b> OpenAI-kompatibel endpoint</p>
            </div>
            <div class="node-card offline">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>Innebygd Regelmotor (Offline)</h4>
                    <span class="card-pill pill-slate">Deterministisk</span>
                </div>
                <p>Automatisk fallback dersom nettverket er nede eller brukeren ikke har konfigurert nøkkel.</p>
            </div>
        </div>

        <div class="flow-arrow">►</div>

        <!-- Col 5: Output & Audit -->
        <div class="flow-col">
            <div class="node-card">
                <h4>Sanntids Strømming</h4>
                <p>Svaret vises direkte i chat-panelet med Markdown-tabeller og kulepunkter.</p>
                <code>renderMessage()</code>
            </div>
            <div class="node-card">
                <h4>Revisjonslogg i DuckDB</h4>
                <p>Loggføring av prompt, modell og tidspunkt for etterprøvbarhet.</p>
                <code>audit_log (SQL Tabell)</code>
            </div>
            <div class="node-card">
                <h4>Saksnotat Eksport</h4>
                <p>Overføring til formannskapsnotater og PDF-rapporter.</p>
                <code>generate_reports.py</code>
            </div>
        </div>
    </div>

    <div class="privacy-banner">
        <div class="privacy-item">
            <strong>1. Nøkkelbevaring i Nettleser</strong>
            API-nøkler forlater aldri brukerens egen maskin. De sendes kun kryptert direkte til valgt leverandør.
        </div>
        <div class="privacy-item">
            <strong>2. Konfidensiell Forvaltning</strong>
            Ved bruk av Ollama er løsningen fullstendig frakoblet internett – godkjent for sensitive analyser.
        </div>
        <div class="privacy-item">
            <strong>3. Revisjonsspor iht. Arkivloven</strong>
            Alle vurderinger som leder til økonomiske vedtak kan spores i databasens revisjonstabell.
        </div>
    </div>
</div>
</body>
</html>"""

# -----------------------------------------------------------------------------
# 4. Entity-Relationship Diagram (ERD) & Star Schema
# -----------------------------------------------------------------------------
HTML_ERD = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{BASE_CSS}
.erd-grid {{
    display: grid;
    grid-template-columns: 280px 1fr 280px;
    grid-template-rows: auto auto;
    gap: 16px;
    align-items: center;
}}
.erd-entity {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    overflow: hidden;
}}
.erd-entity.fact {{
    border: 2px solid #0f172a;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}}
.entity-header {{
    background: #f1f5f9;
    padding: 8px 12px;
    border-bottom: 1px solid #cbd5e1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}
.erd-entity.fact .entity-header {{
    background: #0f172a;
    color: #ffffff;
    border-bottom: none;
}}
.entity-title {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.erd-entity.fact .entity-title {{ color: #ffffff; }}
.entity-rows {{
    padding: 6px 0;
}}
.field-row {{
    display: grid;
    grid-template-columns: 36px 1fr 90px;
    padding: 3px 12px;
    font-size: 9px;
    align-items: center;
    border-bottom: 1px solid #f8fafc;
}}
.field-row:last-child {{ border-bottom: none; }}
.key-badge {{
    font-size: 8px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 2px;
    text-align: center;
    display: inline-block;
}}
.pk {{ background: #fef3c7; color: #b45309; }}
.fk {{ background: #e0f2fe; color: #0369a1; }}
.fn {{ font-family: monospace; font-weight: 600; color: #1e293b; }}
.ft {{ font-family: monospace; color: #64748b; font-size: 8px; text-align: right; }}

.center-col {{
    grid-column: 2;
    grid-row: 1 / span 2;
    padding: 0 10px;
}}
.rel-tag {{
    display: inline-block;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    font-size: 8.5px;
    font-weight: 600;
    color: #475569;
    padding: 2px 6px;
    border-radius: 3px;
    margin-bottom: 4px;
}}
.erd-legend {{
    margin-top: 16px;
    padding: 10px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 9.5px;
    color: #475569;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="diag-header">
        <div>
            <div class="diag-title">KOM-G Datamodell & Stjerneskjema (ERD)</div>
            <div class="diag-subtitle">Relasjonsmodell mellom sentral faktatabell (fact_data) og KOSTRA-dimensjoner med kardinalitet 1:N</div>
        </div>
        <div class="diag-badge">SSB KOSTRA 2024 / Star Schema</div>
    </div>

    <div class="erd-grid">
        <!-- Left Top: dim_ansvar -->
        <div class="erd-entity">
            <div class="entity-header">
                <span class="entity-title">dim_ansvar</span>
                <span class="card-pill pill-blue">1 : N (PK)</span>
            </div>
            <div class="entity-rows">
                <div class="field-row"><span class="key-badge pk">PK</span><span class="fn">Ansvar_Kode</span><span class="ft">VARCHAR(16)</span></div>
                <div class="field-row"><span></span><span class="fn">Ansvar_Navn</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">Sektor</span><span class="ft">VARCHAR(32)</span></div>
                <div class="field-row"><span></span><span class="fn">Enhetsleder</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">Org_Nivaa</span><span class="ft">INTEGER</span></div>
            </div>
        </div>

        <!-- Center: fact_data -->
        <div class="center-col">
            <div class="erd-entity fact">
                <div class="entity-header">
                    <div>
                        <div class="entity-title">fact_data (Faktatabell)</div>
                        <div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">827 rader · Periodisert regnskap & budsjett 2024</div>
                    </div>
                    <span class="card-pill pill-amber" style="background:#b45309; color:#fff;">Sentral Faktatabell</span>
                </div>
                <div class="entity-rows">
                    <div class="field-row"><span class="key-badge pk">PK</span><span class="fn">TransaksjonsID</span><span class="ft">VARCHAR(32)</span></div>
                    <div class="field-row"><span class="key-badge fk">FK</span><span class="fn">Dato</span><span class="ft">DATE</span></div>
                    <div class="field-row"><span></span><span class="fn">Maaned_Nr</span><span class="ft">INTEGER</span></div>
                    <div class="field-row"><span></span><span class="fn">Aar</span><span class="ft">INTEGER</span></div>
                    <div class="field-row"><span class="key-badge fk">FK</span><span class="fn">Ansvar_Kode</span><span class="ft">VARCHAR(16)</span></div>
                    <div class="field-row"><span class="key-badge fk">FK</span><span class="fn">KOSTRA_Funksjon</span><span class="ft">VARCHAR(8)</span></div>
                    <div class="field-row"><span class="key-badge fk">FK</span><span class="fn">Kontokode_6Siffer</span><span class="ft">VARCHAR(16)</span></div>
                    <div class="field-row"><span></span><span class="fn">Budsjett_Kr</span><span class="ft">DOUBLE</span></div>
                    <div class="field-row"><span></span><span class="fn">Regnskap_Kr</span><span class="ft">DOUBLE</span></div>
                    <div class="field-row"><span></span><span class="fn">Avvik_Kr</span><span class="ft">DOUBLE</span></div>
                    <div class="field-row"><span></span><span class="fn">Kommentar</span><span class="ft">VARCHAR(255)</span></div>
                </div>
            </div>
        </div>

        <!-- Right Top: dim_kostra_funksjon -->
        <div class="erd-entity">
            <div class="entity-header">
                <span class="entity-title">dim_kostra_funksjon</span>
                <span class="card-pill pill-blue">1 : N (PK)</span>
            </div>
            <div class="entity-rows">
                <div class="field-row"><span class="key-badge pk">PK</span><span class="fn">Funksjon_Kode</span><span class="ft">VARCHAR(8)</span></div>
                <div class="field-row"><span></span><span class="fn">Funksjon_Navn</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">Tjenestegruppe</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">Lovhjemmel</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">SSB_Krav</span><span class="ft">VARCHAR(16)</span></div>
            </div>
        </div>

        <!-- Left Bottom: dim_date -->
        <div class="erd-entity">
            <div class="entity-header">
                <span class="entity-title">dim_date (Kalender)</span>
                <span class="card-pill pill-blue">1 : N (PK)</span>
            </div>
            <div class="entity-rows">
                <div class="field-row"><span class="key-badge pk">PK</span><span class="fn">Dato</span><span class="ft">DATE</span></div>
                <div class="field-row"><span></span><span class="fn">Aar</span><span class="ft">INTEGER</span></div>
                <div class="field-row"><span></span><span class="fn">Maaned_Nr</span><span class="ft">INTEGER</span></div>
                <div class="field-row"><span></span><span class="fn">Maaned_Navn</span><span class="ft">VARCHAR(16)</span></div>
                <div class="field-row"><span></span><span class="fn">Kvartal</span><span class="ft">VARCHAR(4)</span></div>
                <div class="field-row"><span></span><span class="fn">Tertial</span><span class="ft">VARCHAR(4)</span></div>
            </div>
        </div>

        <!-- Right Bottom: dim_kostra_kontoplan -->
        <div class="erd-entity">
            <div class="entity-header">
                <span class="entity-title">dim_kostra_kontoplan</span>
                <span class="card-pill pill-blue">1 : N (PK)</span>
            </div>
            <div class="entity-rows">
                <div class="field-row"><span class="key-badge pk">PK</span><span class="fn">Kontokode_6Siffer</span><span class="ft">VARCHAR(16)</span></div>
                <div class="field-row"><span></span><span class="fn">Kontonavn</span><span class="ft">VARCHAR(64)</span></div>
                <div class="field-row"><span></span><span class="fn">Hovedart</span><span class="ft">VARCHAR(32)</span></div>
                <div class="field-row"><span></span><span class="fn">Gruppe</span><span class="ft">VARCHAR(32)</span></div>
                <div class="field-row"><span></span><span class="fn">Kostnadstype</span><span class="ft">VARCHAR(32)</span></div>
            </div>
        </div>
    </div>

    <div class="erd-legend">
        <span><strong>Kardinalitet:</strong> Alle dimensjoner har <code>1:N</code> relasjon mot <code>fact_data</code> (én oppføring i dimensjon knyttes til mange faktaposter).</span>
        <span><strong>Integritet:</strong> Referensiell integritet håndheves ved databaseopprettelse i <code>src/db_manager.py</code>.</span>
    </div>
</div>
</body>
</html>"""

# -----------------------------------------------------------------------------
# 5. Data Lineage & Pipeline Architecture (Bronze -> Silver -> Gold)
# -----------------------------------------------------------------------------
HTML_LINEAGE = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{BASE_CSS}
.lineage-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    align-items: stretch;
}}
.pipeline-stage {{
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
}}
.stage-header {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 2px solid #0f172a;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}
.stage-1 .stage-header {{ border-bottom-color: #64748b; }}
.stage-2 .stage-header {{ border-bottom-color: #b45309; }}
.stage-3 .stage-header {{ border-bottom-color: #0369a1; }}
.stage-4 .stage-header {{ border-bottom-color: #059669; }}

.stage-items {{
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}}
.stage-box {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 8px 10px;
}}
.stage-box h5 {{
    font-size: 10px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
}}
.stage-box p {{
    font-size: 8.5px;
    color: #64748b;
    line-height: 1.3;
}}
.stage-meta {{
    margin-top: 10px;
    font-size: 8.5px;
    color: #475569;
    border-top: 1px dashed #cbd5e1;
    padding-top: 6px;
}}
</style>
</head>
<body>
<div class="diagram-container">
    <div class="diag-header">
        <div>
            <div class="diag-title">Datalinje & ETL Medallion Pipeline</div>
            <div class="diag-subtitle">Strukturert dataflyt fra rå kildedata via validering til analytisk gullag og BI-grensesnitt</div>
        </div>
        <div class="diag-badge">Data Lineage | DuckDB & PBIP</div>
    </div>

    <div class="lineage-grid">
        <!-- Stage 1 -->
        <div class="pipeline-stage stage-1">
            <div class="stage-header">
                <span>1. Kildedata (Raw)</span>
                <span class="card-pill pill-slate">ERP / SSB</span>
            </div>
            <div class="stage-items">
                <div class="stage-box">
                    <h5>Agresso / Unit4 ERP</h5>
                    <p>Månedlig rå-hovedbokseksporter for Kristiansand kommune.</p>
                </div>
                <div class="stage-box">
                    <h5>SSB KOSTRA Tabeller</h5>
                    <p>Nasjonal kontoplan, 4-sifrede funksjoner og kommunegruppe 13.</p>
                </div>
                <div class="stage-box">
                    <h5>Framsikt Økonomiplan</h5>
                    <p>Periodiserte budsjettrammer og tertialmål.</p>
                </div>
            </div>
            <div class="stage-meta">
                <strong>Format:</strong> CSV, REST JSON, flatfiler
            </div>
        </div>

        <!-- Stage 2 -->
        <div class="pipeline-stage stage-2">
            <div class="stage-header">
                <span>2. Bronze Lag (Staging)</span>
                <span class="card-pill pill-amber">Mottak</span>
            </div>
            <div class="stage-items">
                <div class="stage-box">
                    <h5>powerbi_kostra_datamodell/</h5>
                    <p>Staging-filer: <code>fact_data.csv</code>, <code>dim_ansvar.csv</code>, <code>dim_funksjon.csv</code>.</p>
                </div>
                <div class="stage-box">
                    <h5>Mottaksvalidering</h5>
                    <p>Sjekk av tegnsett (UTF-8), kolonnehoder og datatyper.</p>
                </div>
            </div>
            <div class="stage-meta">
                <strong>Lokasjon:</strong> Lokal stagingmappe
            </div>
        </div>

        <!-- Stage 3 -->
        <div class="pipeline-stage stage-3">
            <div class="stage-header">
                <span>3. Silver Lag (DuckDB)</span>
                <span class="card-pill pill-blue">Vasket & Avstemt</span>
            </div>
            <div class="stage-items">
                <div class="stage-box">
                    <h5>src/db_manager.py</h5>
                    <p>DuckDB schema-opprettelse, primærnøkler og referensiell integritet.</p>
                </div>
                <div class="stage-box">
                    <h5>DQA & Balansekontroll</h5>
                    <p>827 rader avstemmes krone for krone mot offisielt regnskap.</p>
                </div>
                <div class="stage-box">
                    <h5>Random Forest Trening</h5>
                    <p>Generering av tidsserieprediksjoner og MAE-driftanalyse.</p>
                </div>
            </div>
            <div class="stage-meta">
                <strong>Database:</strong> <code>kostra.duckdb</code>
            </div>
        </div>

        <!-- Stage 4 -->
        <div class="pipeline-stage stage-4">
            <div class="stage-header">
                <span>4. Gold Lag (Konsument)</span>
                <span class="card-pill pill-green">Analytisk Flate</span>
            </div>
            <div class="stage-items">
                <div class="stage-box">
                    <h5>Analytiske Views</h5>
                    <p><code>vw_kpi_summary</code>, <code>vw_monthly_scurve</code>, <code>vw_top_drivers</code>.</p>
                </div>
                <div class="stage-box">
                    <h5>Power BI TMDL Modell</h5>
                    <p>78 DAX-måltall for 25 rapportsider i PBIP format.</p>
                </div>
                <div class="stage-box">
                    <h5>Web Cockpit & AI Rådgiver</h5>
                    <p>Interaktivt styringsdashboard med Tufte S-kurve og live chat.</p>
                </div>
            </div>
            <div class="stage-meta">
                <strong>Forbrukere:</strong> Cockpit, Excel, Power BI
            </div>
        </div>
    </div>
</div>
</body>
</html>"""


def render_diagrams():
    configs = [
        ("arch_system_overview.html", "arch_system_overview.png", HTML_SYS_ARCH),
        ("arch_workflow_controller.html", "arch_workflow_controller.png", HTML_WORKFLOW),
        ("arch_ai_routing.html", "arch_ai_routing.png", HTML_AI_ROUTING),
        ("datamodel_erd_star_schema.html", "datamodel_erd_star_schema.png", HTML_ERD),
        ("datamodel_lineage_pipeline.html", "datamodel_lineage_pipeline.png", HTML_LINEAGE),
    ]

    print("Generating HTML diagram sources...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # device_scale_factor=2 yields sharp 2x retina output
        context = browser.new_context(viewport={"width": 1100, "height": 900}, device_scale_factor=2)
        page = context.new_page()

        for html_name, png_name, html_content in configs:
            html_path = os.path.join(DIAGRAMS_DIR, html_name)
            png_path = os.path.join(DIAGRAMS_DIR, png_name)

            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)

            page.goto(f"file:///{html_path.replace(os.sep, '/')}")
            page.wait_for_load_state("networkidle")

            container = page.locator(".diagram-container")
            container.screenshot(path=png_path)
            print(f"Rendered: {png_name} (2x scale)")

        browser.close()
    print("All diagrams successfully generated in docs/assets/diagrams/!")


if __name__ == "__main__":
    render_diagrams()
