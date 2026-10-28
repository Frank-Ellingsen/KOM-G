"""
KOM-G: Complete Publication-Grade PDF Documentation Generator
==============================================================
Generates 3 exhaustive, multi-page, Edward Tufte-compliant PDF manuals
in the repository root folder:
1. KOM-G_User_Guide.pdf
2. KOM-G_System_Manual_and_Architecture.pdf
3. KOM-G_Data_Model_and_Dictionary.pdf

Author: Frank Ellingsen (Project Controller & BI Specialist)
Municipality: Kristiansand kommune
Standard: Edward Tufte Data-Ink Ratio, SSB KOSTRA 2024, Kommuneloven §§ 13-1, 14-6
"""

import os
import sys

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Colors: Edward Tufte & Municipal Precision Palette
C_PRIMARY = colors.HexColor("#0f172a")     # Deep Slate Navy
C_SECONDARY = colors.HexColor("#1e3a8a")   # Municipal Royal Blue
C_ACCENT = colors.HexColor("#0284c7")      # Precision Cyan
C_TEXT = colors.HexColor("#1e293b")        # High-contrast body text
C_MUTED = colors.HexColor("#64748b")       # Secondary text
C_BORDER = colors.HexColor("#cbd5e1")      # Subtle grid/divider
C_BG_ALT = colors.HexColor("#f8fafc")      # Clean paper table bg
C_BG_CODE = colors.HexColor("#f1f5f9")     # Code box bg
C_CRITICAL = colors.HexColor("#dc2626")    # Variance / Risk
C_WARNING = colors.HexColor("#d97706")     # Amber alert
C_POSITIVE = colors.HexColor("#059669")    # Green saving
C_WHITE = colors.HexColor("#ffffff")


class TufteNumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas adding running header and precise 'Side X av Y' footer.
    """
    def __init__(self, *args, **kwargs):
        self.doc_title = kwargs.pop("doc_title", "KOM-G | Kristiansand Kommune")
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(C_MUTED)

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(1.8 * cm, A4[1] - 1.2 * cm, self.doc_title)
            self.drawRightString(A4[0] - 1.8 * cm, A4[1] - 1.2 * cm, "Kristiansand Kommune – KOSTRA 2024")
            self.setStrokeColor(C_BORDER)
            self.setLineWidth(0.5)
            self.line(1.8 * cm, A4[1] - 1.35 * cm, A4[0] - 1.8 * cm, A4[1] - 1.35 * cm)

        # Footer (all pages)
        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(1.8 * cm, 1.4 * cm, A4[0] - 1.8 * cm, 1.4 * cm)

        self.drawString(1.8 * cm, 0.95 * cm, "KOM-G Virksomhetsstyring & KOSTRA Cockpit | Frank Ellingsen")
        self.drawRightString(A4[0] - 1.8 * cm, 0.95 * cm, f"Side {self._pageNumber} av {page_count}")
        self.restoreState()


def make_canvas_factory(doc_title):
    def factory(*args, **kwargs):
        kwargs["doc_title"] = doc_title
        return TufteNumberedCanvas(*args, **kwargs)
    return factory


def get_tufte_stylesheet():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'DocBadge',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=C_ACCENT,
        leading=11,
        spaceAfter=4,
        textTransform='uppercase'
    ))
    styles.add(ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=19,
        textColor=C_PRIMARY,
        leading=23,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=10.5,
        textColor=C_MUTED,
        leading=14,
        spaceAfter=12
    ))
    styles.add(ParagraphStyle(
        'H1',
        fontName='Helvetica-Bold',
        fontSize=12.5,
        textColor=C_PRIMARY,
        leading=15.5,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'H2',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=C_SECONDARY,
        leading=13,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=8.3,
        textColor=C_TEXT,
        leading=11.8,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'BodyBold',
        fontName='Helvetica-Bold',
        fontSize=8.3,
        textColor=C_TEXT,
        leading=11.8,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'BulletItem',
        fontName='Helvetica',
        fontSize=8.3,
        textColor=C_TEXT,
        leading=11.8,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    ))
    styles.add(ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=7.6,
        textColor=colors.HexColor("#0f172a"),
        leading=10,
        leftIndent=6
    ))
    styles.add(ParagraphStyle(
        'TH',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        textColor=C_PRIMARY,
        leading=9.8,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'THRight',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        textColor=C_PRIMARY,
        leading=9.8,
        alignment=TA_RIGHT
    ))
    styles.add(ParagraphStyle(
        'TD',
        fontName='Helvetica',
        fontSize=7.8,
        textColor=C_TEXT,
        leading=9.8,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'TDRight',
        fontName='Helvetica',
        fontSize=7.8,
        textColor=C_TEXT,
        leading=9.8,
        alignment=TA_RIGHT
    ))
    styles.add(ParagraphStyle(
        'CalloutText',
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor("#1e293b"),
        leading=11.2
    ))

    return styles


def make_callout(text, label="KONTROLLER-MERKNAD", tone="accent", usable_w=174*mm):
    styles = get_tufte_stylesheet()
    b_color = C_ACCENT if tone == "accent" else (C_CRITICAL if tone == "critical" else (C_POSITIVE if tone == "positive" else C_WARNING))
    bg_color = (colors.HexColor("#f0f9ff") if tone == "accent" 
                else (colors.HexColor("#fef2f2") if tone == "critical" 
                else (colors.HexColor("#f0fdf4") if tone == "positive" else colors.HexColor("#fffbeb"))))

    content = [
        Paragraph(f"<b>{label}:</b> {text}", styles['CalloutText'])
    ]
    t = Table([[content]], colWidths=[usable_w])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
        ('BOX', (0, 0), (-1, -1), 0.5, b_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    return t


def build_metadata_box(rows, usable_w):
    styles = get_tufte_stylesheet()
    data = []
    for r in rows:
        col1 = Paragraph(f"<b>{r[0]}:</b> {r[1]}", styles['TD'])
        col2 = Paragraph(f"<b>{r[2]}:</b> {r[3]}" if len(r) > 2 else "", styles['TD'])
        data.append([col1, col2])
    t = Table(data, colWidths=[usable_w * 0.5, usable_w * 0.5])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_BG_ALT),
        ('BOX', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, C_BG_CODE),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


# ==============================================================================
# 1. USER GUIDE (Brukermanual & Operativ Veileder)
# ==============================================================================
def generate_user_guide(out_path):
    usable_w = A4[0] - 36 * mm
    doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
    styles = get_tufte_stylesheet()
    story = []

    # --- FORSIDE / TITTEL ---
    story.append(Paragraph("KOM-G | Kristiansand Kommune", styles['DocBadge']))
    story.append(Paragraph("Brukermanual & Operativ Veileder", styles['DocTitle']))
    story.append(Paragraph("Finansiell Virksomhetsstyring, KOSTRA Cockpit, What-If Simulering & Multi-LLM AI Rådgiver", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=0, spaceAfter=8))

    meta_rows = [
        ["Dokumenttype", "Brukermanual (Operativ Veiledning)", "Versjon / Dato", "v2.4 / August 2024 (M08)"],
        ["Målgruppe", "Prosjektcontrollere, Enhetsledere, Kommunalsjefer", "Sikkerhetsgrad", "Intern forvaltningsbruk"],
        ["Plattform", "HTML5 / Vanilla CSS / DuckDB / Streamlit / PBIP", "Forfatter", "Frank Ellingsen (Project Controller)"],
        ["Datagrunnlag", "fact_data (827 rader, M01–M08 2024)", "Hjemler", "Kommuneloven § 13-1, § 14-6 / KOSTRA 2024"]
    ]
    story.append(build_metadata_box(meta_rows, usable_w))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 1 ---
    story.append(Paragraph("1. Formål, Brukerroller og Kommunalt Rammeverk", styles['H1']))
    story.append(Paragraph(
        "KOM-G (KomKostra) er Kristiansand kommunes standardiserte styringscockpit for finansiell oppfølging, "
        "avviksdiagnostikk og prognostisering. Plattformen dekker to sentrale driftsområder: "
        "<b>Oppvekst og Utdanning</b> (KomSkole: grunnskoler, SFO, PPT, voksenopplæring og spesialpedagogikk) og "
        "<b>Helse og Omsorg</b> (Bomiljø: pleie og omsorg i institusjon og bolig).",
        styles['Body']
    ))
    story.append(Paragraph(
        "Løsningen ivaretar rapporteringskravene i <b>Kommuneloven § 14-6</b> (økonomiplan og budsjettjusteringer) "
        "og understøtter kommunedirektørens administrative fullmakter etter <b>Kommuneloven § 13-1</b>.",
        styles['Body']
    ))
    story.append(Paragraph("<b>Målgrupper og kjerneoppgaver:</b>", styles['BodyBold']))
    story.append(Paragraph("• <b>Prosjektcontroller / Finansiell rådgiver:</b> Gjennomfører månedlig avviksanalyse på art- og funksjonsnivå, beregner prognosert årssluttavvik (EAC) og utarbeider strakstiltak.", styles['BulletItem']))
    story.append(Paragraph("• <b>Virksomhetsleder (Rektor / Enhetsleder):</b> Følger opp bemanningsfaktor, korttidsfravær, overtid og ekstern vikarbyråinnleie opp mot bemanningsnormer.", styles['BulletItem']))
    story.append(Paragraph("• <b>Kommunalsjef & Økonomidirektør:</b> Benytter konsolidert status og Tufte S-kurver for tertialrapportering (T2) og politisk saksforberedelse til Formannskapet og Bystyret.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 2 ---
    story.append(Paragraph("2. Hoveddashboard og Power BI Dimensjonsfiltre (Slicere)", styles['H1']))
    story.append(Paragraph(
        "Hovedskjermen gir umiddelbar tilgang til alle data via reaktive Power BI slicere som filtrerer 827 underliggende "
        "regnskapsrader i sanntid uten forsinkelse eller sideinnlasting:",
        styles['Body']
    ))

    slicer_data = [
        [Paragraph("Slicer / Filter", styles['TH']), Paragraph("Dimensjon", styles['TH']), Paragraph("Valgmuligheter", styles['TH']), Paragraph("Operativ Betydning", styles['TH'])],
        [Paragraph("<b>Sektor</b>", styles['TD']), Paragraph("dim_ansvar", styles['TD']), Paragraph("Alle / Oppvekst / Helse", styles['TD']), Paragraph("Isolerer ansvarsområde eller viser konsolidert kommuneoversikt", styles['TD'])],
        [Paragraph("<b>KOSTRA-Funksjon</b>", styles['TD']), Paragraph("dim_kostra_funksjon", styles['TD']), Paragraph("2020, 2140, 2210, 2540 osv.", styles['TD']), Paragraph("Dypdykk i lovpålagte 4-sifrede KOSTRA tjenestefunksjoner", styles['TD'])],
        [Paragraph("<b>Rapporteringsperiode</b>", styles['TD']), Paragraph("dim_date", styles['TD']), Paragraph("Akkumulert YTD / M01–M08", styles['TD']), Paragraph("Skifter mellom akkumulert YTD (Jan–Aug) og isolert enkeltmåned", styles['TD'])],
        [Paragraph("<b>Kostnadskategori</b>", styles['TD']), Paragraph("dim_kontoplan", styles['TD']), Paragraph("Fastlønn, Vikarer, Overtid m.fl.", styles['TD']), Paragraph("Grupperer KOSTRA 6-sifret art til standardiserte kostnadsarter", styles['TD'])],
    ]
    t_slicer = Table(slicer_data, colWidths=[usable_w*0.22, usable_w*0.20, usable_w*0.28, usable_w*0.30])
    t_slicer.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_slicer)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Navigasjonselementer i topplinjen:</b>", styles['BodyBold']))
    story.append(Paragraph("• <b>YTD Avviksindikator:</b> Viser pulserende status <code>YTD Avvik: -2 229,6 kNOK (107,6 %)</code> i sanntid.", styles['BulletItem']))
    story.append(Paragraph("• <b>PDF Hurtigrapporter:</b> Direkte nedlasting av formelle saksutredninger for Helse & Mestring, Oppvekst eller Konsolidert total.", styles['BulletItem']))
    story.append(Paragraph("• <b>Fargetema (☀️ Papir / 🌙 Mørk):</b> Veksler mellom mørkt executive display og Edward Tufte lyst papirtema optimalisert for utskrift.", styles['BulletItem']))
    story.append(Paragraph("• <b>Power BI Prosjekt (.zip):</b> Last ned komplett PBIP-mappe med TMDL-semantisk modell og 25 rapportsider.", styles['BulletItem']))
    story.append(Paragraph("• <b>🤖 AI Oppsett:</b> Åpner innstillingsmodalen for valg av AI-leverandør og API-nøkkel.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 3 ---
    story.append(PageBreak())
    story.append(Paragraph("3. Tolkning av Nøkkeltall (KPIer per Måned 08 / August 2024)", styles['H1']))
    story.append(Paragraph(
        "Alle økonomiske tall er oppgitt i <b>tusen kroner (kNOK)</b> med én desimal. "
        "Formel: <b>Avvik = Budsjett - Regnskap</b>. Negativt tall indikerer merforbruk (rødt), mens positivt tall indikerer mindreforbruk (grønt).",
        styles['Body']
    ))

    kpi_data = [
        [Paragraph("Område / Metrikk", styles['TH']), Paragraph("Budsjett YTD", styles['THRight']), Paragraph("Regnskap YTD", styles['THRight']), Paragraph("Avvik (kNOK)", styles['THRight']), Paragraph("Forbruk %", styles['THRight']), Paragraph("Status & Hovedårsak", styles['TH'])],
        [Paragraph("<b>Konsolidert YTD</b>", styles['TD']), Paragraph("29 295,2 k", styles['TDRight']), Paragraph("31 524,9 k", styles['TDRight']), Paragraph("<font color='#dc2626'><b>-2 229,6 k</b></font>", styles['TDRight']), Paragraph("107,6 %", styles['TDRight']), Paragraph("Kritisk samlet merforbruk", styles['TD'])],
        [Paragraph("<b>Oppvekst og Utdanning</b>", styles['TD']), Paragraph("17 958,0 k", styles['TDRight']), Paragraph("18 902,0 k", styles['TDRight']), Paragraph("<font color='#dc2626'><b>-944,0 k</b></font>", styles['TDRight']), Paragraph("105,3 %", styles['TDRight']), Paragraph("Lønnsoppgjør og skolestart", styles['TD'])],
        [Paragraph("<b>Helse og Omsorg</b>", styles['TD']), Paragraph("11 337,2 k", styles['TDRight']), Paragraph("12 622,9 k", styles['TDRight']), Paragraph("<font color='#dc2626'><b>-1 285,6 k</b></font>", styles['TDRight']), Paragraph("111,3 %", styles['TDRight']), Paragraph("Vikarbyrå og turnuspress", styles['TD'])],
        [Paragraph("<b>August isolert (M08)</b>", styles['TD']), Paragraph("3 770,1 k", styles['TDRight']), Paragraph("4 120,8 k", styles['TDRight']), Paragraph("<font color='#dc2626'><b>-350,7 k</b></font>", styles['TDRight']), Paragraph("109,3 %", styles['TDRight']), Paragraph("Ferieavvikling & vikarinnleie", styles['TD'])],
        [Paragraph("<b>Random Forest ML-Modell</b>", styles['TD']), Paragraph("MAE: 4,3 k", styles['TDRight']), Paragraph("R²: 0.9657", styles['TDRight']), Paragraph("<font color='#059669'><b>0,0 % Drift</b></font>", styles['TDRight']), Paragraph("96,6 % fit", styles['TDRight']), Paragraph("Stabil modell uten drift", styles['TD'])],
    ]
    t_kpi = Table(kpi_data, colWidths=[usable_w*0.28, usable_w*0.14, usable_w*0.14, usable_w*0.15, usable_w*0.12, usable_w*0.17])
    t_kpi.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_kpi)
    story.append(Spacer(1, 6))

    story.append(make_callout(
        "Fastlønnsavviket på -1 888,9 kNOK skyldes at tariffoppgjøret per 01.05 ikke var periodisert i budsjettkurven i Framsikt. "
        "Dette er et periodiseringsavvik som skal løses med teknisk budsjettjustering i T2, ikke panikk-kutt i kjerneundervisning.",
        label="VIKTIG CONTROLLER-OBSERVASJON",
        tone="warning",
        usable_w=usable_w
    ))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 4 ---
    story.append(Paragraph("4. Tufte Visualiseringsstudio (6 Grafiske Perspektiver)", styles['H1']))
    story.append(Paragraph(
        "I tråd med Edward Tuftes visualiseringsteori unngår KOM-G unødvendige gitterlinjer, bakgrunnsskygger og 3D-effekter. "
        "Brukeren kan veksle sømløst mellom seks spesialiserte visninger:",
        styles['Body']
    ))
    story.append(Paragraph("1. <b>📈 Tufte S-Kurve (Running Totals):</b> Akkumulert regnskapskurve mot periodisert budsjett. Området mellom kurvene skraveres i rosa for å synliggjøre det akkumulerte merforbruket.", styles['BulletItem']))
    story.append(Paragraph("2. <b>📊 Månedlig (Monthly Columns):</b> Sammenligner månedlige kostnader direkte fra januar til august for å avdekke sesongmessige topper.", styles['BulletItem']))
    story.append(Paragraph("3. <b>⚖️ FT 01 Avvik (Diverging Bars):</b> Viser netto avvik i kNOK per måned. Røde søyler under nullstreken markerer overskridelser.", styles['BulletItem']))
    story.append(Paragraph("4. <b>🍭 Time 07 Lollipops:</b> Kostnadsfordeling per enhet med referanselinjer for 80 % buffer og 110 % varselgrense.", styles['BulletItem']))
    story.append(Paragraph("5. <b>🌊 Time 10 Waterfall (Avviksvannfall):</b> Viser hvordan de enkelte kostnadsdriverne bygger opp avviket mot årssluttprognosen (EAC).", styles['BulletItem']))
    story.append(Paragraph("6. <b>📐 Time 08 Slopegraph:</b> Sammenligner endring i kostnadsandel mellom måned 01 og måned 08 for å identifisere akselererende kostnadsposter.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 5 ---
    story.append(Paragraph("5. Interactive What-If Scenariosimulator", styles['H1']))
    story.append(Paragraph(
        "Simulatoren gir ledelsen mulighet til å teste effekten av tiltak for å bringe økonomien i balanse før 31.12.2024:",
        styles['Body']
    ))
    sim_data = [
        [Paragraph("Parameter", styles['TH']), Paragraph("Område / Skala", styles['TH']), Paragraph("Basisverdi (Aug)", styles['TH']), Paragraph("Beregning & Forventet Effekt", styles['TH'])],
        [Paragraph("<b>Vikarbyråkutt (Art 127040)</b>", styles['TD']), Paragraph("0 % til 100 % (trinn 5 %)", styles['TD']), Paragraph("253,2 kNOK/mnd", styles['TD']), Paragraph("25 % kutt = 63,3 kNOK/mnd (253,2 kNOK spart i reståret Sep–Des)", styles['TD'])],
        [Paragraph("<b>Overtidskutt (Art 104000)</b>", styles['TD']), Paragraph("0 % til 100 % (trinn 5 %)", styles['TD']), Paragraph("52,4 kNOK/mnd", styles['TD']), Paragraph("10 % kutt = 5,2 kNOK/mnd. Sikrer overholdelse av AML § 10-6", styles['TD'])],
        [Paragraph("<b>Rammeomdisponering</b>", styles['TD']), Paragraph("0 % til 10 % (trinn 0,5 %)", styles['TD']), Paragraph("Variabel ramme", styles['TD']), Paragraph("Generelt rammekutt i administrative stabsfunksjoner iht. § 13-1", styles['TD'])],
    ]
    t_sim = Table(sim_data, colWidths=[usable_w*0.28, usable_w*0.22, usable_w*0.20, usable_w*0.30])
    t_sim.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_sim)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 6 ---
    story.append(PageBreak())
    story.append(Paragraph("6. Tidligvarsler og Risikoanalyse (Early Warnings)", styles['H1']))
    story.append(Paragraph(
        "KOM-G har automatisk avviksdeteksjon som flagger poster med unormal run-rate eller lovmessig risiko:",
        styles['Body']
    ))

    warn_rows = [
        [Paragraph("Risikovarsel", styles['TH']), Paragraph("Berørt Art / Funksjon", styles['TH']), Paragraph("Avvik August", styles['THRight']), Paragraph("Anbefalt Controller-Tiltak", styles['TH'])],
        [
            Paragraph("<b>🚨 Kritisk: Vikarbyrå</b>", styles['TD']),
            Paragraph("Art 127040 / Funksjon 2540", styles['TD']),
            Paragraph("<font color='#dc2626'><b>-253,2 k</b></font>", styles['TDRight']),
            Paragraph("Iverksett umiddelbar administrativ godkjenningsplikt for ekstern innleie over avdelingsledernivå. Årskostnad passerer 1,4 MNOK uten tiltak.", styles['TD'])
        ],
        [
            Paragraph("<b>⚠️ Betydelig: Fastlønn</b>", styles['TD']),
            Paragraph("Art 101000 (Skole & Helse)", styles['TD']),
            Paragraph("<font color='#dc2626'><b>-196,8 k</b></font>", styles['TDRight']),
            Paragraph("Juster periodisert budsjettramme i tertialrapport T2 for å reflektere 01.05-oppgjøret. Unngå panikk-kutting i undervisning.", styles['TD'])
        ],
        [
            Paragraph("<b>⚠️ Moderat: Overtid</b>", styles['TD']),
            Paragraph("Art 104000 & 102031", styles['TD']),
            Paragraph("<font color='#dc2626'><b>-88,9 k</b></font>", styles['TDRight']),
            Paragraph("Gjennomgå turnusplaner for høstsemesteret. AML § 10-6 setter en grense på maks 10 timer overtid per uke og 200 timer per år.", styles['TD'])
        ]
    ]
    t_warn = Table(warn_rows, colWidths=[usable_w*0.25, usable_w*0.25, usable_w*0.16, usable_w*0.34])
    t_warn.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_warn)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 7 ---
    story.append(Paragraph("7. AI Controller Rådgiver & Valg av AI-Leverandør (NYTT)", styles['H1']))
    story.append(Paragraph(
        "KOM-G har integrert en multi-LLM AI Controller som gir sanntids rådgivning om KOSTRA-tall, avviksårsaker og "
        "juridiske rammer. Brukere kan velge mellom skybaserte modeller og 100 % lokale LLM-er:",
        styles['Body']
    ))

    ai_prov_table = [
        [Paragraph("AI Leverandør", styles['TH']), Paragraph("Standardmodell", styles['TH']), Paragraph("API-Nøkkel?", styles['TH']), Paragraph("Egenskaper & Bruksområde", styles['TH'])],
        [Paragraph("<b>Google Gemini</b>", styles['TD']), Paragraph("gemini-1.5-flash", styles['TD']), Paragraph("Ja (Google AI)", styles['TD']), Paragraph("Anbefalt standard. Rask og presis controller-analyse.", styles['TD'])],
        [Paragraph("<b>OpenAI</b>", styles['TD']), Paragraph("gpt-4o-mini", styles['TD']), Paragraph("Ja (OpenAI)", styles['TD']), Paragraph("Avansert finansiell resonnering og saksutredning.", styles['TD'])],
        [Paragraph("<b>Anthropic Claude</b>", styles['TD']), Paragraph("claude-3-5-sonnet", styles['TD']), Paragraph("Ja (Anthropic)", styles['TD']), Paragraph("Dype forklaringer og juridiske vurderinger.", styles['TD'])],
        [Paragraph("<b>Ollama (Lokal LLM)</b>", styles['TD']), Paragraph("llama3:latest", styles['TD']), Paragraph("<b>NEI (Gratis)</b>", styles['TD']), Paragraph("100 % lokal på maskinen (localhost:11434). Ingen datalekkasje.", styles['TD'])],
        [Paragraph("<b>Groq</b>", styles['TD']), Paragraph("llama-3.1-70b", styles['TD']), Paragraph("Ja (Groq)", styles['TD']), Paragraph("Lynrask inferens med åpen kildekode modell.", styles['TD'])],
        [Paragraph("<b>Mistral AI</b>", styles['TD']), Paragraph("mistral-large", styles['TD']), Paragraph("Ja (Mistral)", styles['TD']), Paragraph("Europeisk AI for suverene forvaltningskrav.", styles['TD'])],
        [Paragraph("<b>DeepSeek</b>", styles['TD']), Paragraph("deepseek-chat", styles['TD']), Paragraph("Ja (DeepSeek)", styles['TD']), Paragraph("Sterk på matematiske kalkyler og prognoseavvik.", styles['TD'])],
        [Paragraph("<b>Innebygd (Offline)</b>", styles['TD']), Paragraph("rule-based-v2", styles['TD']), Paragraph("<b>NEI</b>", styles['TD']), Paragraph("Forhåndsberegnet controller-logikk uten nettverkskall.", styles['TD'])],
    ]
    t_ai = Table(ai_prov_table, colWidths=[usable_w*0.25, usable_w*0.23, usable_w*0.18, usable_w*0.34])
    t_ai.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_ai)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Steg-for-steg veiledning for AI-oppsett:</b>", styles['BodyBold']))
    story.append(Paragraph("1. Klikk <code>🤖 AI: Modell</code> i toppmenyen eller tannhjul-ikonet (⚙️) i chat-vinduet.", styles['BulletItem']))
    story.append(Paragraph("2. Velg ønsket leverandør fra nedtrekksmenyen. For <i>Ollama</i> trenger du ikke API-nøkkel (sjekk at Ollama kjører lokalt).", styles['BulletItem']))
    story.append(Paragraph("3. Lim inn API-nøkkelen i nøkkelfeltet. Nøkkelen lagres utelukkende lokalt i nettleseren din (localStorage) og sendes aldri til en mellomserver.", styles['BulletItem']))
    story.append(Paragraph("4. Klikk <code>🔌 Test Tilkobling</code> for å verifisere at nøkkelen fungerer.", styles['BulletItem']))
    story.append(Paragraph("5. Klikk <code>💾 Lagre & Aktiver</code>. Statusindikatoren i toppmenyen lyser grønt når nøkkelen er aktiv.", styles['BulletItem']))
    story.append(Paragraph("6. For raske spørsmål kan du også åpne inline-skuffen rett i chat-vinduet ved å klikke på nøkkel-knappen.", styles['BulletItem']))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 8 ---
    story.append(Paragraph("8. Rapportkatalog (25 Sider), Excel- og Power BI-Integrasjon", styles['H1']))
    story.append(Paragraph(
        "KOM-G inneholder en komplett rapportkatalog med 25 spesialiserte Power BI rapportsider strukturert i tre kategorier:",
        styles['Body']
    ))
    story.append(Paragraph("• <b>Ledelses- og Styringsrapporter (6 sider):</b> Konsolidert hovedrapport, sektorrapporter for Oppvekst og Helse, Tufte S-kurve & prognose, Pareto 80/20 driverfordeling og What-If scenario.", styles['BulletItem']))
    story.append(Paragraph("• <b>Financial Times Visual Guide (9 sider):</b> Diverging bar charts, korrelasjonsmatriser, lollipops, fordelingsanalyser, stepped lines, grupperte søyler, treemaps og allokeringsvannfall.", styles['BulletItem']))
    story.append(Paragraph("• <b>Time-Visuals 60 (10 sider):</b> Linjediagrammer, 3M glidende snitt, kumulative arealer, avviksvekst, S-kurver, toleransegrenser, slopegraphs, sparklines og avviksvannfall mot årsslutt.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    story.append(make_callout(
        "For å koble Excel direkte til dataene: Kjør '.\\run.ps1 -ExportExcel' for å generere 'data/excel_ml_input.xlsx', "
        "eller åpne 'pbi-rep-project.pbip' direkte i Power BI Desktop for full tilgang til TMDL-modellen og 78 DAX-måltall.",
        label="EXCEL & POWER BI KOPLING",
        tone="positive",
        usable_w=usable_w
    ))

    doc.build(story, canvasmaker=make_canvas_factory("KOM-G | Brukermanual & Operativ Veileder"))
    print(f"Generated: {out_path}")


# ==============================================================================
# 2. SYSTEM MANUAL AND ARCHITECTURE (Systemmanual & Arkitektur)
# ==============================================================================
def generate_system_manual(out_path):
    usable_w = A4[0] - 36 * mm
    doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
    styles = get_tufte_stylesheet()
    story = []

    # --- FORSIDE / TITTEL ---
    story.append(Paragraph("KOM-G | Kristiansand Kommune", styles['DocBadge']))
    story.append(Paragraph("Teknisk Systemmanual & Arkitektur", styles['DocTitle']))
    story.append(Paragraph("Lokal-Først OLAP, Multi-LLM Integrasjon, ML Tidsserieprognoser og Power BI Developer Mode", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=0, spaceAfter=8))

    meta_rows = [
        ["Systemnavn", "KOM-G (KomKostra) Platform", "Arkitekturparadigme", "Local-First High Performance OLAP"],
        ["Database", "DuckDB 1.0+ (In-process OLAP)", "ML Pipeline", "Random Forest Regressor (MLflow tracked)"],
        ["Frontend Stack", "Semantic HTML5, Vanilla CSS, ES2022", "BI Format", "Power BI PBIP (TMDL + PBIR format)"],
        ["AI Stack", "Gemini, OpenAI, Claude, Ollama, Groq", "CLI Orkestrering", "PowerShell 7 (`run.ps1`)"]
    ]
    story.append(build_metadata_box(meta_rows, usable_w))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 1 ---
    story.append(Paragraph("1. Arkitektoniske Kjerneprinsipper og Systemoversikt", styles['H1']))
    story.append(Paragraph(
        "KOM-G er bygget med utgangspunkt i en <b>Local-First</b> filosofi. Dette sikrer at kommunale finansdata "
        "aldri må sendes til tredjepartstjenester for ordinær spørre- eller visualiseringsvirksomhet, samtidig som det "
        "gir sub-millisekund responstider for controllere:",
        styles['Body']
    ))
    story.append(Paragraph("• <b>Local-First OLAP:</b> All datalagring og aggregering foregår i en lokal in-process DuckDB-fil (<code>data/database/kostra.duckdb</code>). Dette eliminerer behovet for tunge databaseservere som MS SQL eller PostgreSQL, og muliggjør offline-arbeid på bærbare maskiner.", styles['BulletItem']))
    story.append(Paragraph("• <b>Zero-Framework Frontend:</b> Brukergrensesnittet er skrevet i ren, semantisk HTML5, modulær Vanilla CSS3 og moderne ES2022 JavaScript uten Node-byggekrav (ingen Webpack/Vite/React). Dette gir umiddelbar oppstart i enhver nettleser.", styles['BulletItem']))
    story.append(Paragraph("• <b>Power BI Developer Mode (PBIP):</b> Semantisk datamodell er lagret som ren tekst i Tabular Model Definition Language (TMDL). Dette muliggjør Git branch-styring, pull request-gjennomgang av DAX-måltall og CI/CD pipelines.", styles['BulletItem']))
    story.append(Paragraph("• <b>Multi-LLM Integrasjonslag:</b> Klientsiden støtter både direkte sky-REST-kall (Gemini, OpenAI, Claude, Groq) og 100 % lokale LLM-er via Ollama uten ekstern trafikk.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 2 ---
    story.append(Paragraph("2. Systemkomponenter og Datagrunnlag", styles['H1']))
    comp_data = [
        [Paragraph("Komponent", styles['TH']), Paragraph("Teknologi / Fil", styles['TH']), Paragraph("Rolle i Arkitekturen", styles['TH']), Paragraph("Integrasjonspunkt", styles['TH'])],
        [Paragraph("<b>Web Cockpit</b>", styles['TD']), Paragraph("index.html, dashboard.js", styles['TD']), Paragraph("Executive styringsflate med Tufte S-kurver og simulator", styles['TD']), Paragraph("Klientside DOM / LocalStorage", styles['TD'])],
        [Paragraph("<b>DuckDB OLAP</b>", styles['TD']), Paragraph("data/database/kostra.duckdb", styles['TD']), Paragraph("In-process analytisk SQL database (827 rader faktagrunnlag)", styles['TD']), Paragraph("Python, Excel, SQL queries", styles['TD'])],
        [Paragraph("<b>ML Pipeline</b>", styles['TD']), Paragraph("src/retrain_pipeline.py", styles['TD']), Paragraph("Random Forest tidsserieprognoser & model drift-deteksjon", styles['TD']), Paragraph("MLflow Tracking (localhost:5000)", styles['TD'])],
        [Paragraph("<b>AI Workbench</b>", styles['TD']), Paragraph("src/app.py (Streamlit)", styles['TD']), Paragraph("Interaktiv analytisk arbeidsflate og RAG-saksbehandling", styles['TD']), Paragraph("Port 8501 / DuckDB / LLM APIs", styles['TD'])],
        [Paragraph("<b>Power BI PBIP</b>", styles['TD']), Paragraph("pbi-rep-project.pbip", styles['TD']), Paragraph("25 rapportsider, 78 DAX-måltall i TMDL-format", styles['TD']), Paragraph("Power BI Desktop / Fabric", styles['TD'])],
        [Paragraph("<b>CLI Controller</b>", styles['TD']), Paragraph("run.ps1", styles['TD']), Paragraph("PowerShell orkestreringsmotor for all bygg og drift", styles['TD']), Paragraph("Terminal / Automatisering", styles['TD'])],
    ]
    t_comp = Table(comp_data, colWidths=[usable_w*0.20, usable_w*0.28, usable_w*0.30, usable_w*0.22])
    t_comp.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 6))

    # --- KAPITTEL 3 ---
    story.append(PageBreak())
    story.append(Paragraph("3. Multi-LLM Integrasjonsarkitektur (Klient- og Server-side)", styles['H1']))
    story.append(Paragraph(
        "KOM-G har implementert en fleksibel multi-LLM dispatcher i <code>assets/js/dashboard.js</code>. "
        "Dette gir controllere frihet til å velge motor etter sikkerhets- og kostnadsbehov:",
        styles['Body']
    ))

    story.append(Paragraph("<b>Dispatcher-arkitektur:</b>", styles['BodyBold']))
    story.append(Paragraph("1. <b>Google Gemini (GenerativeLanguage REST API v1beta):</b> Kaller <code>generateContent</code> med Google AI Studio nøkkel. Støtter <code>gemini-1.5-flash</code> og <code>gemini-2.0-flash</code>.", styles['BulletItem']))
    story.append(Paragraph("2. <b>OpenAI-kompatible endepunkter:</b> En felles klientfunksjon håndterer OpenAI (<code>api.openai.com/v1/chat/completions</code>), Groq (<code>api.groq.com/openai/v1/chat/completions</code>), Mistral (<code>api.mistral.ai/v1/chat/completions</code>) og DeepSeek (<code>api.deepseek.com/chat/completions</code>).", styles['BulletItem']))
    story.append(Paragraph("3. <b>Ollama (Lokal Inferens):</b> Kaller <code>http://localhost:11434/api/chat</code>. Ingen API-nøkkel påkrevd, null nettverkstrafikk ut av maskinen, 100 % konfidensiell forvaltning.", styles['BulletItem']))
    story.append(Paragraph("4. <b>Innebygd regelmotor (Offline):</b> Ved manglende nøkkel eller nettverksbrudd slår systemet umiddelbart over til regelbasert controller-logikk uten feilmeldinger til bruker.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Kontekstinjeksjon for KOSTRA:</b>", styles['BodyBold']))
    story.append(Paragraph(
        "Før en prompt sendes til valgt AI-modell, bygger funksjonen <code>buildControllerContext()</code> en strukturert finansiell rapport "
        "basert på de gjeldende tallene i cockpiten:",
        styles['Body']
    ))
    code_ctx = (
        "KRISTIANSAND KOMMUNE – KOSTRA VIRKSOMHETSSTYRING 2024 (STATUS MÅNED 08 / AUGUST):\n"
        "• Konsolidert YTD Regnskap: 31 524,9 kNOK vs Budsjett 29 295,2 kNOK (Avvik -2 229,6 kNOK / 107,6 %)\n"
        "• Oppvekst og Utdanning: 18 902,0 kNOK vs 17 958,0 kNOK (Avvik -944,0 kNOK / 105,3 %)\n"
        "• Helse og Omsorg: 12 622,9 kNOK vs 11 337,2 kNOK (Avvik -1 285,6 kNOK / 111,3 %)\n"
        "• Hoveddriver 1: Art 127040 Vikarbyrå – 382,7 k YTD (253,2 k i august alene i institusjon funksjon 2540)\n"
        "• Hoveddriver 2: Art 101000 Fastlønn – Avvik -1 888,9 k YTD pga uperiodisert 01.05-oppgjør\n"
        "• Lover: Opplæringsloven § 8-2, Helse- og omsorgstjenesteloven § 4-1, AML § 10-6, Kommuneloven § 14-6"
    )
    t_ctx = Table([[Paragraph(f"<pre>{code_ctx}</pre>", styles['CodeSnippet'])]], colWidths=[usable_w])
    t_ctx.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_BG_CODE),
        ('BOX', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_ctx)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 4 ---
    story.append(Paragraph("4. Maskinlæringspipeline og Drift-Overvåking", styles['H1']))
    story.append(Paragraph(
        "I <code>src/retrain_pipeline.py</code> trenes en <b>Random Forest Regressor</b> for månedlig tidsserieprognostisering. "
        "Modellen predikerer forventet regnskapsforbruk per måned basert på historiske mønstre:",
        styles['Body']
    ))
    story.append(Paragraph("• <b>Egenskaper (Features):</b> <code>Maaned_Nr</code>, <code>Kvartal</code>, <code>KOSTRA_Funksjon</code>, <code>Kontokode_6Siffer</code>, <code>Budsjett_Kr</code> og sesongvekter.", styles['BulletItem']))
    story.append(Paragraph("• <b>Ytelsestall:</b> Test-R² = <b>0.9657</b>, Test-MAE = <b>4,3 kNOK</b> (over 96 % treffsikkerhet mot faktisk regnskap).", styles['BulletItem']))
    story.append(Paragraph("• <b>Model Drift Deteksjon:</b> Dersom gjennomsnittlig test-MAE for nye månedstall overstiger baseline-MAE med mer enn <b>20 %</b>, flagges det automatisk i MLflow og controllere varsles om å rekalibrere sesongvektene i Framsikt.", styles['BulletItem']))
    story.append(Paragraph("• <b>Modellagring:</b> Beste modell serialiseres til <code>models/kostra_forecast_latest.pkl</code> for gjenbruk i Streamlit og DuckDB.", styles['BulletItem']))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 5 ---
    story.append(PageBreak())
    story.append(Paragraph("5. Driftsrutiner og PowerShell CLI (`run.ps1`)", styles['H1']))
    story.append(Paragraph(
        "All drift og automatisering i prosjektet orkestreres via rotmappens PowerShell-grensesnitt <code>run.ps1</code>:",
        styles['Body']
    ))

    cmd_data = [
        [Paragraph("Kommando", styles['TH']), Paragraph("Beskrivelse & Handling", styles['TH']), Paragraph("Output Ressurs", styles['TH'])],
        [Paragraph("<code>.\\run.ps1 -BuildDB</code>", styles['TD']), Paragraph("Bygger/oppdaterer DuckDB fra CSV-filer i powerbi_kostra_datamodell/", styles['TD']), Paragraph("<code>data/database/kostra.duckdb</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -Retrain</code>", styles['TD']), Paragraph("Kjører Random Forest ML-trening og sjekker for model drift mot baseline", styles['TD']), Paragraph("<code>models/kostra_forecast_latest.pkl</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -ExportExcel</code>", styles['TD']), Paragraph("Genererer ferdig pivot-underlag med alle KOSTRA-arter", styles['TD']), Paragraph("<code>data/excel_ml_input.xlsx</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -Mlflow</code>", styles['TD']), Paragraph("Starter lokal MLflow dashboard-server for overvåking av modell-metrics", styles['TD']), Paragraph("<code>http://localhost:5000</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -Streamlit</code>", styles['TD']), Paragraph("Starter interaktiv Streamlit AI Controller Workbench med RAG", styles['TD']), Paragraph("<code>http://localhost:8501</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -Reports</code>", styles['TD']), Paragraph("Genererer alle tre formelle saksutredninger for ledelsen", styles['TD']), Paragraph("<code>reports/*.pdf</code>", styles['TD'])],
        [Paragraph("<code>.\\run.ps1 -Test</code>", styles['TD']), Paragraph("Kjører automatiserte tester av relasjoner, DuckDB og API-integrasjoner", styles['TD']), Paragraph("Konsoll output / Testrapport", styles['TD'])],
    ]
    t_cmd = Table(cmd_data, colWidths=[usable_w*0.28, usable_w*0.44, usable_w*0.28])
    t_cmd.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_cmd)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 6 ---
    story.append(Paragraph("6. Sikkerhetsarkitektur, Personvern og Revisjonsspor", styles['H1']))
    story.append(Paragraph(
        "I henhold til Offentleglova § 3, Forvaltningsloven og GDPR er KOM-G bygget for å sikre full sporbarhet "
        "og beskyttelse av sensitive opplysninger:",
        styles['Body']
    ))
    story.append(Paragraph("• <b>Null Personsensitiv Informasjon:</b> Datamodellen inneholder kun aggregerte kontotall per art og funksjon. Ingen personnavn, pasientopplysninger eller elevdata lagres i basen.", styles['BulletItem']))
    story.append(Paragraph("• <b>Audit Trail i DuckDB:</b> Alle AI-genererte vurderinger og anbefalinger logges til tabellen <code>audit_log</code> med <code>Audit_Log_ID</code>, tidsstempel, saksbehandler, filtrert kontekst og svar for etterprøvbarhet i kommunerevisjonen.", styles['BulletItem']))
    story.append(Paragraph("• <b>Lokal Nøkkelsikkerhet:</b> API-nøkler for eksterne skytjenester lagres utelukkende i brukerens klientside <code>localStorage</code> under <code>kostra_ai_settings</code>. Ingen nøkler committes til Git eller deles mellom brukere.", styles['BulletItem']))
    story.append(Paragraph("• <b>Arkivintegrasjon:</b> PDF-generatoren produserer ISO-standardiserte dokumenter klare for arkivering i Public 360 / Elements og publisering på eInnsyn.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 7 ---
    story.append(Paragraph("7. Feilsøking og Driftsfeil (Troubleshooting Guide)", styles['H1']))
    trouble_data = [
        [Paragraph("Symptom / Feilmelding", styles['TH']), Paragraph("Sannsynlig Årsak", styles['TH']), Paragraph("Korrigerende Tiltak", styles['TH'])],
        [Paragraph("DuckDB locked / Resource busy", styles['TD']), Paragraph("Flere prosesser åpner DuckDB i skrivemodus", styles['TD']), Paragraph("Bruk skrivebeskyttet modus i spørreskript: <code>duckdb.connect(read_only=True)</code>", styles['TD'])],
        [Paragraph("CORS feil ved AI-kall i browser", styles['TD']), Paragraph("Nettleser blokkerer eksternt kall fra file://", styles['TD']), Paragraph("Kjør lokal webserver via <code>python -m http.server 8089</code> eller bruk Ollama", styles['TD'])],
        [Paragraph("Ollama connection refused (11434)", styles['TD']), Paragraph("Ollama daemon kjører ikke lokalt", styles['TD']), Paragraph("Start Ollama via terminal: <code>ollama serve</code> og verifiser modell: <code>ollama list</code>", styles['TD'])],
        [Paragraph("Model Drift Alarm i MLflow", styles['TD']), Paragraph("Endret sesongmønster ved skolestart/høst", styles['TD']), Paragraph("Kjør <code>.\\run.ps1 -Retrain</code> for å oppdatere sesongvektene for Q3/Q4", styles['TD'])],
    ]
    t_trouble = Table(trouble_data, colWidths=[usable_w*0.30, usable_w*0.32, usable_w*0.38])
    t_trouble.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_trouble)

    doc.build(story, canvasmaker=make_canvas_factory("KOM-G | Teknisk Systemmanual & Arkitektur"))
    print(f"Generated: {out_path}")


# ==============================================================================
# 3. DATA MODEL AND DICTIONARY (Datamodell & Begrepskatalog)
# ==============================================================================
def generate_data_model_manual(out_path):
    usable_w = A4[0] - 36 * mm
    doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
    styles = get_tufte_stylesheet()
    story = []

    # --- FORSIDE / TITTEL ---
    story.append(Paragraph("KOM-G | Kristiansand Kommune", styles['DocBadge']))
    story.append(Paragraph("Datamodell & Begrepskatalog (KOSTRA Dictionary)", styles['DocTitle']))
    story.append(Paragraph("Stjerneskjema, DuckDB Tabellspesifikasjon, TMDL Semantisk Modell og DAX Måltallskatalog", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=0, spaceAfter=8))

    meta_rows = [
        ["Modellnavn", "KOM-G Stjerneskjema (Star Schema)", "Standard", "SSB KOSTRA 2024 / Kontoplan"],
        ["Faktatabell", "fact_data (827 rader, M01–M08 2024)", "Måltall", "78 DAX-måltall i TMDL format"],
        ["Dimensjoner", "dim_date, dim_ansvar, dim_funksjon, dim_kontoplan", "Lagringsmotor", "DuckDB Columnar / PBIP Parquet"],
        ["Granularitet", "Månedlig per ansvar, funksjon og art 6-siffer", "Valuta / Enhet", "NOK i base / kNOK i presentasjon"]
    ]
    story.append(build_metadata_box(meta_rows, usable_w))
    story.append(Spacer(1, 8))

    # --- KAPITTEL 1 ---
    story.append(Paragraph("1. Konseptuell Datamodell og Stjerneskjema (Star Schema)", styles['H1']))
    story.append(Paragraph(
        "KOM-G benytter et standardisert stjerneskjema for å sikre maksimal spørreytelse og konsistens på tvers av "
        "Power BI Desktop, DuckDB og Excel. Modellen har én sentral faktatabell omgitt av fire dimensjonstabeller:",
        styles['Body']
    ))
    story.append(Paragraph("• <b><code>fact_data</code>:</b> Inneholder alle økonomiske transaksjoner (budsjett og regnskap) brutt ned per måned, ansvar, funksjon og art.", styles['BulletItem']))
    story.append(Paragraph("• <b><code>dim_date</code> (1:N mot fact_data):</b> Finansiell kalender med månedsnavn, kvartaler, tertialer og sesongfaktorer.", styles['BulletItem']))
    story.append(Paragraph("• <b><code>dim_ansvar</code> (1:N mot fact_data):</b> Kommunens organisasjonsstruktur (Oppvekst KomSkole vs. Helse Bomiljø).", styles['BulletItem']))
    story.append(Paragraph("• <b><code>dim_kostra_funksjon</code> (1:N mot fact_data):</b> SSB KOSTRA 4-sifrede funksjoner (2020 Grunnskole, 2540 Pleie og omsorg osv.).", styles['BulletItem']))
    story.append(Paragraph("• <b><code>dim_kostra_kontoplan</code> (1:N mot fact_data):</b> SSB KOSTRA 6-sifrede artskontokoder (101000 Fastlønn, 127040 Vikarbyrå osv.).", styles['BulletItem']))
    story.append(Spacer(1, 6))

    # --- KAPITTEL 2 ---
    story.append(Paragraph("2. Faktatabell Spesifikasjon (`fact_data`)", styles['H1']))
    story.append(Paragraph(
        "Faktatabellen har 827 rader som dekker perioden januar til august 2024. Nedenfor følger den fullstendige feltoversikten:",
        styles['Body']
    ))
    fact_cols = [
        [Paragraph("Feltnavn", styles['TH']), Paragraph("Datatype", styles['TH']), Paragraph("Krav", styles['TH']), Paragraph("Beskrivelse & Forretningsregel", styles['TH'])],
        [Paragraph("<code>TransaksjonsID</code>", styles['TD']), Paragraph("VARCHAR(32)", styles['TD']), Paragraph("PK", styles['TD']), Paragraph("Unik primærnøkkel per faktalinje (f.eks. TX-2024-08-00123)", styles['TD'])],
        [Paragraph("<code>Dato</code>", styles['TD']), Paragraph("DATE", styles['TD']), Paragraph("FK", styles['TD']), Paragraph("Første dag i bokføringsmåneden (koblet til dim_date)", styles['TD'])],
        [Paragraph("<code>Maaned_Nr</code>", styles['TD']), Paragraph("INTEGER", styles['TD']), Paragraph("NN", styles['TD']), Paragraph("Månedsnummer (1 = Jan, 8 = Aug, 12 = Des)", styles['TD'])],
        [Paragraph("<code>Aar</code>", styles['TD']), Paragraph("INTEGER", styles['TD']), Paragraph("NN", styles['TD']), Paragraph("Regnskapsår (2024)", styles['TD'])],
        [Paragraph("<code>Ansvar_Kode</code>", styles['TD']), Paragraph("VARCHAR(16)", styles['TD']), Paragraph("FK", styles['TD']), Paragraph("Ansvar / Sektor (KomSkole, Bomiljø)", styles['TD'])],
        [Paragraph("<code>KOSTRA_Funksjon</code>", styles['TD']), Paragraph("VARCHAR(8)", styles['TD']), Paragraph("FK", styles['TD']), Paragraph("KOSTRA 4-sifret funksjon (2020, 2140, 2540 osv.)", styles['TD'])],
        [Paragraph("<code>Kontokode_6Siffer</code>", styles['TD']), Paragraph("VARCHAR(16)", styles['TD']), Paragraph("FK", styles['TD']), Paragraph("KOSTRA 6-sifret art (101000, 104000, 127040 osv.)", styles['TD'])],
        [Paragraph("<code>Budsjett_Kr</code>", styles['TD']), Paragraph("DOUBLE", styles['TD']), Paragraph("Opt", styles['TD']), Paragraph("Periodisert budsjett i NOK", styles['TD'])],
        [Paragraph("<code>Regnskap_Kr</code>", styles['TD']), Paragraph("DOUBLE", styles['TD']), Paragraph("NN", styles['TD']), Paragraph("Faktisk bokført regnskapskostnad i NOK", styles['TD'])],
        [Paragraph("<code>Avvik_Kr</code>", styles['TD']), Paragraph("DOUBLE", styles['TD']), Paragraph("Calc", styles['TD']), Paragraph("Beregnet: Budsjett_Kr - Regnskap_Kr (Negativ = Merforbruk)", styles['TD'])],
        [Paragraph("<code>Kommentar</code>", styles['TD']), Paragraph("VARCHAR(255)", styles['TD']), Paragraph("Opt", styles['TD']), Paragraph("Controller-forklaring ved avvik over terskelverdi", styles['TD'])],
    ]
    t_fact = Table(fact_cols, colWidths=[usable_w*0.25, usable_w*0.16, usable_w*0.09, usable_w*0.50])
    t_fact.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_fact)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 3 ---
    story.append(PageBreak())
    story.append(Paragraph("3. Dimensjonstabeller og KOSTRA Kontoplan", styles['H1']))
    story.append(Paragraph(
        "Dimensjonstabellene sikrer konsistens med nasjonal KOSTRA-standard og kommunens økonomiplan i Framsikt:",
        styles['Body']
    ))

    dim_tab_data = [
        [Paragraph("Dimensjon", styles['TH']), Paragraph("Nøkkel", styles['TH']), Paragraph("Sentrale Attributter", styles['TH']), Paragraph("Beskrivelse & Eksempler", styles['TH'])],
        [
            Paragraph("<b>dim_ansvar</b>", styles['TD']),
            Paragraph("Ansvar_Kode", styles['TD']),
            Paragraph("Ansvar_Navn, Sektor, Enhetsleder, Org_Nivaa", styles['TD']),
            Paragraph("Definerer organisasjonsansvar. Sektorer: Oppvekst og Utdanning (KomSkole) og Helse og Omsorg (Bomiljø).", styles['TD'])
        ],
        [
            Paragraph("<b>dim_kostra_funksjon</b>", styles['TD']),
            Paragraph("Funksjon_Kode", styles['TD']),
            Paragraph("Funksjon_Navn, Tjenestegruppe, Lovhjemmel", styles['TD']),
            Paragraph("Funksjoner: 2020 Grunnskole, 2140 SFO, 2210 PPT, 2130 Voksenopplæring, 2230 Spesialpedagogikk, 2540 Pleie og omsorg.", styles['TD'])
        ],
        [
            Paragraph("<b>dim_kostra_kontoplan</b>", styles['TD']),
            Paragraph("Kontokode_6Siffer", styles['TD']),
            Paragraph("Kontonavn, Hovedart, Gruppe, Kostnadstype", styles['TD']),
            Paragraph("Arter: 101000 Fastlønn, 102013 Vikar korttid, 102031 Vikar turnus, 104000 Overtid, 127040 Vikarbyråinnleie.", styles['TD'])
        ],
        [
            Paragraph("<b>dim_date</b>", styles['TD']),
            Paragraph("Dato", styles['TD']),
            Paragraph("Aar, Maaned_Nr, Maaned_Navn, Kvartal, Tertial", styles['TD']),
            Paragraph("Finansiell kalender med kobling til tertialrapportering (T1: Jan-Apr, T2: Mai-Aug, T3: Sep-Des).", styles['TD'])
        ]
    ]
    t_dim_spec = Table(dim_tab_data, colWidths=[usable_w*0.22, usable_w*0.18, usable_w*0.30, usable_w*0.30])
    t_dim_spec.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_dim_spec)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 4 ---
    story.append(Paragraph("4. DAX Måltallskatalog (TMDL Semantisk Modell)", styles['H1']))
    story.append(Paragraph(
        "Den semantiske modellen i <code>pbi-rep-project.SemanticModel</code> inneholder 78 forhåndsdefinerte DAX-måltall "
        "i TMDL-format. Nedenfor følger kjernemåltallene som benyttes av controllere:",
        styles['Body']
    ))

    dax_table = [
        [Paragraph("DAX Måltall", styles['TH']), Paragraph("Definisjon / Formel", styles['TH']), Paragraph("Forretningsmessig Formål", styles['TH'])],
        [
            Paragraph("<b>[Total Regnskap]</b>", styles['TD']),
            Paragraph("<code>SUM(fact_data[Regnskap_Kr]) / 1000.0</code>", styles['TD']),
            Paragraph("Faktisk regnskapskostnad konvertert til kNOK", styles['TD'])
        ],
        [
            Paragraph("<b>[Total Budsjett]</b>", styles['TD']),
            Paragraph("<code>SUM(fact_data[Budsjett_Kr]) / 1000.0</code>", styles['TD']),
            Paragraph("Periodisert budsjettramme i kNOK", styles['TD'])
        ],
        [
            Paragraph("<b>[Avvik Kr]</b>", styles['TD']),
            Paragraph("<code>[Total Budsjett] - [Total Regnskap]</code>", styles['TD']),
            Paragraph("Netto avvik i kNOK. Negativt = merforbruk", styles['TD'])
        ],
        [
            Paragraph("<b>[Forbruk %]</b>", styles['TD']),
            Paragraph("<code>DIVIDE([Total Regnskap], [Total Budsjett], 0)</code>", styles['TD']),
            Paragraph("Forbruksprosent (f.eks. 107,6 %)", styles['TD'])
        ],
        [
            Paragraph("<b>[Regnskap YTD]</b>", styles['TD']),
            Paragraph("<code>TOTALYTD([Total Regnskap], dim_date[Dato])</code>", styles['TD']),
            Paragraph("Akkumulert regnskap hittil i år", styles['TD'])
        ],
        [
            Paragraph("<b>[Budsjett YTD]</b>", styles['TD']),
            Paragraph("<code>TOTALYTD([Total Budsjett], dim_date[Dato])</code>", styles['TD']),
            Paragraph("Akkumulert budsjettramme Jan–Aug", styles['TD'])
        ],
        [
            Paragraph("<b>[3M Moving Avg]</b>", styles['TD']),
            Paragraph("<code>AVERAGEX(DATESINPERIOD(dim_date[Dato], LASTDATE(dim_date[Dato]), -3, MONTH), [Total Regnskap])</code>", styles['TD']),
            Paragraph("Glidende 3-måneders snitt for utjevning av ferietrender", styles['TD'])
        ],
        [
            Paragraph("<b>[WhatIf Vikarbesparelse]</b>", styles['TD']),
            Paragraph("<code>CALCULATE([Total Regnskap], fact_data[Kontokode_6Siffer] = \"127040\") * ('Kutt_Vikar'[Pct] / 100)</code>", styles['TD']),
            Paragraph("Beregner månedlig innsparing ved vikarbyråkutt", styles['TD'])
        ],
        [
            Paragraph("<b>[Prognosert EAC]</b>", styles['TD']),
            Paragraph("<code>[Regnskap YTD] + ([Gjenstående Budsjett M09-12] * [Historisk RunRate]) - [Simulerte Besparelser]</code>", styles['TD']),
            Paragraph("Estimate at Completion ved 31.12.2024", styles['TD'])
        ],
    ]
    t_dax_spec = Table(dax_table, colWidths=[usable_w*0.28, usable_w*0.44, usable_w*0.28])
    t_dax_spec.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1.2, C_PRIMARY),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_dax_spec)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 5 ---
    story.append(PageBreak())
    story.append(Paragraph("5. Analytiske SQL Visninger i DuckDB OLAP", styles['H1']))
    story.append(Paragraph(
        "I <code>kostra.duckdb</code> oppretter <code>src/db_manager.py</code> tre optimaliserte analytiske visninger "
        "som fungerer som datakilde for dashboardet og rapportgeneratorene:",
        styles['Body']
    ))

    sql_views = (
        "-- 1. KPI-sammendrag per sektor og konsolidert\n"
        "CREATE VIEW vw_kpi_summary AS\n"
        "SELECT Ansvar_Kode, \n"
        "       SUM(Budsjett_Kr)/1000.0 AS Budsjett_kNOK,\n"
        "       SUM(Regnskap_Kr)/1000.0 AS Regnskap_kNOK,\n"
        "       (SUM(Budsjett_Kr) - SUM(Regnskap_Kr))/1000.0 AS Avvik_kNOK,\n"
        "       ROUND(SUM(Regnskap_Kr)*100.0 / NULLIF(SUM(Budsjett_Kr),0), 1) AS Forbruk_Pct\n"
        "FROM fact_data\n"
        "GROUP BY Ansvar_Kode;\n\n"
        "-- 2. Akkumulert Tufte S-kurve med vindufunksjoner\n"
        "CREATE VIEW vw_monthly_scurve AS\n"
        "SELECT Maaned_Nr, \n"
        "       SUM(Regnskap_Kr)/1000.0 AS Regnskap_Mnd,\n"
        "       SUM(SUM(Regnskap_Kr)/1000.0) OVER (ORDER BY Maaned_Nr) AS Regnskap_Akk,\n"
        "       SUM(Budsjett_Kr)/1000.0 AS Budsjett_Mnd,\n"
        "       SUM(SUM(Budsjett_Kr)/1000.0) OVER (ORDER BY Maaned_Nr) AS Budsjett_Akk\n"
        "FROM fact_data\n"
        "GROUP BY Maaned_Nr;\n\n"
        "-- 3. Topp kostnadsdrivere sortert på absolutt avvik\n"
        "CREATE VIEW vw_top_drivers AS\n"
        "SELECT Kontokode_6Siffer, KOSTRA_Funksjon, Ansvar_Kode,\n"
        "       SUM(Budsjett_Kr)/1000.0 AS Budsjett,\n"
        "       SUM(Regnskap_Kr)/1000.0 AS Regnskap,\n"
        "       (SUM(Budsjett_Kr) - SUM(Regnskap_Kr))/1000.0 AS Avvik_kNOK\n"
        "FROM fact_data\n"
        "WHERE Maaned_Nr = 8\n"
        "GROUP BY Kontokode_6Siffer, KOSTRA_Funksjon, Ansvar_Kode\n"
        "ORDER BY Avvik_kNOK ASC;"
    )
    t_sql = Table([[Paragraph(f"<pre>{sql_views}</pre>", styles['CodeSnippet'])]], colWidths=[usable_w])
    t_sql.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_BG_CODE),
        ('BOX', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_sql)
    story.append(Spacer(1, 8))

    # --- KAPITTEL 6 ---
    story.append(Paragraph("6. Datakvalitet, Avstemmingsregler og KOSTRA-Validering", styles['H1']))
    story.append(Paragraph(
        "Datamodellen valideres månedlig mot reglene i <code>docs/07_Data_Quality_and_Assurance_Rapport.md</code>:",
        styles['Body']
    ))
    story.append(Paragraph("• <b>Balansekontroll:</b> Summen av alle 827 faktarader avstemmes krone for krone mot kommunens offisielle månedsregnskap i Agresso/Unit4.", styles['BulletItem']))
    story.append(Paragraph("• <b>KOSTRA Funksjon/Art Matrise:</b> Validering av at kun tillatte kombinasjoner forekommer (f.eks. at funksjon 2020 kun belastes med skolerelaterte lønns- og driftsarter).", styles['BulletItem']))
    story.append(Paragraph("• <b>Nullverdi- og Duplikatsjekk:</b> Ingen transaksjoner tillates uten gyldig <code>TransaksjonsID</code> eller med negative budsjettrammer.", styles['BulletItem']))
    story.append(Spacer(1, 6))

    story.append(make_callout(
        "Avstemmingsrapporten per 31.08.2024 viser 0 feil og 100 % samsvar mellom fact_data, DuckDB OLAP og "
        "den konsoliderte månedsrapporten. Alle KOSTRA-standarder for SSB-rapportering 2024 er oppfylt.",
        label="DQA STATUS 2024",
        tone="positive",
        usable_w=usable_w
    ))

    doc.build(story, canvasmaker=make_canvas_factory("KOM-G | Datamodell & Begrepskatalog (KOSTRA)"))
    print(f"Generated: {out_path}")


# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
if __name__ == "__main__":
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    p1 = os.path.join(root_dir, "KOM-G_User_Guide.pdf")
    p2 = os.path.join(root_dir, "KOM-G_System_Manual_and_Architecture.pdf")
    p3 = os.path.join(root_dir, "KOM-G_Data_Model_and_Dictionary.pdf")
    
    print(f"Starting generation of 3 comprehensive PDF manuals in {root_dir}...")
    generate_user_guide(p1)
    generate_system_manual(p2)
    generate_data_model_manual(p3)
    print("All 3 manuals successfully generated in rootfolder!")
